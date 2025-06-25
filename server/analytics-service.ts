export interface WorldAnalytics {
  overview: {
    totalEntities: number;
    entityBreakdown: Record<string, number>;
    connectionsCount: number;
    completionScore: number; // 0-100
  };
  entityStats: {
    races: Array<{ name: string; count: number; percentage: number }>;
    classes: Array<{ name: string; count: number; percentage: number }>;
    locationTypes: Array<{ type: string; count: number; percentage: number }>;
    magicTypes: Array<{ type: string; count: number; percentage: number }>;
  };
  connectionMap: {
    nodes: Array<{ id: string; name: string; type: string; connections: number }>;
    edges: Array<{ from: string; to: string; type: string; strength: number }>;
  };
  gaps: {
    emptyRegions: string[];
    underutilizedElements: string[];
    missingConnections: Array<{ entities: string[]; suggestion: string }>;
  };
  timeline: {
    eventsPerPeriod: Record<string, number>;
    importanceDistribution: Record<number, number>;
    eventTypes: Record<string, number>;
  };
}

export interface HeatmapData {
  regions: Array<{
    name: string;
    activity: number; // 0-100
    entities: number;
    connections: number;
  }>;
  entityTypes: Array<{
    type: string;
    usage: number; // 0-100
    lastUpdated: string;
  }>;
}

export class AnalyticsService {
  async analyzeWorld(worldData: any): Promise<WorldAnalytics> {
    const {
      characters = [],
      locations = [],
      creatures = [],
      artifacts = [],
      races = [],
      classes = [],
      events = [],
      lore = []
    } = worldData;

    const totalEntities = characters.length + locations.length + creatures.length + artifacts.length;
    
    return {
      overview: this.calculateOverview(worldData, totalEntities),
      entityStats: this.calculateEntityStats(worldData),
      connectionMap: this.generateConnectionMap(worldData),
      gaps: this.identifyGaps(worldData),
      timeline: this.analyzeTimeline(events)
    };
  }

  generateHeatmap(worldData: any): HeatmapData {
    const { locations = [], characters = [], creatures = [], events = [] } = worldData;
    
    // Группуємо за регіонами/типами локацій
    const regionActivity: Record<string, number> = {};
    const regionEntities: Record<string, number> = {};
    
    locations.forEach((location: any) => {
      const region = location.type || 'Unknown';
      regionActivity[region] = (regionActivity[region] || 0) + 1;
      regionEntities[region] = (regionEntities[region] || 0) + 1;
    });
    
    characters.forEach((character: any) => {
      if (character.location) {
        regionActivity[character.location] = (regionActivity[character.location] || 0) + 0.5;
      }
    });
    
    events.forEach((event: any) => {
      if (event.location) {
        regionActivity[event.location] = (regionActivity[event.location] || 0) + 0.3;
      }
    });
    
    const maxActivity = Math.max(...Object.values(regionActivity));
    
    const regions = Object.keys(regionActivity).map(region => ({
      name: region,
      activity: Math.round((regionActivity[region] / maxActivity) * 100),
      entities: regionEntities[region] || 0,
      connections: this.countRegionConnections(region, worldData)
    }));
    
    const entityTypes = [
      { type: 'Characters', usage: this.calculateUsage(characters.length, 50), lastUpdated: this.getLastUpdated(characters) },
      { type: 'Locations', usage: this.calculateUsage(locations.length, 30), lastUpdated: this.getLastUpdated(locations) },
      { type: 'Creatures', usage: this.calculateUsage(creatures.length, 20), lastUpdated: this.getLastUpdated(creatures) },
      { type: 'Events', usage: this.calculateUsage(events.length, 25), lastUpdated: this.getLastUpdated(events) }
    ];
    
    return { regions, entityTypes };
  }

  private calculateOverview(worldData: any, totalEntities: number) {
    const entityBreakdown = {
      characters: worldData.characters?.length || 0,
      locations: worldData.locations?.length || 0,
      creatures: worldData.creatures?.length || 0,
      artifacts: worldData.artifacts?.length || 0,
      events: worldData.events?.length || 0,
      lore: worldData.lore?.length || 0
    };
    
    const connectionsCount = this.countTotalConnections(worldData);
    const completionScore = this.calculateCompletionScore(worldData);
    
    return {
      totalEntities,
      entityBreakdown,
      connectionsCount,
      completionScore
    };
  }

