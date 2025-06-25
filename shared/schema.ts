import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (existing)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Worlds table
export const worlds = pgTable("worlds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  userId: integer("user_id").notNull(),
  mapImageUrl: text("map_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Locations table
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  dangerLevel: text("danger_level").notNull(),
  worldId: integer("world_id").notNull(),
  x: integer("x"),
  y: integer("y"),
  loreId: integer("lore_id"),
  characterId: integer("character_id"),
  eventId: integer("event_id"),
  artifactId: integer("artifact_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  imageUrl: text("image_url"),
});

// Characters table
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: json("name").notNull(), // { uk: string, en: string, pl: string }
  age: integer("age"),
  birthplace: json("birthplace"), // { uk: string, en: string, pl: string }
  race: text("race").notNull(),
  ethnicity: json("ethnicity"), // { uk: string, en: string, pl: string }
  description: json("description"), // { uk: string, en: string, pl: string }
  imageUrl: text("image_url"),
  family: json("family"), // { uk: string, en: string, pl: string }
  relatedCharacters: json("related_characters"), // array of character IDs
  relatedEvents: json("related_events"), // array of event IDs
  skills: json("skills"), // { uk: string, en: string, pl: string }
  worldId: integer("world_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Creatures table
export const creatures = pgTable("creatures", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  dangerLevel: text("danger_level").notNull(),
  description: text("description"),
  abilities: text("abilities").array(),
  worldId: integer("world_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// World Races
export const worldRaces = pgTable("world_races", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  imageUrl: text("image_url"),
  worldId: integer("world_id").notNull(),
});

// World Classes
export const worldClasses = pgTable("world_classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  imageUrl: text("image_url"),
  worldId: integer("world_id").notNull(),
});

// World Magic Types
export const worldMagicTypes = pgTable("world_magic_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  imageUrl: text("image_url"),
  worldId: integer("world_id").notNull(),
});

// World Base Locations (for template locations, not main locations table)
export const worldLocationsBase = pgTable("world_locations_base", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  worldId: integer("world_id").notNull(),
});

// World Bestiary
export const worldBestiary = pgTable("world_bestiary", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  worldId: integer("world_id").notNull(),
});

// World Artifacts
export const worldArtifacts = pgTable("world_artifacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  worldId: integer("world_id").notNull(),
});

// World Lore
export const worldLore = pgTable("world_lore", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull(),
  parentId: integer("parent_id"),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  imageUrl: text("image_url"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Regions table
export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  points: json("points").notNull(), // масив {x, y}
  type: text("type").notNull(),
  loreId: integer("lore_id"),
  worldId: integer("world_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Timeline table
export const timelines = pgTable("timelines", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table (додаю timelineId)
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  endDate: text("end_date"),
  type: text("type").notNull(),
  icon: text("icon"),
  image: text("image"),
  color: text("color"),
  order: integer("order"),
  worldId: integer("world_id").notNull(),
  timelineId: integer("timeline_id").notNull(),
  characterId: integer("character_id"),
  locationId: integer("location_id"),
  artifactId: integer("artifact_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertWorldSchema = createInsertSchema(worlds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreatureSchema = createInsertSchema(creatures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorldRaceSchema = createInsertSchema(worldRaces).omit({
  id: true,
});
export const insertWorldClassSchema = createInsertSchema(worldClasses).omit({
  id: true,
});
export const insertWorldMagicTypeSchema = createInsertSchema(
  worldMagicTypes
).omit({ id: true });
export const insertWorldLocationBaseSchema = createInsertSchema(
  worldLocationsBase
).omit({ id: true });
export const insertWorldBestiarySchema = createInsertSchema(worldBestiary).omit(
  { id: true }
);
export const insertWorldArtifactSchema = createInsertSchema(
  worldArtifacts
).omit({ id: true });

export const insertWorldLoreSchema = createInsertSchema(worldLore).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRegionSchema = createInsertSchema(regions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimelineSchema = createInsertSchema(timelines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type World = typeof worlds.$inferSelect;
export type InsertWorld = z.infer<typeof insertWorldSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type Creature = typeof creatures.$inferSelect;
export type InsertCreature = z.infer<typeof insertCreatureSchema>;

export type WorldRace = typeof worldRaces.$inferSelect;
export type InsertWorldRace = z.infer<typeof insertWorldRaceSchema>;
export type WorldClass = typeof worldClasses.$inferSelect;
export type InsertWorldClass = z.infer<typeof insertWorldClassSchema>;
export type WorldMagicType = typeof worldMagicTypes.$inferSelect;
export type InsertWorldMagicType = z.infer<typeof insertWorldMagicTypeSchema>;
export type WorldLocationBase = typeof worldLocationsBase.$inferSelect;
export type InsertWorldLocationBase = z.infer<
  typeof insertWorldLocationBaseSchema
>;
export type WorldBestiary = typeof worldBestiary.$inferSelect;
export type InsertWorldBestiary = z.infer<typeof insertWorldBestiarySchema>;
export type WorldArtifact = typeof worldArtifacts.$inferSelect;
export type InsertWorldArtifact = z.infer<typeof insertWorldArtifactSchema>;

export type WorldLore = typeof worldLore.$inferSelect;
export type InsertWorldLore = z.infer<typeof insertWorldLoreSchema>;

export type Region = typeof regions.$inferSelect;
export type InsertRegion = z.infer<typeof insertRegionSchema>;

export type Timeline = typeof timelines.$inferSelect;
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Scenario = {
  id: string | number;
  name: { uk: string; en: string };
  description: { uk: string; en: string };
  color?: string;
  icon?: string;
  worldId: string | number;
};

// All tables are already exported above individually
