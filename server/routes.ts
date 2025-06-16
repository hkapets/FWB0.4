import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertWorldSchema, 
  insertLocationSchema, 
  insertCharacterSchema, 
  insertCreatureSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Temporary user ID for demo purposes (in real app, this would come from auth)
  const DEMO_USER_ID = 1;

  // Ensure demo user exists
  const demoUser = await storage.getUserByUsername("demo");
  if (!demoUser) {
    await storage.createUser({ username: "demo", password: "demo" });
  }

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

  const httpServer = createServer(app);
  return httpServer;
}
