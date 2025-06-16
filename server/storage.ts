import { 
  users, 
  worlds, 
  locations, 
  characters, 
  creatures,
  type User, 
  type InsertUser,
  type World,
  type InsertWorld,
  type Location,
  type InsertLocation,
  type Character,
  type InsertCharacter,
  type Creature,
  type InsertCreature
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // World methods
  getWorlds(userId: number): Promise<World[]>;
  getWorld(id: number): Promise<World | undefined>;
  createWorld(world: InsertWorld): Promise<World>;
  updateWorld(id: number, world: Partial<InsertWorld>): Promise<World | undefined>;
  deleteWorld(id: number): Promise<boolean>;

  // Location methods
  getLocations(worldId: number): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;

  // Character methods
  getCharacters(worldId: number): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;

  // Creature methods
  getCreatures(worldId: number): Promise<Creature[]>;
  getCreature(id: number): Promise<Creature | undefined>;
  createCreature(creature: InsertCreature): Promise<Creature>;
  updateCreature(id: number, creature: Partial<InsertCreature>): Promise<Creature | undefined>;
  deleteCreature(id: number): Promise<boolean>;

  // Statistics
  getWorldStats(worldId: number): Promise<{
    locations: number;
    characters: number;
    creatures: number;
    total: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private worlds: Map<number, World>;
  private locations: Map<number, Location>;
  private characters: Map<number, Character>;
  private creatures: Map<number, Creature>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.worlds = new Map();
    this.locations = new Map();
    this.characters = new Map();
    this.creatures = new Map();
    this.currentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // World methods
  async getWorlds(userId: number): Promise<World[]> {
    return Array.from(this.worlds.values()).filter(
      (world) => world.userId === userId
    );
  }

  async getWorld(id: number): Promise<World | undefined> {
    return this.worlds.get(id);
  }

  async createWorld(insertWorld: InsertWorld): Promise<World> {
    const id = this.currentId++;
    const now = new Date();
    const world: World = { 
      ...insertWorld, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.worlds.set(id, world);
    return world;
  }

  async updateWorld(id: number, updateData: Partial<InsertWorld>): Promise<World | undefined> {
    const world = this.worlds.get(id);
    if (!world) return undefined;

    const updatedWorld: World = { 
      ...world, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.worlds.set(id, updatedWorld);
    return updatedWorld;
  }

  async deleteWorld(id: number): Promise<boolean> {
    return this.worlds.delete(id);
  }

  // Location methods
  async getLocations(worldId: number): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.worldId === worldId
    );
  }

  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentId++;
    const now = new Date();
    const location: Location = { 
      ...insertLocation, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.locations.set(id, location);
    return location;
  }

  async updateLocation(id: number, updateData: Partial<InsertLocation>): Promise<Location | undefined> {
    const location = this.locations.get(id);
    if (!location) return undefined;

    const updatedLocation: Location = { 
      ...location, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }

  // Character methods
  async getCharacters(worldId: number): Promise<Character[]> {
    return Array.from(this.characters.values()).filter(
      (character) => character.worldId === worldId
    );
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = this.currentId++;
    const now = new Date();
    const character: Character = { 
      ...insertCharacter, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.characters.set(id, character);
    return character;
  }

  async updateCharacter(id: number, updateData: Partial<InsertCharacter>): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (!character) return undefined;

    const updatedCharacter: Character = { 
      ...character, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    return this.characters.delete(id);
  }

  // Creature methods
  async getCreatures(worldId: number): Promise<Creature[]> {
    return Array.from(this.creatures.values()).filter(
      (creature) => creature.worldId === worldId
    );
  }

  async getCreature(id: number): Promise<Creature | undefined> {
    return this.creatures.get(id);
  }

  async createCreature(insertCreature: InsertCreature): Promise<Creature> {
    const id = this.currentId++;
    const now = new Date();
    const creature: Creature = { 
      ...insertCreature, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.creatures.set(id, creature);
    return creature;
  }

  async updateCreature(id: number, updateData: Partial<InsertCreature>): Promise<Creature | undefined> {
    const creature = this.creatures.get(id);
    if (!creature) return undefined;

    const updatedCreature: Creature = { 
      ...creature, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.creatures.set(id, updatedCreature);
    return updatedCreature;
  }

  async deleteCreature(id: number): Promise<boolean> {
    return this.creatures.delete(id);
  }

  // Statistics
  async getWorldStats(worldId: number): Promise<{
    locations: number;
    characters: number;
    creatures: number;
    total: number;
  }> {
    const locations = await this.getLocations(worldId);
    const characters = await this.getCharacters(worldId);
    const creatures = await this.getCreatures(worldId);

    return {
      locations: locations.length,
      characters: characters.length,
      creatures: creatures.length,
      total: locations.length + characters.length + creatures.length,
    };
  }
}

export const storage = new MemStorage();
