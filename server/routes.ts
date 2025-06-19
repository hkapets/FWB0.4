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
} from "@shared/schema";
import path from "path";
import fs from "fs";
import expressFileUpload from "express-fileupload";
import { readFileSync } from "fs";
import { join } from "path";
import {
  getScenarios,
  createScenario,
  getScenario,
  updateScenario,
  deleteScenario,
} from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Temporary user ID for demo purposes (in real app, this would come from auth)
  const DEMO_USER_ID = 1;

  // Ensure demo user exists
  const demoUser = await storage.getUserByUsername("demo");
  if (!demoUser) {
    await storage.createUser({ username: "demo", password: "demo" });
  }

  app.use(expressFileUpload());

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

  // Сценарії
  app.get("/api/worlds/:worldId/scenarios", (req, res) => {
    res.json(getScenarios(req.params.worldId));
  });
  app.post("/api/worlds/:worldId/scenarios", (req, res) => {
    res.json(createScenario(req.params.worldId, req.body));
  });
  app.get("/api/scenarios/:id", (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: "Not found" });
    res.json(scenario);
  });
  app.put("/api/scenarios/:id", (req, res) => {
    const scenario = updateScenario(req.params.id, req.body);
    if (!scenario) return res.status(404).json({ error: "Not found" });
    res.json(scenario);
  });
  app.delete("/api/scenarios/:id", (req, res) => {
    const ok = deleteScenario(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  });

  app.get("/api/docs/openapi.json", (req, res) => {
    const openapi = readFileSync(join(__dirname, "../openapi.json"), "utf-8");
    res.setHeader("Content-Type", "application/json");
    res.send(openapi);
  });

  const httpServer = createServer(app);
  return httpServer;
}
