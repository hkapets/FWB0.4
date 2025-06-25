export interface Recommendation {
  id: string;
  type: 'content' | 'improvement' | 'connection' | 'expansion';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  actionable: boolean;
  estimatedTime: number; // minutes
  relatedEntities: string[];
}

export interface ContentSuggestion {
  elementType: 'character' | 'location' | 'creature' | 'event' | 'artifact';
  suggestedName: string;
  reasoning: string;
  template: any;
}

export class RecommendationEngine {
  private ukrainianNames = {
    characters: ['Олексій', 'Марія', 'Богдан', 'Анна', 'Василь', 'Катерина', 'Ігор', 'Ольга'],
    locations: ['Золотогір', 'Срібний ліс', 'Кам\'яний Град', 'Тихе озеро', 'Високі вершини'],
    creatures: ['Лісовик', 'Водяник', 'Вогняна птиця', 'Крижаний вовк', 'Тіньовий кіт']
  };

  private polishNames = {
    characters: ['Aleksander', 'Maria', 'Wojciech', 'Anna', 'Piotr', 'Katarzyna', 'Jan', 'Agnieszka'],
    locations: ['Złoty Gród', 'Srebrny Las', 'Kamienny Grad', 'Ciche Jezioro', 'Wysokie Szczyty'],
    creatures: ['Leśny Strażnik', 'Wodnik', 'Ognisty Ptak', 'Lodowy Wilk', 'Cienisty Kot']
  };

  private englishNames = {
    characters: ['Alexander', 'Mary', 'William', 'Anna', 'Peter', 'Catherine', 'John', 'Agnes'],
    locations: ['Golden Heights', 'Silver Forest', 'Stone City', 'Quiet Lake', 'High Peaks'],
    creatures: ['Forest Guardian', 'Water Spirit', 'Fire Bird', 'Ice Wolf', 'Shadow Cat']
  };

  analyzeWorldGaps(worldData: any, language: 'uk' | 'pl' | 'en' = 'uk'): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Аналіз балансу сутностей
    const entityCounts = {
      characters: worldData.characters?.length || 0,
      locations: worldData.locations?.length || 0,
      creatures: worldData.creatures?.length || 0,
      events: worldData.events?.length || 0,
      artifacts: worldData.artifacts?.length || 0
    };

    const total = Object.values(entityCounts).reduce((a, b) => a + b, 0);
    if (total === 0) {
      recommendations.push(this.createStarterRecommendation(language));
      return recommendations;
    }

    // Рекомендації на основі дисбалансу
    if (entityCounts.characters < 3) {
      recommendations.push(this.createCharacterRecommendation(worldData, language));
    }

    if (entityCounts.locations < 2) {
      recommendations.push(this.createLocationRecommendation(worldData, language));
    }

    if (entityCounts.events < 1) {
      recommendations.push(this.createEventRecommendation(worldData, language));
    }

    // Аналіз зв'язків
    const connectionGaps = this.findConnectionGaps(worldData);
    connectionGaps.forEach(gap => {
      recommendations.push(this.createConnectionRecommendation(gap, language));
    });

    // Аналіз глибини контенту
    const depthIssues = this.findDepthIssues(worldData);
    depthIssues.forEach(issue => {
      recommendations.push(this.createDepthRecommendation(issue, language));
    });

