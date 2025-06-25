import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertWorldSchema,
  insertLocationSchema,
  insertCharacterSchema,
  insertCreatureSchema,
  insertWorldRaceSchema,
  insertWorldClassSchema,
  insertWorldMagicTypeSchema,
  insertWorldLoreSchema,
  insertRegionSchema,
  insertWorldArtifactSchema,
} from "@shared/schema";
import path from "path";
import fs from "fs";
import expressFileUpload from "express-fileupload";
import { readFileSync } from "fs";
import { join } from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Temporary user ID for demo purposes (in real app, this would come from auth)
  const DEMO_USER_ID = 1;

  // Ensure demo user exists
  const demoUser = await storage.getUserByUsername("demo");
  if (!demoUser) {
    await storage.createUser({ username: "demo", password: "demo" });
  }

  app.use(expressFileUpload());

  // Handle generic /api/events call
  app.get("/api/events", (req, res) => {
    res.json([]);
  });

  // World routes
  app.get("/api/worlds", async (req, res) => {
    try {
      const worlds = await storage.getWorlds(DEMO_USER_ID);
      res.json(worlds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch worlds" });
    }
  });

  app.get("/api/worlds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const world = await storage.getWorld(id);
      if (!world) {
        return res.status(404).json({ message: "World not found" });
      }
      res.json(world);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch world" });
    }
  });

  app.post("/api/worlds", async (req, res) => {
    try {
      const worldData = insertWorldSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });
      const world = await storage.createWorld(worldData);
      // Додаємо базові дані, якщо передані
      const { races, classes, magic, locations, bestiary, artifacts } =
        req.body;
      if (Array.isArray(races) && races.length) {
        await storage.addWorldRaces(world.id, races);
      }
      if (Array.isArray(classes) && classes.length) {
        await storage.addWorldClasses(world.id, classes);
      }
      if (Array.isArray(magic) && magic.length) {
        await storage.addWorldMagicTypes(world.id, magic);
      }
      if (Array.isArray(locations) && locations.length) {
        await storage.addWorldLocationsBase(world.id, locations);
      }
      if (Array.isArray(bestiary) && bestiary.length) {
        await storage.addWorldBestiary(world.id, bestiary);
      }
      if (Array.isArray(artifacts) && artifacts.length) {
        await storage.addWorldArtifacts(world.id, artifacts);
      }
      res.status(201).json(world);
    } catch (error) {
      res.status(400).json({ message: "Invalid world data" });
    }
  });

  app.put("/api/worlds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertWorldSchema.partial().parse(req.body);
      const world = await storage.updateWorld(id, updateData);
      if (!world) {
        return res.status(404).json({ message: "World not found" });
      }
      res.json(world);
    } catch (error) {
      res.status(400).json({ message: "Invalid world data" });
    }
  });

  app.delete("/api/worlds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorld(id);
      if (!deleted) {
        return res.status(404).json({ message: "World not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete world" });
    }
  });

  // Location routes
  app.get("/api/worlds/:worldId/locations", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const locations = await storage.getLocations(worldId);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.post("/api/worlds/:worldId/locations", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const locationData = insertLocationSchema.parse({
        ...req.body,
        worldId,
      });
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      res.status(400).json({ message: "Invalid location data" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getLocation(id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });

  app.put("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertLocationSchema.partial().parse(req.body);
      const location = await storage.updateLocation(id, updateData);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(400).json({ message: "Invalid location data" });
    }
  });

  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLocation(id);
      if (!deleted) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // Character routes
  app.get("/api/worlds/:worldId/characters", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const characters = await storage.getCharacters(worldId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  app.post("/api/worlds/:worldId/characters", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const characterData = insertCharacterSchema.parse({
        ...req.body,
        worldId,
      });
      const character = await storage.createCharacter(characterData);
      res.status(201).json(character);
    } catch (error) {
      res.status(400).json({ message: "Invalid character data" });
    }
  });

  app.get("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch character" });
    }
  });

  app.put("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertCharacterSchema.partial().parse(req.body);
      const character = await storage.updateCharacter(id, updateData);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(400).json({ message: "Invalid character data" });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCharacter(id);
      if (!deleted) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete character" });
    }
  });

  // Creature routes
  app.get("/api/worlds/:worldId/creatures", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const creatures = await storage.getCreatures(worldId);
      res.json(creatures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch creatures" });
    }
  });

  app.post("/api/worlds/:worldId/creatures", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const creatureData = insertCreatureSchema.parse({
        ...req.body,
        worldId,
      });
      const creature = await storage.createCreature(creatureData);
      res.status(201).json(creature);
    } catch (error) {
      res.status(400).json({ message: "Invalid creature data" });
    }
  });

  app.get("/api/creatures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const creature = await storage.getCreature(id);
      if (!creature) {
        return res.status(404).json({ message: "Creature not found" });
      }
      res.json(creature);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch creature" });
    }
  });

  app.put("/api/creatures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertCreatureSchema.partial().parse(req.body);
      const creature = await storage.updateCreature(id, updateData);
      if (!creature) {
        return res.status(404).json({ message: "Creature not found" });
      }
      res.json(creature);
    } catch (error) {
      res.status(400).json({ message: "Invalid creature data" });
    }
  });

  app.delete("/api/creatures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCreature(id);
      if (!deleted) {
        return res.status(404).json({ message: "Creature not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete creature" });
    }
  });

  // Statistics route
  app.get("/api/worlds/:worldId/stats", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const stats = await storage.getWorldStats(worldId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch world statistics" });
    }
  });

  // Races CRUD
  app.get("/api/worlds/:worldId/races", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const races = await storage.getWorldRaces(worldId);
      res.json(races);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch races" });
    }
  });

  app.post("/api/worlds/:worldId/races", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const raceData = insertWorldRaceSchema.parse({ ...req.body, worldId });
      const race = await storage.createWorldRace(raceData);
      res.status(201).json(race);
    } catch (error) {
      res.status(400).json({ message: "Invalid race data" });
    }
  });

  app.put("/api/races/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertWorldRaceSchema.partial().parse(req.body);
      const race = await storage.updateWorldRace(id, updateData);
      if (!race) {
        return res.status(404).json({ message: "Race not found" });
      }
      res.json(race);
    } catch (error) {
      res.status(400).json({ message: "Invalid race data" });
    }
  });

  app.delete("/api/races/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorldRace(id);
      if (!deleted) {
        return res.status(404).json({ message: "Race not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete race" });
    }
  });

  // Upload race image
  app.post("/api/upload/race-image", async (req, res) => {
    const files = req.files as expressFileUpload.FileArray | undefined;
    if (!files || !files.image) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const file = files.image as expressFileUpload.UploadedFile;
    const ext = path.extname(file.name).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      return res.status(400).json({ message: "Invalid file type" });
    }
    const fileName = `race_${Date.now()}${ext}`;
    const savePath = path.join(__dirname, "../attached_assets", fileName);
    await file.mv(savePath);
    const url = `/attached_assets/${fileName}`;
    res.json({ url });
  });

  // Upload map image
  app.post("/api/upload/map-image", async (req, res) => {
    const files = req.files as expressFileUpload.FileArray | undefined;
    if (!files || !files.image) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const file = files.image as expressFileUpload.UploadedFile;
    const ext = path.extname(file.name).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp", ".svg"].includes(ext)) {
      return res.status(400).json({ message: "Invalid file type" });
    }
    const fileName = `map_${Date.now()}${ext}`;
    const savePath = path.join(__dirname, "../attached_assets", fileName);
    await file.mv(savePath);
    const url = `/attached_assets/${fileName}`;
    res.json({ url });
  });

  // Classes CRUD
  app.get("/api/worlds/:worldId/classes", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const classes = await storage.getWorldClasses(worldId);
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.post("/api/worlds/:worldId/classes", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const classData = insertWorldClassSchema.parse({ ...req.body, worldId });
      const classItem = await storage.createWorldClass(classData);
      res.status(201).json(classItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid class data" });
    }
  });

  app.put("/api/classes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertWorldClassSchema.partial().parse(req.body);
      const classItem = await storage.updateWorldClass(id, updateData);
      if (!classItem) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.json(classItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid class data" });
    }
  });

  app.delete("/api/classes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorldClass(id);
      if (!deleted) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete class" });
    }
  });

  // Magic Types CRUD
  app.get("/api/worlds/:worldId/magic", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const magic = await storage.getWorldMagicTypes(worldId);
      res.json(magic);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch magic types" });
    }
  });

  app.post("/api/worlds/:worldId/magic", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const magicData = insertWorldMagicTypeSchema.parse({
        ...req.body,
        worldId,
      });
      const magicItem = await storage.createWorldMagicType(magicData);
      res.status(201).json(magicItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid magic data" });
    }
  });

  app.put("/api/magic/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertWorldMagicTypeSchema.partial().parse(req.body);
      const magicItem = await storage.updateWorldMagicType(id, updateData);
      if (!magicItem) {
        return res.status(404).json({ message: "Magic type not found" });
      }
      res.json(magicItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid magic data" });
    }
  });

  app.delete("/api/magic/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorldMagicType(id);
      if (!deleted) {
        return res.status(404).json({ message: "Magic type not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete magic type" });
    }
  });

  // Lore CRUD
  app.get("/api/worlds/:worldId/lore", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const lore = await storage.getWorldLore(worldId);
      res.json(lore);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lore" });
    }
  });

  app.post("/api/worlds/:worldId/lore", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const loreData = insertWorldLoreSchema.parse({ ...req.body, worldId });
      const loreItem = await storage.createWorldLore(loreData);
      res.status(201).json(loreItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid lore data" });
    }
  });

  app.put("/api/lore/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertWorldLoreSchema.partial().parse(req.body);
      const loreItem = await storage.updateWorldLore(id, updateData);
      if (!loreItem) {
        return res.status(404).json({ message: "Lore not found" });
      }
      res.json(loreItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid lore data" });
    }
  });

  app.delete("/api/lore/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorldLore(id);
      if (!deleted) {
        return res.status(404).json({ message: "Lore not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lore" });
    }
  });

  // Writing CRUD
  app.get("/api/worlds/:worldId/writing", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const writing = await storage.getWorldWriting(worldId);
      res.json(writing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch writing" });
    }
  });

  app.post("/api/worlds/:worldId/writing", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const writingData = { ...req.body, worldId };
      const writingItem = await storage.createWorldWriting(writingData);
      res.status(201).json(writingItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid writing data" });
    }
  });

  app.put("/api/writing/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const writingItem = await storage.updateWorldWriting(id, updateData);
      if (!writingItem) {
        return res.status(404).json({ message: "Writing not found" });
      }
      res.json(writingItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid writing data" });
    }
  });

  app.delete("/api/writing/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorldWriting(id);
      if (!deleted) {
        return res.status(404).json({ message: "Writing not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete writing" });
    }
  });

  // Politics CRUD
  app.get("/api/worlds/:worldId/politics", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const politics = await storage.getWorldPolitics(worldId);
      res.json(politics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch politics" });
    }
  });

  app.post("/api/worlds/:worldId/politics", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const politicsData = { ...req.body, worldId };
      const politicsItem = await storage.createWorldPolitics(politicsData);
      res.status(201).json(politicsItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid politics data" });
    }
  });

  app.put("/api/politics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const politicsItem = await storage.updateWorldPolitics(id, updateData);
      if (!politicsItem) {
        return res.status(404).json({ message: "Politics not found" });
      }
      res.json(politicsItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid politics data" });
    }
  });

  app.delete("/api/politics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorldPolitics(id);
      if (!deleted) {
        return res.status(404).json({ message: "Politics not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete politics" });
    }
  });

  // History CRUD
  app.get("/api/worlds/:worldId/history", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const history = await storage.getWorldHistory(worldId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.post("/api/worlds/:worldId/history", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const historyData = { ...req.body, worldId };
      const historyItem = await storage.createWorldHistory(historyData);
      res.status(201).json(historyItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid history data" });
    }
  });

  app.put("/api/history/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const historyItem = await storage.updateWorldHistory(id, updateData);
      if (!historyItem) {
        return res.status(404).json({ message: "History not found" });
      }
      res.json(historyItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid history data" });
    }
  });

  app.delete("/api/history/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorldHistory(id);
      if (!deleted) {
        return res.status(404).json({ message: "History not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete history" });
    }
  });

  // Сценарії
  /*
  app.get("/api/worlds/:worldId/scenarios", (req, res) => {
   res.json(storage.getScenarios(req.params.worldId));
  });
  app.post("/api/worlds/:worldId/scenarios", (req, res) => {
   res.json(storage.createScenario(req.params.worldId, req.body));
  });
  app.get("/api/scenarios/:id", (req, res) => {
   const scenario = storage.getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: "Not found" });
    res.json(scenario);
  });
  app.put("/api/scenarios/:id", (req, res) => {
   const scenario = storage.updateScenario(req.params.id, req.body);
    if (!scenario) return res.status(404).json({ error: "Not found" });
    res.json(scenario);
  });
  app.delete("/api/scenarios/:id", (req, res) => {
   const ok = storage.deleteScenario(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  });
  */

  app.get("/api/docs/openapi.json", (req, res) => {
    const openapi = readFileSync(join(__dirname, "../openapi.json"), "utf-8");
    res.setHeader("Content-Type", "application/json");
    res.send(openapi);
  });

  // Regions CRUD
  app.get("/api/worlds/:worldId/regions", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const regions = await storage.getRegions(worldId);
      res.json(regions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch regions" });
    }
  });

  app.post("/api/worlds/:worldId/regions", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const regionData = insertRegionSchema.parse({ ...req.body, worldId });
      const region = await storage.createRegion(regionData);
      res.status(201).json(region);
    } catch (error) {
      res.status(400).json({ message: "Invalid region data" });
    }
  });

  app.get("/api/regions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const region = await storage.getRegion(id);
      if (!region) return res.status(404).json({ message: "Region not found" });
      res.json(region);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch region" });
    }
  });

  app.put("/api/regions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertRegionSchema.partial().parse(req.body);
      const region = await storage.updateRegion(id, updateData);
      if (!region) return res.status(404).json({ message: "Region not found" });
      res.json(region);
    } catch (error) {
      res.status(400).json({ message: "Invalid region data" });
    }
  });

  app.delete("/api/regions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRegion(id);
      if (!deleted)
        return res.status(404).json({ message: "Region not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete region" });
    }
  });

  // Artifact routes
  app.get("/api/worlds/:worldId/artifacts", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const artifacts = await storage.getWorldArtifacts(worldId);
      res.json(artifacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artifacts" });
    }
  });

  app.post("/api/worlds/:worldId/artifacts", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const artifactData = insertWorldArtifactSchema.parse({
        ...req.body,
        worldId,
      });
      const artifact = await storage.createArtifact(artifactData);
      res.status(201).json(artifact);
    } catch (error) {
      res.status(400).json({ message: "Invalid artifact data" });
    }
  });

  app.get("/api/artifacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artifact = await storage.getArtifact(id);
      if (!artifact) {
        return res.status(404).json({ message: "Artifact not found" });
      }
      res.json(artifact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artifact" });
    }
  });

  app.put("/api/artifacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertWorldArtifactSchema.partial().parse(req.body);
      const artifact = await storage.updateArtifact(id, updateData);
      if (!artifact) {
        return res.status(404).json({ message: "Artifact not found" });
      }
      res.json(artifact);
    } catch (error) {
      res.status(400).json({ message: "Invalid artifact data" });
    }
  });

  app.delete("/api/artifacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteArtifact(id);
      if (!deleted) {
        return res.status(404).json({ message: "Artifact not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete artifact" });
    }
  });

  // Timeline routes
  app.get("/api/worlds/:worldId/timelines", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const timelines = await storage.getTimelines(worldId);
      res.json(timelines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timelines" });
    }
  });
  app.post("/api/worlds/:worldId/timelines", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const timelineData = { ...req.body, worldId };
      const timeline = await storage.createTimeline(timelineData);
      res.status(201).json(timeline);
    } catch (error) {
      res.status(400).json({ message: "Invalid timeline data" });
    }
  });
  app.get("/api/timelines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const timeline = await storage.getTimeline(id);
      if (!timeline)
        return res.status(404).json({ message: "Timeline not found" });
      res.json(timeline);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timeline" });
    }
  });
  app.put("/api/timelines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const timeline = await storage.updateTimeline(id, updateData);
      if (!timeline)
        return res.status(404).json({ message: "Timeline not found" });
      res.json(timeline);
    } catch (error) {
      res.status(400).json({ message: "Invalid timeline data" });
    }
  });
  app.delete("/api/timelines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTimeline(id);
      if (!deleted)
        return res.status(404).json({ message: "Timeline not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete timeline" });
    }
  });

  // Event routes (оновлено)
  app.get("/api/worlds/:worldId/events", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const timelineId = req.query.timelineId
        ? parseInt(req.query.timelineId as string)
        : undefined;
      const events = await storage.getEvents(worldId, timelineId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  app.post("/api/worlds/:worldId/events", async (req, res) => {
    try {
      const worldId = parseInt(req.params.worldId);
      const eventData = { ...req.body, worldId };
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });
  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) return res.status(404).json({ message: "Event not found" });
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });
  app.put("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const event = await storage.updateEvent(id, updateData);
      if (!event) return res.status(404).json({ message: "Event not found" });
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });
  app.delete("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEvent(id);
      if (!deleted) return res.status(404).json({ message: "Event not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // === World Templates (Full Export) ===
  app.post("/api/world-templates", async (req, res) => {
    try {
      const template = req.body;
      if (!template || !template.name) {
        return res.status(400).json({ message: "Invalid template data" });
      }
      const filePath = path.join(__dirname, "../world-templates.json");
      let templates: any[] = [];
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        try {
          templates = JSON.parse(raw);
        } catch {
          templates = [];
        }
      }
      // Додаємо новий шаблон
      templates.push({ ...template, id: `template_${Date.now()}` });
      fs.writeFileSync(filePath, JSON.stringify(templates, null, 2), "utf-8");
      res.status(201).json({ ok: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to save template" });
    }
  });

  // AI service routes
  app.post("/api/ai/generate-names", async (req, res) => {
    try {
      const { aiService } = await import("./ai-service.js");
      const names = await aiService.generateNames(req.body);
      res.json(names);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/generate-description", async (req, res) => {
    try {
      const { aiService } = await import("./ai-service.js");
      const description = await aiService.generateDescription(req.body);
      res.send(description);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/generate-timeline", async (req, res) => {
    try {
      const { aiService } = await import("./ai-service.js");
      const { worldId, timelineName, context, count } = req.body;
      const events = await aiService.generateTimelineEvents(context, timelineName, count);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/suggest-connections", async (req, res) => {
    try {
      const { aiService } = await import("./ai-service.js");
      const { worldId } = req.body;
      
      const [characters, locations, creatures, artifacts, events] = await Promise.all([
        storage.getCharacters(worldId),
        storage.getLocations(worldId),
        storage.getCreatures(worldId),
        storage.getWorldArtifacts(worldId),
        storage.getEvents(worldId)
      ]);

      const worldData = { characters, locations, creatures, artifacts, events };
      const connections = await aiService.suggestConnections(worldData);
      res.json(connections);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics routes
  app.get("/api/worlds/:worldId/analytics", async (req, res) => {
    try {
      const { analyticsService } = await import("./analytics-service.js");
      const worldId = parseInt(req.params.worldId);
      
      const [world, characters, locations, creatures, artifacts, races, classes, events, lore] = await Promise.all([
        storage.getWorld(worldId),
        storage.getCharacters(worldId),
        storage.getLocations(worldId),
        storage.getCreatures(worldId),
        storage.getWorldArtifacts(worldId),
        storage.getWorldRaces(worldId),
        storage.getWorldClasses(worldId),
        storage.getEvents(worldId),
        storage.getWorldLore(worldId)
      ]);

      const worldData = { world, characters, locations, creatures, artifacts, races, classes, events, lore };
      const analytics = await analyticsService.analyzeWorld(worldData);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/worlds/:worldId/heatmap", async (req, res) => {
    try {
      const { analyticsService } = await import("./analytics-service.js");
      const worldId = parseInt(req.params.worldId);
      
      const [characters, locations, creatures, events] = await Promise.all([
        storage.getCharacters(worldId),
        storage.getLocations(worldId),
        storage.getCreatures(worldId),
        storage.getEvents(worldId)
      ]);

      const worldData = { characters, locations, creatures, events };
      const heatmap = analyticsService.generateHeatmap(worldData);
      res.json(heatmap);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
