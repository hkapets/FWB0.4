import { storage } from "./storage";
import { worlds, characters, locations, creatures, events, worldRaces, worldMagicTypes } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface ExportData {
  world: any;
  characters: any[];
  locations: any[];
  creatures: any[];
  events: any[];
  artifacts: any[];
  races: any[];
  magicSystems: any[];
}

export class ExportService {
  // Отримання всіх даних світу для експорту
  async getWorldExportData(worldId: number): Promise<ExportData> {
    try {
      const [
        world,
        charactersData,
        locationsData,
        creaturesData,
        eventsData,
        artifactsData,
        racesData,
        magicSystemsData
      ] = await Promise.all([
        storage.getWorld(worldId),
        storage.getCharacters(worldId),
        storage.getLocations(worldId),
        storage.getCreatures(worldId),
        storage.getEvents(worldId),
        storage.getWorldArtifacts(worldId),
        storage.getWorldRaces(worldId),
        storage.getWorldMagicTypes(worldId)
      ]);

      return {
        world,
        characters: charactersData,
        locations: locationsData,
        creatures: creaturesData,
        events: eventsData,
        artifacts: artifactsData,
        races: racesData,
        magicSystems: magicSystemsData
      };
    } catch (error) {
      console.error('Error getting world export data:', error);
      throw new Error('Failed to export world data');
    }
  }

  // Генерація PDF звіту
  generatePDFStructure(data: ExportData) {
    return {
      title: data.world?.name || 'Fantasy World',
      sections: [
        {
          title: 'Огляд світу',
          content: data.world?.description || 'Опис відсутній'
        },
        {
          title: 'Персонажі',
          items: data.characters.map(char => ({
            name: char.name,
            description: char.description,
            race: char.race,
            class: char.characterClass
          }))
        },
        {
          title: 'Локації',
          items: data.locations.map(loc => ({
            name: loc.name,
            description: loc.description,
            type: loc.type,
            region: loc.region
          }))
        },
        {
          title: 'Створіння',
          items: data.creatures.map(creature => ({
            name: creature.name,
            description: creature.description,
            type: creature.type,
            habitat: creature.habitat
          }))
        },
        {
          title: 'Історичні події',
          items: data.events.map(event => ({
            name: event.name,
            description: event.description,
            date: event.date,
            importance: event.importance
          }))
        },
        {
          title: 'Артефакти',
          items: data.artifacts.map(artifact => ({
            name: artifact.name,
            description: artifact.description,
            type: artifact.type,
            rarity: artifact.rarity
          }))
        },
        {
          title: 'Раси',
          items: data.races.map(race => ({
            name: race.name,
            description: race.description,
            traits: race.traits,
            culture: race.culture
          }))
        },
        {
          title: 'Системи магії',
          items: data.magicSystems.map(magic => ({
            name: magic.name,
            description: magic.description,
            type: magic.type,
            source: magic.source
          }))
        }
      ]
    };
  }

  // Генерація структури для DOCX
  generateDOCXStructure(data: ExportData) {
    return {
      title: data.world?.name || 'Fantasy World Compendium',
      author: 'Fantasy World Builder',
      sections: this.generatePDFStructure(data).sections
    };
  }
}

export const exportService = new ExportService();