    return recommendations.sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));
  }

  suggestCharacterDevelopment(character: any, language: 'uk' | 'pl' | 'en' = 'uk'): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    if (!character) return recommendations;

    // Перевірка базових полів
    if (!character.background || character.background.length < 50) {
      recommendations.push({
        id: `char-bg-${character.id}`,
        type: 'improvement',
        title: this.getLocalizedText('expandBackground', language),
        description: this.getLocalizedText('backgroundSuggestion', language),
        priority: 'medium',
        category: 'character',
        actionable: true,
        estimatedTime: 15,
        relatedEntities: [character.id]
      });
    }

    if (!character.personality || character.personality.length < 30) {
      recommendations.push({
        id: `char-pers-${character.id}`,
        type: 'improvement',
        title: this.getLocalizedText('addPersonality', language),
        description: this.getLocalizedText('personalitySuggestion', language),
        priority: 'high',
        category: 'character',
        actionable: true,
        estimatedTime: 10,
        relatedEntities: [character.id]
      });
    }

    // Аналіз зв'язків
    if (!character.relationships || character.relationships.length === 0) {
      recommendations.push({
        id: `char-rel-${character.id}`,
        type: 'connection',
        title: this.getLocalizedText('addRelationships', language),
        description: this.getLocalizedText('relationshipSuggestion', language),
        priority: 'medium',
        category: 'character',
        actionable: true,
        estimatedTime: 5,
        relatedEntities: [character.id]
      });
    }

    return recommendations;
  }

  generatePlotHooks(worldData: any, language: 'uk' | 'pl' | 'en' = 'uk'): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    if (!worldData.characters || !worldData.locations) return recommendations;

    // Конфлікти між персонажами
    const characters = worldData.characters;
    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        const char1 = characters[i];
        const char2 = characters[j];
        
        // Перевірка потенційних конфліктів
        if (this.couldHaveConflict(char1, char2)) {
          recommendations.push({
            id: `conflict-${char1.id}-${char2.id}`,
            type: 'content',
            title: this.getLocalizedText('potentialConflict', language),
            description: this.getLocalizedText('conflictSuggestion', language, [char1.name, char2.name]),
            priority: 'medium',
            category: 'plot',
            actionable: true,
            estimatedTime: 20,
            relatedEntities: [char1.id, char2.id]
          });
        }
      }
    }

    // Таємниці локацій
    worldData.locations?.forEach((location: any) => {
      if (!location.secrets || location.secrets.length === 0) {
        recommendations.push({
          id: `secret-${location.id}`,
          type: 'content',
          title: this.getLocalizedText('addLocationSecret', language),
          description: this.getLocalizedText('secretSuggestion', language, [location.name]),
          priority: 'low',
          category: 'plot',
          actionable: true,
          estimatedTime: 10,
          relatedEntities: [location.id]
        });
      }
    });

    return recommendations;
  }

  recommendWorldExpansion(worldData: any, language: 'uk' | 'pl' | 'en' = 'uk'): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Аналіз географічного балансу
    const locationTypes = this.analyzeLocationTypes(worldData.locations || []);
    
    if (locationTypes.cities < 1) {
      recommendations.push(this.createExpansionRecommendation('city', language));
    }
    
    if (locationTypes.wilderness < 1) {
      recommendations.push(this.createExpansionRecommendation('wilderness', language));
    }
    
    if (locationTypes.dungeons < 1) {
      recommendations.push(this.createExpansionRecommendation('dungeon', language));
    }

    // Культурне різноманіття
    const cultures = this.analyzeCultures(worldData);
    if (cultures.length < 2) {
      recommendations.push(this.createCultureRecommendation(language));
    }

    return recommendations;
  }

  findHiddenConnections(worldData: any): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Алгоритм знаходження потенційних зв'язків
    const entities = [
      ...(worldData.characters || []).map((c: any) => ({ ...c, type: 'character' })),
      ...(worldData.locations || []).map((l: any) => ({ ...l, type: 'location' })),
      ...(worldData.events || []).map((e: any) => ({ ...e, type: 'event' }))
    ];

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const similarity = this.calculateSimilarity(entities[i], entities[j]);
        
        if (similarity > 0.6) {
          recommendations.push({
            id: `connection-${entities[i].id}-${entities[j].id}`,
            type: 'connection',
            title: 'Потенційний зв\'язок',
            description: `${entities[i].name} та ${entities[j].name} мають схожі характеристики. Розгляньте можливість створення зв'язку між ними.`,
            priority: 'low',
            category: 'connection',
            actionable: true,
            estimatedTime: 5,
            relatedEntities: [entities[i].id, entities[j].id]
          });
        }
      }
    }

    return recommendations;
  }

  private createStarterRecommendation(language: 'uk' | 'pl' | 'en'): Recommendation {
    return {
      id: 'starter-world',
      type: 'content',
      title: this.getLocalizedText('startWorld', language),
      description: this.getLocalizedText('startWorldDesc', language),
      priority: 'high',
      category: 'world',
      actionable: true,
      estimatedTime: 30,
      relatedEntities: []
    };
  }

  private createCharacterRecommendation(worldData: any, language: 'uk' | 'pl' | 'en'): Recommendation {
    const names = this.getNames(language);
    const suggestedName = names.characters[Math.floor(Math.random() * names.characters.length)];
    
    return {
      id: 'add-character',
      type: 'content',
      title: this.getLocalizedText('addCharacter', language),
      description: this.getLocalizedText('characterSuggestion', language, [suggestedName]),
      priority: 'high',
      category: 'character',
      actionable: true,
      estimatedTime: 20,
      relatedEntities: []
    };
  }

  private createLocationRecommendation(worldData: any, language: 'uk' | 'pl' | 'en'): Recommendation {
    const names = this.getNames(language);
    const suggestedName = names.locations[Math.floor(Math.random() * names.locations.length)];
    
    return {
      id: 'add-location',
      type: 'content',
      title: this.getLocalizedText('addLocation', language),
      description: this.getLocalizedText('locationSuggestion', language, [suggestedName]),
      priority: 'medium',
      category: 'location',
      actionable: true,
      estimatedTime: 15,
      relatedEntities: []
    };
  }

  private createEventRecommendation(worldData: any, language: 'uk' | 'pl' | 'en'): Recommendation {
    return {
      id: 'add-event',
      type: 'content',
      title: this.getLocalizedText('addEvent', language),
      description: this.getLocalizedText('eventSuggestion', language),
      priority: 'medium',
      category: 'event',
      actionable: true,
      estimatedTime: 10,
      relatedEntities: []
    };
  }

  private createConnectionRecommendation(gap: any, language: 'uk' | 'pl' | 'en'): Recommendation {
    return {
      id: `connection-gap-${gap.id}`,
      type: 'connection',
      title: this.getLocalizedText('missingConnection', language),
      description: gap.description,
      priority: 'low',
      category: 'connection',
      actionable: true,
      estimatedTime: 5,
      relatedEntities: gap.entities
    };
  }

  private createDepthRecommendation(issue: any, language: 'uk' | 'pl' | 'en'): Recommendation {
    return {
      id: `depth-${issue.entityId}`,
      type: 'improvement',
      title: this.getLocalizedText('improveDepth', language),
      description: issue.suggestion,
      priority: 'medium',
      category: issue.type,
      actionable: true,
      estimatedTime: 15,
      relatedEntities: [issue.entityId]
    };
  }

  private createExpansionRecommendation(type: string, language: 'uk' | 'pl' | 'en'): Recommendation {
    return {
      id: `expand-${type}`,
      type: 'expansion',
      title: this.getLocalizedText('expandWorld', language),
      description: this.getLocalizedText(`add${type.charAt(0).toUpperCase() + type.slice(1)}`, language),
      priority: 'medium',
      category: 'world',
      actionable: true,
      estimatedTime: 25,
      relatedEntities: []
    };
  }

  private createCultureRecommendation(language: 'uk' | 'pl' | 'en'): Recommendation {
    return {
      id: 'add-culture',
      type: 'expansion',
      title: this.getLocalizedText('addCulture', language),
      description: this.getLocalizedText('cultureSuggestion', language),
      priority: 'low',
      category: 'culture',
      actionable: true,
      estimatedTime: 30,
      relatedEntities: []
    };
  }

  private findConnectionGaps(worldData: any): any[] {
    const gaps: any[] = [];
    
    // Orphaned characters (без зв'язків)
    worldData.characters?.forEach((character: any) => {
      if (!character.relationships || character.relationships.length === 0) {
        gaps.push({
          id: character.id,
          description: `Персонаж ${character.name} не має зв'язків з іншими елементами світу`,
          entities: [character.id]
        });
      }
    });

    return gaps;
  }

  private findDepthIssues(worldData: any): any[] {
    const issues: any[] = [];
    
    // Check description lengths
    [...(worldData.characters || []), ...(worldData.locations || [])].forEach((entity: any) => {
      if (!entity.description || entity.description.length < 50) {
        issues.push({
          entityId: entity.id,
          type: entity.race ? 'character' : 'location',
          suggestion: `Розширте опис для ${entity.name} - додайте більше деталей`
        });
      }
    });

    return issues;
  }

  private couldHaveConflict(char1: any, char2: any): boolean {
    // Простий алгоритм виявлення потенційних конфліктів
    if (char1.class && char2.class && char1.class !== char2.class) {
      return Math.random() > 0.7; // 30% шанс конфлікту між різними класами
    }
    
    if (char1.alignment && char2.alignment && char1.alignment !== char2.alignment) {
      return Math.random() > 0.6; // 40% шанс конфлікту між різними alignment
    }
    
    return false;
  }

  private analyzeLocationTypes(locations: any[]): Record<string, number> {
    const types = { cities: 0, wilderness: 0, dungeons: 0, other: 0 };
    
    locations.forEach(location => {
      const name = location.name?.toLowerCase() || '';
      const desc = location.description?.toLowerCase() || '';
      
      if (name.includes('місто') || name.includes('city') || name.includes('miasto') ||
          desc.includes('місто') || desc.includes('city') || desc.includes('miasto')) {
        types.cities++;
      } else if (name.includes('ліс') || name.includes('forest') || name.includes('las') ||
                 name.includes('гора') || name.includes('mountain') || name.includes('góra')) {
        types.wilderness++;
      } else if (name.includes('підземелля') || name.includes('dungeon') || name.includes('loch')) {
        types.dungeons++;
      } else {
        types.other++;
      }
    });
    
    return types;
  }

  private analyzeCultures(worldData: any): string[] {
    const cultures = new Set<string>();
    
    worldData.characters?.forEach((character: any) => {
      if (character.culture) cultures.add(character.culture);
      if (character.race) cultures.add(character.race);
    });
    
    return Array.from(cultures);
  }

  private calculateSimilarity(entity1: any, entity2: any): number {
    let similarity = 0;
    let factors = 0;
    
    // Compare descriptions
    if (entity1.description && entity2.description) {
      const words1 = entity1.description.toLowerCase().split(/\s+/);
      const words2 = entity2.description.toLowerCase().split(/\s+/);
      const commonWords = words1.filter(word => words2.includes(word));
      similarity += commonWords.length / Math.max(words1.length, words2.length);
      factors++;
    }
    
    // Compare types
    if (entity1.type === entity2.type) {
      similarity += 0.3;
    }
    factors++;
    
    return factors > 0 ? similarity / factors : 0;
  }

  private getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  private getNames(language: 'uk' | 'pl' | 'en') {
    switch (language) {
      case 'uk': return this.ukrainianNames;
      case 'pl': return this.polishNames;
      case 'en': return this.englishNames;
      default: return this.ukrainianNames;
    }
  }

  private getLocalizedText(key: string, language: 'uk' | 'pl' | 'en', params: string[] = []): string {
    const texts = {
      uk: {
        startWorld: 'Почніть створення світу',
        startWorldDesc: 'Створіть свого першого персонажа або локацію, щоб розпочати будування світу',
        addCharacter: 'Додайте нового персонажа',
        characterSuggestion: `Розгляньте можливість створення персонажа на ім'я ${params[0] || 'Hero'}`,
        addLocation: 'Створіть нову локацію',
        locationSuggestion: `Додайте локацію "${params[0] || 'Mysterious Place'}" до свого світу`,
        addEvent: 'Додайте історичну подію',
        eventSuggestion: 'Створіть важливу подію, яка вплинула на ваш світ',
        expandBackground: 'Розширте передісторію',
        backgroundSuggestion: 'Додайте більше деталей про минуле персонажа',
        addPersonality: 'Опишіть характер',
        personalitySuggestion: 'Додайте риси характеру, звички та манери',
        addRelationships: 'Створіть зв\'язки',
        relationshipSuggestion: 'Додайте відносини з іншими персонажами',
        potentialConflict: 'Потенційний конфлікт',
        conflictSuggestion: `Між ${params[0]} та ${params[1]} може виникнути цікавий конфлікт`,
        addLocationSecret: 'Додайте таємницю локації',
        secretSuggestion: `Створіть таємницю для локації ${params[0]}`,
        missingConnection: 'Відсутній зв\'язок',
        improveDepth: 'Поглибте опис',
        expandWorld: 'Розширте світ',
        addCity: 'Додайте місто або поселення',
        addWilderness: 'Створіть природну локацію',
        addDungeon: 'Додайте підземелля або руїни',
        addCulture: 'Створіть нову культуру',
        cultureSuggestion: 'Додайте унікальну культуру з власними традиціями'
      },
      pl: {
        startWorld: 'Zacznij tworzenie świata',
        startWorldDesc: 'Stwórz swoją pierwszą postać lub lokację, aby rozpocząć budowanie świata',
        addCharacter: 'Dodaj nową postać',
        characterSuggestion: `Rozważ stworzenie postaci o imieniu ${params[0] || 'Bohater'}`,
        addLocation: 'Stwórz nową lokację',
        locationSuggestion: `Dodaj lokację "${params[0] || 'Tajemnicze Miejsce'}" do swojego świata`,
        addEvent: 'Dodaj wydarzenie historyczne',
        eventSuggestion: 'Stwórz ważne wydarzenie, które wpłynęło na twój świat',
        expandBackground: 'Rozszerz historię',
        backgroundSuggestion: 'Dodaj więcej szczegółów o przeszłości postaci',
        addPersonality: 'Opisz charakter',
        personalitySuggestion: 'Dodaj cechy charakteru, nawyki i maniery',
        addRelationships: 'Stwórz relacje',
        relationshipSuggestion: 'Dodaj relacje z innymi postaciami',
        potentialConflict: 'Potencjalny konflikt',
        conflictSuggestion: `Między ${params[0]} a ${params[1]} może powstać interesujący konflikt`,
        addLocationSecret: 'Dodaj tajemnicę lokacji',
        secretSuggestion: `Stwórz tajemnicę dla lokacji ${params[0]}`,
        missingConnection: 'Brak połączenia',
        improveDepth: 'Pogłęb opis',
        expandWorld: 'Rozszerz świat',
        addCity: 'Dodaj miasto lub osadę',
        addWilderness: 'Stwórz naturalną lokację',
        addDungeon: 'Dodaj loch lub ruiny',
        addCulture: 'Stwórz nową kulturę',
        cultureSuggestion: 'Dodaj unikalną kulturę z własnymi tradycjami'
      },
      en: {
        startWorld: 'Start creating your world',
        startWorldDesc: 'Create your first character or location to begin world building',
        addCharacter: 'Add a new character',
        characterSuggestion: `Consider creating a character named ${params[0] || 'Hero'}`,
        addLocation: 'Create a new location',
        locationSuggestion: `Add location "${params[0] || 'Mysterious Place'}" to your world`,
        addEvent: 'Add historical event',
        eventSuggestion: 'Create an important event that influenced your world',
        expandBackground: 'Expand backstory',
        backgroundSuggestion: 'Add more details about the character\'s past',
        addPersonality: 'Describe personality',
        personalitySuggestion: 'Add character traits, habits and mannerisms',
        addRelationships: 'Create relationships',
        relationshipSuggestion: 'Add relationships with other characters',
        potentialConflict: 'Potential conflict',
        conflictSuggestion: `An interesting conflict could arise between ${params[0]} and ${params[1]}`,
        addLocationSecret: 'Add location secret',
        secretSuggestion: `Create a secret for location ${params[0]}`,
        missingConnection: 'Missing connection',
        improveDepth: 'Improve depth',
        expandWorld: 'Expand world',
        addCity: 'Add city or settlement',
        addWilderness: 'Create natural location',
        addDungeon: 'Add dungeon or ruins',
        addCulture: 'Create new culture',
        cultureSuggestion: 'Add unique culture with its own traditions'
      }
    };

    return texts[language]?.[key] || texts.uk[key] || key;
  }
}

export const recommendationEngine = new RecommendationEngine();