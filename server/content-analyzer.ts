// Використовуємо простіші ML бібліотеки без native dependencies
interface SentimentResult {
  score: number;
  comparative: number;
}

// Простий sentiment analyzer без зовнішніх залежностей
class SimpleSentiment {
  private positiveWords: Set<string>;
  private negativeWords: Set<string>;

  constructor() {
    // Українські позитивні слова
    this.positiveWords = new Set([
      'добрий', 'прекрасний', 'чудовий', 'відмінний', 'красивий', 'дивовижний',
      'щасливий', 'радісний', 'успішний', 'блискучий', 'геніальний', 'чарівний',
      'good', 'great', 'excellent', 'beautiful', 'amazing', 'wonderful',
      'happy', 'brilliant', 'fantastic', 'perfect', 'awesome', 'outstanding',
      'dobry', 'świetny', 'doskonały', 'piękny', 'niesamowity', 'cudowny'
    ]);

    // Українські негативні слова
    this.negativeWords = new Set([
      'поганий', 'жахливий', 'страшний', 'сумний', 'темний', 'злий',
      'небезпечний', 'болючий', 'важкий', 'складний', 'неприємний',
      'bad', 'terrible', 'horrible', 'sad', 'dark', 'evil', 'dangerous',
      'painful', 'difficult', 'unpleasant', 'awful', 'horrible',
      'zły', 'straszny', 'okropny', 'smutny', 'ciemny', 'niebezpieczny'
    ]);
  }

  analyze(text: string): SentimentResult {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (this.positiveWords.has(word)) score += 1;
      if (this.negativeWords.has(word)) score -= 1;
    });

    return {
      score,
      comparative: score / Math.max(words.length, 1)
    };
  }
}

export interface ContentQuality {
  completenessScore: number;
  consistencyScore: number;
  depthScore: number;
  originalityScore: number;
  overallScore: number;
  suggestions: string[];
}

export interface WorldAnalysis {
  totalEntities: number;
  qualityDistribution: Record<string, number>;
  weakestAreas: string[];
  strongestAreas: string[];
  improvementSuggestions: string[];
}

export class ContentAnalyzer {
  private sentiment: SimpleSentiment;
  private ukrainianStopWords: Set<string>;
  private polishStopWords: Set<string>;
  private englishStopWords: Set<string>;