  private calculateEntityStats(worldData: any) {
    const { characters = [], locations = [], races = [], classes = [] } = worldData;
    
    // Статистика рас
    const raceStats: Record<string, number> = {};
    characters.forEach((char: any) => {
      if (char.race) {
        raceStats[char.race] = (raceStats[char.race] || 0) + 1;
      }
    });
    
    const totalChars = characters.length || 1;
    const raceArray = Object.entries(raceStats).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalChars) * 100)
    })).sort((a, b) => b.count - a.count);
    
    // Статистика класів
    const classStats: Record<string, number> = {};
    characters.forEach((char: any) => {
      if (char.class) {
        classStats[char.class] = (classStats[char.class] || 0) + 1;
      }
    });
    
    const classArray = Object.entries(classStats).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalChars) * 100)
    })).sort((a, b) => b.count - a.count);
    
    // Статистика типів локацій
    const locationTypeStats: Record<string, number> = {};
    locations.forEach((loc: any) => {
      const type = loc.type || 'Unknown';
      locationTypeStats[type] = (locationTypeStats[type] || 0) + 1;
    });
    
    const totalLocs = locations.length || 1;
    const locationArray = Object.entries(locationTypeStats).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalLocs) * 100)
    })).sort((a, b) => b.count - a.count);
    
    return {
      races: raceArray,
      classes: classArray,
      locationTypes: locationArray,
      magicTypes: [] // TODO: implement when magic system data is available
    };
  }

  private generateConnectionMap(worldData: any) {
    const nodes: Array<{ id: string; name: string; type: string; connections: number }> = [];
    const edges: Array<{ from: string; to: string; type: string; strength: number }> = [];
    
    // Додаємо вузли для всіх сутностей
    const { characters = [], locations = [], artifacts = [] } = worldData;
    
    characters.forEach((char: any, index: number) => {
      const name = char.name?.uk || char.name?.en || char.name || `Character ${index}`;
      nodes.push({
        id: `char_${char.id || index}`,
        name,
        type: 'character',
        connections: 0
      });
    });
    
    locations.forEach((loc: any, index: number) => {
      const name = loc.name?.uk || loc.name?.en || loc.name || `Location ${index}`;
      nodes.push({
        id: `loc_${loc.id || index}`,
        name,
        type: 'location',
        connections: 0
      });
    });
    
    // Генеруємо з'єднання на основі спільних атрибутів
    characters.forEach((char: any, i: number) => {
      // З'єднання персонажів з локаціями
      if (char.location) {
        const locationNode = nodes.find(n => n.type === 'location' && n.name.includes(char.location));
        if (locationNode) {
          edges.push({
            from: `char_${char.id || i}`,
            to: locationNode.id,
            type: 'location_connection',
            strength: 3
          });
        }
      }
      
      // З'єднання персонажів одієї раси
      characters.forEach((otherChar: any, j: number) => {
        if (i !== j && char.race && char.race === otherChar.race) {
          edges.push({
            from: `char_${char.id || i}`,
            to: `char_${otherChar.id || j}`,
            type: 'race_connection',
            strength: 1
          });
        }
      });
    });
    
    // Підраховуємо кількість з'єднань для кожного вузла
    nodes.forEach(node => {
      node.connections = edges.filter(edge => 
        edge.from === node.id || edge.to === node.id
      ).length;
    });
    
    return { nodes, edges };
  }

  private identifyGaps(worldData: any) {
    const emptyRegions: string[] = [];
    const underutilizedElements: string[] = [];
    const missingConnections: Array<{ entities: string[]; suggestion: string }> = [];
    
    // Аналіз порожніх регіонів
    const { locations = [], characters = [] } = worldData;
    const regionCounts: Record<string, number> = {};
    
    locations.forEach((loc: any) => {
      const region = loc.type || 'Unknown';
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });
    
    Object.entries(regionCounts).forEach(([region, count]) => {
      if (count < 2) {
        emptyRegions.push(`${region} region needs more locations`);
      }
    });
    
    // Аналіз недовикористаних елементів
    if (characters.length > 0) {
      const charactersWithoutDescription = characters.filter((char: any) => 
        !char.description || Object.keys(char.description).length === 0
      );
      if (charactersWithoutDescription.length > characters.length * 0.3) {
        underutilizedElements.push('Many characters lack detailed descriptions');
      }
    }
    
    // Пропозиції зв'язків
    if (characters.length > 1 && locations.length > 0) {
      missingConnections.push({
        entities: ['Characters', 'Locations'],
        suggestion: 'Consider adding character origins or current residences to connect them with locations'
      });
    }
    
    return { emptyRegions, underutilizedElements, missingConnections };
  }

  private analyzeTimeline(events: any[]) {
    const eventsPerPeriod: Record<string, number> = {};
    const importanceDistribution: Record<number, number> = {};
    const eventTypes: Record<string, number> = {};
    
    events.forEach((event: any) => {
      // Групуємо по періодах (століттях, ерах тощо)
      const period = this.extractPeriod(event.date);
      eventsPerPeriod[period] = (eventsPerPeriod[period] || 0) + 1;
      
      // Розподіл по важливості
      const importance = event.importance || 1;
      importanceDistribution[importance] = (importanceDistribution[importance] || 0) + 1;
      
      // Типи подій
      const type = event.type || 'general';
      eventTypes[type] = (eventTypes[type] || 0) + 1;
    });
    
    return { eventsPerPeriod, importanceDistribution, eventTypes };
  }

  private countTotalConnections(worldData: any): number {
    let connections = 0;
    const { characters = [], locations = [], events = [] } = worldData;
    
    // Підраховуємо прямі зв'язки
    characters.forEach((char: any) => {
      if (char.location) connections++;
      if (char.relationships) connections += Object.keys(char.relationships).length;
    });
    
    events.forEach((event: any) => {
      if (event.characters) connections += event.characters.length;
      if (event.locations) connections += event.locations.length;
    });
    
    return connections;
  }

  private calculateCompletionScore(worldData: any): number {
    let score = 0;
    const maxScore = 100;
    
    // Базові сутності (40 балів)
    const { characters = [], locations = [], creatures = [], artifacts = [] } = worldData;
    if (characters.length > 0) score += 10;
    if (locations.length > 0) score += 10;
    if (creatures.length > 0) score += 10;
    if (artifacts.length > 0) score += 10;
    
    // Деталізація (30 балів)
    const detailedChars = characters.filter((char: any) => 
      char.description && Object.keys(char.description).length > 0
    );
    score += Math.min(20, (detailedChars.length / Math.max(characters.length, 1)) * 20);
    
    const detailedLocs = locations.filter((loc: any) => 
      loc.description && Object.keys(loc.description).length > 0
    );
    score += Math.min(10, (detailedLocs.length / Math.max(locations.length, 1)) * 10);
    
    // Зв'язки (30 балів)
    const connections = this.countTotalConnections(worldData);
    const totalEntities = characters.length + locations.length + creatures.length + artifacts.length;
    if (totalEntities > 0) {
      score += Math.min(30, (connections / totalEntities) * 15);
    }
    
    return Math.round(score);
  }

  private countRegionConnections(region: string, worldData: any): number {
    let connections = 0;
    const { characters = [], events = [] } = worldData;
    
    characters.forEach((char: any) => {
      if (char.location === region) connections++;
    });
    
    events.forEach((event: any) => {
      if (event.location === region) connections++;
    });
    
    return connections;
  }

  private calculateUsage(count: number, ideal: number): number {
    return Math.min(100, Math.round((count / ideal) * 100));
  }

  private getLastUpdated(entities: any[]): string {
    if (entities.length === 0) return 'Never';
    
    const dates = entities
      .map(e => e.updatedAt || e.createdAt)
      .filter(date => date)
      .sort()
      .reverse();
    
    if (dates.length === 0) return 'Unknown';
    
    const lastDate = new Date(dates[0]);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  private extractPeriod(date: string): string {
    if (!date) return 'Unknown';
    
    // Простий парсинг дат (можна покращити)
    const yearMatch = date.match(/\d{3,4}/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0]);
      const century = Math.floor(year / 100) + 1;
      return `${century}th Century`;
    }
    
    // Якщо це ера або назва періоду
    return date.split(' ')[0] || 'Unknown';
  }
}

export const analyticsService = new AnalyticsService();