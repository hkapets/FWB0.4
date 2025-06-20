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
  type InsertCreature,
  worldRaces,
  worldClasses,
  worldMagicTypes,
  worldLocationsBase,
  worldBestiary,
  worldArtifacts,
  type InsertWorldRace,
  type InsertWorldClass,
  type InsertWorldMagicType,
  type InsertWorldLocationBase,
  type InsertWorldBestiary,
  type InsertWorldArtifact,
  WorldRace,
  WorldClass,
  WorldMagicType,
  WorldLore,
  type InsertWorldLore,
  type Region,
  type InsertRegion,
  type WorldArtifact,
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
  updateWorld(
    id: number,
    world: Partial<InsertWorld>
  ): Promise<World | undefined>;
  deleteWorld(id: number): Promise<boolean>;

  // Location methods
  getLocations(worldId: number): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(
    id: number,
    location: Partial<InsertLocation>
  ): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;

  // Character methods
  getCharacters(worldId: number): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(
    id: number,
    character: Partial<InsertCharacter>
  ): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;

  // Creature methods
  getCreatures(worldId: number): Promise<Creature[]>;
  getCreature(id: number): Promise<Creature | undefined>;
  createCreature(creature: InsertCreature): Promise<Creature>;
  updateCreature(
    id: number,
    creature: Partial<InsertCreature>
  ): Promise<Creature | undefined>;
  deleteCreature(id: number): Promise<boolean>;

  // Statistics
  getWorldStats(worldId: number): Promise<{
    locations: number;
    characters: number;
    creatures: number;
    total: number;
  }>;

  addWorldRaces(worldId: number, races: string[]): Promise<void>;
  addWorldClasses(worldId: number, classes: string[]): Promise<void>;
  addWorldMagicTypes(worldId: number, magic: string[]): Promise<void>;
  addWorldLocationsBase(worldId: number, locations: string[]): Promise<void>;
  addWorldBestiary(worldId: number, bestiary: string[]): Promise<void>;
  addWorldArtifacts(worldId: number, artifacts: string[]): Promise<void>;

  getWorldRaces(worldId: number): Promise<WorldRace[]>;
  createWorldRace(race: InsertWorldRace): Promise<WorldRace>;
  updateWorldRace(
    id: number,
    update: Partial<InsertWorldRace>
  ): Promise<WorldRace | undefined>;
  deleteWorldRace(id: number): Promise<boolean>;

  getWorldClasses(worldId: number): Promise<WorldClass[]>;
  createWorldClass(classData: InsertWorldClass): Promise<WorldClass>;
  updateWorldClass(
    id: number,
    update: Partial<InsertWorldClass>
  ): Promise<WorldClass | undefined>;
  deleteWorldClass(id: number): Promise<boolean>;

  getWorldMagicTypes(worldId: number): Promise<WorldMagicType[]>;
  createWorldMagicType(
    magicData: InsertWorldMagicType
  ): Promise<WorldMagicType>;
  updateWorldMagicType(
    id: number,
    update: Partial<InsertWorldMagicType>
  ): Promise<WorldMagicType | undefined>;
  deleteWorldMagicType(id: number): Promise<boolean>;

  getWorldLore(worldId: number): Promise<WorldLore[]>;
  createWorldLore(loreData: InsertWorldLore): Promise<WorldLore>;
  updateWorldLore(
    id: number,
    update: Partial<InsertWorldLore>
  ): Promise<WorldLore | undefined>;
  deleteWorldLore(id: number): Promise<boolean>;

  // Region methods
  getRegions(worldId: number): Promise<Region[]>;
  getRegion(id: number): Promise<Region | undefined>;
  createRegion(insertRegion: InsertRegion): Promise<Region>;
  updateRegion(
    id: number,
    updateData: Partial<InsertRegion>
  ): Promise<Region | undefined>;
  deleteRegion(id: number): Promise<boolean>;

  getWorldArtifacts(worldId: number): Promise<WorldArtifact[]>;
  getArtifact(id: number): Promise<WorldArtifact | undefined>;
  createArtifact(data: InsertWorldArtifact): Promise<WorldArtifact>;
  updateArtifact(
    id: number,
    data: Partial<InsertWorldArtifact>
  ): Promise<WorldArtifact | undefined>;
  deleteArtifact(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private worlds: Map<number, World>;
  private locations: Map<number, Location>;
  private characters: Map<number, Character>;
  private creatures: Map<number, Creature>;
  private currentId: number;
  private worldRaces: Map<number, string[]> = new Map();
  private worldClasses: Map<number, string[]> = new Map();
  private worldMagicTypes: Map<number, string[]> = new Map();
  private worldLocationsBase: Map<number, string[]> = new Map();
  private worldBestiary: Map<number, string[]> = new Map();
  private worldArtifacts: Map<number, string[]> = new Map();
  private worldRacesData: Map<number, WorldRace[]> = new Map();
  private worldClassesData: Map<number, WorldClass[]> = new Map();
  private worldMagicTypesData: Map<number, WorldMagicType[]> = new Map();
  private worldLoreData: Map<number, WorldLore[]> = new Map();
  private regions: Map<number, Region> = new Map();
  private worldArtifactsData: Map<number, WorldArtifact[]> = new Map();

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
      (user) => user.username === username
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
      updatedAt: now,
      description: insertWorld.description ?? null,
    };
    this.worlds.set(id, world);
    return world;
  }

  async updateWorld(
    id: number,
    updateData: Partial<InsertWorld>
  ): Promise<World | undefined> {
    const world = this.worlds.get(id);
    if (!world) return undefined;

    const updatedWorld: World = {
      ...world,
      ...updateData,
      updatedAt: new Date(),
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
      updatedAt: now,
      description: insertLocation.description ?? null,
      x: insertLocation.x ?? null,
      y: insertLocation.y ?? null,
      loreId:
        insertLocation.loreId !== undefined ? insertLocation.loreId : null,
      imageUrl: insertLocation.imageUrl ?? null,
    };
    this.locations.set(id, location);
    return location;
  }

  async updateLocation(
    id: number,
    updateData: Partial<InsertLocation>
  ): Promise<Location | undefined> {
    const location = this.locations.get(id);
    if (!location) return undefined;

    const updatedLocation: Location = {
      ...location,
      ...updateData,
      updatedAt: new Date(),
      x: updateData.x ?? location.x,
      y: updateData.y ?? location.y,
      loreId:
        updateData.loreId !== undefined
          ? updateData.loreId
          : location.loreId !== undefined
          ? location.loreId
          : null,
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
      updatedAt: now,
      description: insertCharacter.description ?? null,
      level: insertCharacter.level ?? 1,
    };
    this.characters.set(id, character);
    return character;
  }

  async updateCharacter(
    id: number,
    updateData: Partial<InsertCharacter>
  ): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (!character) return undefined;

    const updatedCharacter: Character = {
      ...character,
      ...updateData,
      updatedAt: new Date(),
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
      updatedAt: now,
      description: insertCreature.description ?? null,
      abilities: insertCreature.abilities ?? null,
    };
    this.creatures.set(id, creature);
    return creature;
  }

  async updateCreature(
    id: number,
    updateData: Partial<InsertCreature>
  ): Promise<Creature | undefined> {
    const creature = this.creatures.get(id);
    if (!creature) return undefined;

    const updatedCreature: Creature = {
      ...creature,
      ...updateData,
      updatedAt: new Date(),
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

  async addWorldRaces(worldId: number, races: string[]): Promise<void> {
    this.worldRaces.set(worldId, races);
  }

  async addWorldClasses(worldId: number, classes: string[]): Promise<void> {
    this.worldClasses.set(worldId, classes);
  }

  async addWorldMagicTypes(worldId: number, magic: string[]): Promise<void> {
    this.worldMagicTypes.set(worldId, magic);
  }

  async addWorldLocationsBase(
    worldId: number,
    locations: string[]
  ): Promise<void> {
    this.worldLocationsBase.set(worldId, locations);
  }

  async addWorldBestiary(worldId: number, bestiary: string[]): Promise<void> {
    this.worldBestiary.set(worldId, bestiary);
  }

  async addWorldArtifacts(worldId: number, artifacts: string[]): Promise<void> {
    this.worldArtifacts.set(worldId, artifacts);
  }

  async getWorldRaces(worldId: number): Promise<WorldRace[]> {
    return this.worldRacesData.get(worldId) || [];
  }

  async createWorldRace(race: InsertWorldRace): Promise<WorldRace> {
    const id = this.currentId++;
    const newRace: WorldRace = {
      ...race,
      id,
      description: race.description ?? null,
      icon: race.icon ?? null,
      imageUrl: race.imageUrl ?? null,
    };
    const races = this.worldRacesData.get(race.worldId) || [];
    this.worldRacesData.set(race.worldId, [...races, newRace]);
    return newRace;
  }

  async updateWorldRace(
    id: number,
    update: Partial<InsertWorldRace>
  ): Promise<WorldRace | undefined> {
    for (const [worldId, races] of Array.from(this.worldRacesData.entries())) {
      const idx = races.findIndex((r: WorldRace) => r.id === id);
      if (idx !== -1) {
        const updated: WorldRace = { ...races[idx], ...update };
        races[idx] = updated;
        this.worldRacesData.set(worldId, [...races]);
        return updated;
      }
    }
    return undefined;
  }

  async deleteWorldRace(id: number): Promise<boolean> {
    for (const [worldId, races] of Array.from(this.worldRacesData.entries())) {
      const idx = races.findIndex((r: WorldRace) => r.id === id);
      if (idx !== -1) {
        races.splice(idx, 1);
        this.worldRacesData.set(worldId, [...races]);
        return true;
      }
    }
    return false;
  }

  async getWorldClasses(worldId: number): Promise<WorldClass[]> {
    return this.worldClassesData.get(worldId) || [];
  }

  async createWorldClass(classData: InsertWorldClass): Promise<WorldClass> {
    const id = this.currentId++;
    const newClass: WorldClass = {
      ...classData,
      id,
      description: classData.description ?? null,
      icon: classData.icon ?? null,
      imageUrl: classData.imageUrl ?? null,
    };
    const classes = this.worldClassesData.get(classData.worldId) || [];
    this.worldClassesData.set(classData.worldId, [...classes, newClass]);
    return newClass;
  }

  async updateWorldClass(
    id: number,
    update: Partial<InsertWorldClass>
  ): Promise<WorldClass | undefined> {
    for (const [worldId, classes] of Array.from(
      this.worldClassesData.entries()
    )) {
      const idx = classes.findIndex((c: WorldClass) => c.id === id);
      if (idx !== -1) {
        const updated: WorldClass = { ...classes[idx], ...update };
        classes[idx] = updated;
        this.worldClassesData.set(worldId, [...classes]);
        return updated;
      }
    }
    return undefined;
  }

  async deleteWorldClass(id: number): Promise<boolean> {
    for (const [worldId, classes] of Array.from(
      this.worldClassesData.entries()
    )) {
      const idx = classes.findIndex((c: WorldClass) => c.id === id);
      if (idx !== -1) {
        classes.splice(idx, 1);
        this.worldClassesData.set(worldId, [...classes]);
        return true;
      }
    }
    return false;
  }

  async getWorldMagicTypes(worldId: number): Promise<WorldMagicType[]> {
    return this.worldMagicTypesData.get(worldId) || [];
  }

  async createWorldMagicType(
    magicData: InsertWorldMagicType
  ): Promise<WorldMagicType> {
    const id = this.currentId++;
    const newMagic: WorldMagicType = {
      ...magicData,
      id,
      description: magicData.description ?? null,
      icon: magicData.icon ?? null,
      imageUrl: magicData.imageUrl ?? null,
    };
    const magicTypes = this.worldMagicTypesData.get(magicData.worldId) || [];
    this.worldMagicTypesData.set(magicData.worldId, [...magicTypes, newMagic]);
    return newMagic;
  }

  async updateWorldMagicType(
    id: number,
    update: Partial<InsertWorldMagicType>
  ): Promise<WorldMagicType | undefined> {
    for (const [worldId, magicTypes] of Array.from(
      this.worldMagicTypesData.entries()
    )) {
      const idx = magicTypes.findIndex((m: WorldMagicType) => m.id === id);
      if (idx !== -1) {
        const updated: WorldMagicType = { ...magicTypes[idx], ...update };
        magicTypes[idx] = updated;
        this.worldMagicTypesData.set(worldId, [...magicTypes]);
        return updated;
      }
    }
    return undefined;
  }

  async deleteWorldMagicType(id: number): Promise<boolean> {
    for (const [worldId, magicTypes] of Array.from(
      this.worldMagicTypesData.entries()
    )) {
      const idx = magicTypes.findIndex((m: WorldMagicType) => m.id === id);
      if (idx !== -1) {
        magicTypes.splice(idx, 1);
        this.worldMagicTypesData.set(worldId, [...magicTypes]);
        return true;
      }
    }
    return false;
  }

  async getWorldLore(worldId: number): Promise<WorldLore[]> {
    return this.worldLoreData.get(worldId) || [];
  }

  async createWorldLore(loreData: InsertWorldLore): Promise<WorldLore> {
    const id = this.currentId++;
    const now = new Date();
    const newLore: WorldLore = {
      ...loreData,
      id,
      createdAt: now,
      updatedAt: now,
      description: loreData.description ?? null,
      icon: loreData.icon ?? null,
      imageUrl: loreData.imageUrl ?? null,
      order: loreData.order ?? 0,
      parentId: loreData.parentId !== undefined ? loreData.parentId : null,
    };
    const loreItems = this.worldLoreData.get(loreData.worldId) || [];
    this.worldLoreData.set(loreData.worldId, [...loreItems, newLore]);
    return newLore;
  }

  async updateWorldLore(
    id: number,
    update: Partial<InsertWorldLore>
  ): Promise<WorldLore | undefined> {
    for (const [worldId, loreItems] of Array.from(
      this.worldLoreData.entries()
    )) {
      const idx = loreItems.findIndex((l: WorldLore) => l.id === id);
      if (idx !== -1) {
        const updated: WorldLore = {
          ...loreItems[idx],
          ...update,
          updatedAt: new Date(),
          parentId:
            update.parentId !== undefined
              ? update.parentId
              : loreItems[idx].parentId !== undefined
              ? loreItems[idx].parentId
              : null,
        };
        loreItems[idx] = updated;
        this.worldLoreData.set(worldId, [...loreItems]);
        return updated;
      }
    }
    return undefined;
  }

  async deleteWorldLore(id: number): Promise<boolean> {
    for (const [worldId, loreItems] of Array.from(
      this.worldLoreData.entries()
    )) {
      const idx = loreItems.findIndex((l: WorldLore) => l.id === id);
      if (idx !== -1) {
        loreItems.splice(idx, 1);
        this.worldLoreData.set(worldId, [...loreItems]);
        return true;
      }
    }
    return false;
  }

  // Region methods
  async getRegions(worldId: number): Promise<Region[]> {
    return Array.from(this.regions.values()).filter(
      (r) => r.worldId === worldId
    );
  }

  async getRegion(id: number): Promise<Region | undefined> {
    return this.regions.get(id);
  }

  async createRegion(insertRegion: InsertRegion): Promise<Region> {
    const id = this.currentId++;
    const now = new Date();
    const region: Region = {
      ...insertRegion,
      id,
      createdAt: now,
      updatedAt: now,
      loreId: insertRegion.loreId !== undefined ? insertRegion.loreId : null,
    };
    this.regions.set(id, region);
    return region;
  }

  async updateRegion(
    id: number,
    updateData: Partial<InsertRegion>
  ): Promise<Region | undefined> {
    const region = this.regions.get(id);
    if (!region) return undefined;
    const updatedRegion: Region = {
      ...region,
      ...updateData,
      updatedAt: new Date(),
    };
    this.regions.set(id, updatedRegion);
    return updatedRegion;
  }

  async deleteRegion(id: number): Promise<boolean> {
    return this.regions.delete(id);
  }

  async getWorldArtifacts(worldId: number): Promise<WorldArtifact[]> {
    return this.worldArtifactsData.get(worldId) || [];
  }

  async getArtifact(id: number): Promise<WorldArtifact | undefined> {
    for (const artifacts of Array.from(this.worldArtifactsData.values())) {
      const found = artifacts.find((a: WorldArtifact) => a.id === id);
      if (found) return found;
    }
    return undefined;
  }

  async createArtifact(data: InsertWorldArtifact): Promise<WorldArtifact> {
    const id = this.currentId++;
    const artifact: WorldArtifact = { ...data, id };
    const arr = this.worldArtifactsData.get(data.worldId) || [];
    this.worldArtifactsData.set(data.worldId, [...arr, artifact]);
    return artifact;
  }

  async updateArtifact(
    id: number,
    data: Partial<InsertWorldArtifact>
  ): Promise<WorldArtifact | undefined> {
    for (const [worldId, artifacts] of Array.from(
      this.worldArtifactsData.entries()
    )) {
      const idx = artifacts.findIndex((a: WorldArtifact) => a.id === id);
      if (idx !== -1) {
        const updated: WorldArtifact = { ...artifacts[idx], ...data };
        artifacts[idx] = updated;
        this.worldArtifactsData.set(worldId, [...artifacts]);
        return updated;
      }
    }
    return undefined;
  }

  async deleteArtifact(id: number): Promise<boolean> {
    for (const [worldId, artifacts] of Array.from(
      this.worldArtifactsData.entries()
    )) {
      const idx = artifacts.findIndex((a: WorldArtifact) => a.id === id);
      if (idx !== -1) {
        artifacts.splice(idx, 1);
        this.worldArtifactsData.set(worldId, [...artifacts]);
        return true;
      }
    }
    return false;
  }
}

export const storage = new MemStorage();

// Events (таймлайн)
let events: any[] = [];

export function getEvents(worldId: string) {
  return events.filter((e) => e.worldId === worldId);
}
export function getEvent(id: string) {
  return events.find((e) => e.id === id);
}
export function createEvent(worldId: string, data: any) {
  const event = { ...data, id: Date.now().toString(), worldId };
  events.push(event);
  return event;
}
export function updateEvent(id: string, data: any) {
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  events[idx] = { ...events[idx], ...data };
  return events[idx];
}
export function deleteEvent(id: string) {
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  events.splice(idx, 1);
  return true;
}

// Scenarios
let scenarios: any[] = [];
export function getScenarios(worldId: string) {
  return scenarios.filter((s) => s.worldId === worldId);
}
export function getScenario(id: string) {
  return scenarios.find((s) => s.id === id);
}
export function createScenario(worldId: string, data: any) {
  const scenario = { ...data, id: Date.now().toString(), worldId };
  scenarios.push(scenario);
  return scenario;
}
export function updateScenario(id: string, data: any) {
  const idx = scenarios.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  scenarios[idx] = { ...scenarios[idx], ...data };
  return scenarios[idx];
}
export function deleteScenario(id: string) {
  const idx = scenarios.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  scenarios.splice(idx, 1);
  return true;
}