  constructor() {
    this.sentiment = new SimpleSentiment();
    
    // Українські стоп-слова
    this.ukrainianStopWords = new Set([
      'і', 'та', 'в', 'на', 'з', 'для', 'до', 'від', 'про', 'при', 'під', 'над', 'за', 'через',
      'він', 'вона', 'воно', 'вони', 'я', 'ти', 'ми', 'ви', 'мене', 'тебе', 'його', 'її', 'їх',
      'це', 'цей', 'ця', 'те', 'той', 'та', 'ті', 'який', 'яка', 'яке', 'які', 'що', 'коли', 'де'
    ]);

    // Польські стоп-слова
    this.polishStopWords = new Set([
      'i', 'w', 'na', 'z', 'do', 'od', 'o', 'przy', 'pod', 'nad', 'za', 'przez',
      'on', 'ona', 'ono', 'oni', 'ja', 'ty', 'my', 'wy', 'mnie', 'ciebie', 'jego', 'jej', 'ich',
      'to', 'ten', 'ta', 'te', 'który', 'która', 'które', 'co', 'kiedy', 'gdzie'
    ]);

    // Англійські стоп-слова
    this.englishStopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'he', 'she', 'it', 'they', 'i', 'you', 'we', 'me', 'him', 'her', 'them', 'us',
      'this', 'that', 'these', 'those', 'which', 'what', 'when', 'where', 'who', 'how'
    ]);
  }

  calculateCompletenessScore(entity: any): number {
    if (!entity) return 0;

    const requiredFields = ['name', 'description'];
    const optionalFields = ['image', 'background', 'personality', 'goals', 'fears'];
    
    let score = 0;
    let totalWeight = 0;

    // Перевірка обов'язкових полів (вага 3)
    requiredFields.forEach(field => {
      totalWeight += 3;
      if (entity[field] && entity[field].trim().length > 0) {
        const length = entity[field].length;
        if (length > 100) score += 3;
        else if (length > 50) score += 2;
        else if (length > 10) score += 1;
      }
    });

    // Перевірка опціональних полів (вага 1)
    optionalFields.forEach(field => {
      totalWeight += 1;
      if (entity[field] && entity[field].trim().length > 0) {
        score += 1;
      }
    });

    return Math.round((score / totalWeight) * 100);
  }

  assessConsistency(worldData: any): number {
    if (!worldData) return 0;

    let consistencyIssues = 0;
    let totalChecks = 0;

    // Перевірка дат і часових ліній
    if (worldData.events) {
      totalChecks += worldData.events.length;
      worldData.events.forEach((event: any) => {
        if (event.date && isNaN(Date.parse(event.date))) {
          consistencyIssues++;
        }
      });
    }

    // Перевірка зв'язків між персонажами
    if (worldData.characters) {
      totalChecks += worldData.characters.length;
      worldData.characters.forEach((character: any) => {
        if (character.relationships) {
          character.relationships.forEach((rel: any) => {
            const relatedExists = worldData.characters.some((c: any) => c.id === rel.targetId);
            if (!relatedExists) consistencyIssues++;
          });
        }
      });
    }

    // Перевірка локацій
    if (worldData.locations) {
      totalChecks += worldData.locations.length;
      worldData.locations.forEach((location: any) => {
        if (location.parentLocation) {
          const parentExists = worldData.locations.some((l: any) => l.id === location.parentLocation);
          if (!parentExists) consistencyIssues++;
        }
      });
    }

    if (totalChecks === 0) return 100;
    return Math.max(0, Math.round((1 - consistencyIssues / totalChecks) * 100));
  }

  measureDepth(descriptions: string[], language: 'uk' | 'pl' | 'en' = 'uk'): number {
    if (!descriptions || descriptions.length === 0) return 0;

    let totalDepthScore = 0;
    const stopWords = this.getStopWords(language);

    descriptions.forEach(description => {
      if (!description) return;

      const words = description.toLowerCase().split(/\s+/);
      const meaningfulWords = words.filter(word => 
        word.length > 2 && !stopWords.has(word)
      );

      // Розрахунок глибини на основі:
      // 1. Кількість осмислених слів
      // 2. Різноманітність словника
      // 3. Довжина речень
      const wordCount = meaningfulWords.length;
      const uniqueWords = new Set(meaningfulWords).size;
      const sentences = description.split(/[.!?]+/).length;
      const avgSentenceLength = wordCount / Math.max(sentences, 1);

      let depthScore = 0;
      
      // Бали за кількість слів
      if (wordCount > 200) depthScore += 4;
      else if (wordCount > 100) depthScore += 3;
      else if (wordCount > 50) depthScore += 2;
      else if (wordCount > 20) depthScore += 1;

      // Бали за різноманітність
      const diversity = uniqueWords / Math.max(wordCount, 1);
      if (diversity > 0.8) depthScore += 3;
      else if (diversity > 0.6) depthScore += 2;
      else if (diversity > 0.4) depthScore += 1;

      // Бали за структуру речень
      if (avgSentenceLength > 15 && avgSentenceLength < 25) depthScore += 2;
      else if (avgSentenceLength > 8) depthScore += 1;

      totalDepthScore += Math.min(depthScore, 10);
    });

    return Math.round((totalDepthScore / descriptions.length) * 10);
  }

  detectOriginality(content: string, existingContent: string[] = []): number {
    if (!content) return 0;

    const words = content.toLowerCase().split(/\s+/);
    const phrases = this.extractPhrases(content, 3); // 3-word phrases

    let originalityScore = 100;
    
    // Перевірка на повтори фраз
    existingContent.forEach(existing => {
      const existingPhrases = this.extractPhrases(existing, 3);
      const commonPhrases = phrases.filter(phrase => 
        existingPhrases.includes(phrase)
      );
      
      if (commonPhrases.length > 0) {
        const similarity = (commonPhrases.length / phrases.length) * 100;
        originalityScore -= similarity * 0.3;
      }
    });

    // Перевірка на кліше та загальні фрази
    const fantasyCliches = [
      'темний лорд', 'dark lord', 'mroczny pan',
      'обраний герой', 'chosen one', 'wybrany bohater',
      'магічний меч', 'magic sword', 'magiczny miecz',
      'древня пророцтво', 'ancient prophecy', 'starożytna przepowiednia'
    ];

    fantasyCliches.forEach(cliche => {
      if (content.toLowerCase().includes(cliche.toLowerCase())) {
        originalityScore -= 10;
      }
    });

    return Math.max(0, Math.round(originalityScore));
  }

  analyzeWorld(worldData: any): WorldAnalysis {
    const entities = [
      ...(worldData.characters || []),
      ...(worldData.locations || []),
      ...(worldData.creatures || []),
      ...(worldData.events || [])
    ];

    const qualityScores = entities.map(entity => {
      const completeness = this.calculateCompletenessScore(entity);
      const descriptions = [entity.description, entity.background].filter(Boolean);
      const depth = descriptions.length > 0 ? this.measureDepth(descriptions) : 0;
      
      return {
        type: this.getEntityType(entity),
        score: (completeness + depth) / 2
      };
    });

    // Розподіл якості
    const qualityDistribution: Record<string, number> = {};
    qualityScores.forEach(({ score }) => {
      if (score >= 80) qualityDistribution['відмінно'] = (qualityDistribution['відмінно'] || 0) + 1;
      else if (score >= 60) qualityDistribution['добре'] = (qualityDistribution['добре'] || 0) + 1;
      else if (score >= 40) qualityDistribution['задовільно'] = (qualityDistribution['задовільно'] || 0) + 1;
      else qualityDistribution['потребує покращення'] = (qualityDistribution['потребує покращення'] || 0) + 1;
    });

    // Найслабші та найсильніші області
    const typeScores: Record<string, number[]> = {};
    qualityScores.forEach(({ type, score }) => {
      if (!typeScores[type]) typeScores[type] = [];
      typeScores[type].push(score);
    });

    const avgTypeScores = Object.entries(typeScores).map(([type, scores]) => ({
      type,
      avgScore: scores.reduce((a, b) => a + b, 0) / scores.length
    }));

    const weakestAreas = avgTypeScores
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 2)
      .map(item => item.type);

    const strongestAreas = avgTypeScores
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 2)
      .map(item => item.type);

    // Пропозиції покращення
    const improvementSuggestions = this.generateImprovementSuggestions(
      worldData, 
      weakestAreas,
      qualityDistribution
    );

    return {
      totalEntities: entities.length,
      qualityDistribution,
      weakestAreas,
      strongestAreas,
      improvementSuggestions
    };
  }

  private getStopWords(language: 'uk' | 'pl' | 'en'): Set<string> {
    switch (language) {
      case 'uk': return this.ukrainianStopWords;
      case 'pl': return this.polishStopWords;
      case 'en': return this.englishStopWords;
      default: return this.ukrainianStopWords;
    }
  }

  private extractPhrases(text: string, length: number): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const phrases: string[] = [];
    
    for (let i = 0; i <= words.length - length; i++) {
      phrases.push(words.slice(i, i + length).join(' '));
    }
    
    return phrases;
  }

  private getEntityType(entity: any): string {
    if (entity.race || entity.class) return 'персонажі';
    if (entity.coordinates || entity.region) return 'локації';
    if (entity.challengeRating || entity.species) return 'створіння';
    if (entity.date || entity.importance) return 'події';
    return 'інше';
  }

  private generateImprovementSuggestions(
    worldData: any, 
    weakestAreas: string[], 
    qualityDistribution: Record<string, number>
  ): string[] {
    const suggestions: string[] = [];

    if (weakestAreas.includes('персонажі')) {
      suggestions.push('Додайте більше деталей до характерів персонажів - цілі, страхи, мотивації');
    }

    if (weakestAreas.includes('локації')) {
      suggestions.push('Розширте описи локацій - атмосфера, історія, унікальні особливості');
    }

    if (qualityDistribution['потребує покращення'] > 3) {
      suggestions.push('Є кілька елементів з низькою якістю - розгляньте можливість їх переробки');
    }

    if (!worldData.events || worldData.events.length < 5) {
      suggestions.push('Додайте більше історичних подій для створення багатого background');
    }

    if (!worldData.relationships || worldData.relationships.length < 3) {
      suggestions.push('Створіть більше зв\'язків між персонажами та локаціями');
    }

    return suggestions;
  }
}

export const contentAnalyzer = new ContentAnalyzer();