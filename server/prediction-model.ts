import { behaviorTracker } from './behavior-tracker';
import { contentAnalyzer } from './content-analyzer';

export interface WorkloadPrediction {
  estimatedHours: number;
  completionDate: Date;
  confidenceLevel: number;
  bottlenecks: string[];
  recommendations: string[];
}

export interface ContentPrediction {
  nextLogicalSteps: string[];
  prioritizedTasks: Array<{
    task: string;
    priority: number;
    estimatedTime: number;
    dependencies: string[];
  }>;
  timeline: Array<{
    week: number;
    goals: string[];
    deliverables: string[];
  }>;
}

export interface QualityPrediction {
  currentTrajectory: 'improving' | 'stable' | 'declining';
  predictedQualityScore: number;
  riskFactors: string[];
  improvementOpportunities: string[];
  publishingReadiness: {
    score: number;
    blockers: string[];
    timeToReady: number;
  };
}

export class PredictionModel {
  predictNextLogicalStep(worldData: any, recentActivity: any[]): string[] {
    const steps: string[] = [];
    
    // Аналіз поточного контенту
    const entityCounts = {
      characters: worldData.characters?.length || 0,
      locations: worldData.locations?.length || 0,
      creatures: worldData.creatures?.length || 0,
      events: worldData.events?.length || 0,
      artifacts: worldData.artifacts?.length || 0
    };

    // Аналіз останньої активності
    const recentContexts = recentActivity
      .slice(0, 10)
      .map(action => action.context)
      .filter(Boolean);

    const currentFocus = this.detectCurrentFocus(recentContexts);

    // Логіка передбачення наступних кроків
    if (entityCounts.characters === 0) {
      steps.push('Створіть головного героя вашої історії');
    } else if (entityCounts.locations === 0) {
      steps.push('Додайте локацію де відбуватимуться події');
    } else if (entityCounts.events === 0) {
      steps.push('Створіть ключову подію що сформувала світ');
    } else {
      // Базуємося на поточному фокусі
      if (currentFocus === 'characters') {
        if (entityCounts.characters < 5) {
          steps.push('Розширте касту персонажів - додайте союзника або антагоніста');
        }
        steps.push('Поглибте відносини між існуючими персонажами');
      } else if (currentFocus === 'locations') {
        steps.push('Додайте деталі до існуючих локацій або створіть нову');
        steps.push('Опишіть культуру та історію регіону');
      } else if (currentFocus === 'lore') {
        steps.push('Створіть магічну систему або артефакт');
        steps.push('Розробіть релігію або філософію світу');
      }
    }

    // Аналіз пробілів у контенті
    const qualityAnalysis = contentAnalyzer.analyzeWorld(worldData);
    if (qualityAnalysis.weakestAreas.length > 0) {
      steps.push(`Покращте найслабшу область: ${qualityAnalysis.weakestAreas[0]}`);
    }

    return steps.slice(0, 5); // Повертаємо топ-5 рекомендацій
  }

  forecastCompletion(worldData: any, workingSpeed: number): WorkloadPrediction {
    // Аналіз поточного стану
    const currentEntityCount = Object.values(worldData).reduce((sum: number, entities: any) => {
      return sum + (Array.isArray(entities) ? entities.length : 0);
    }, 0);

    // Оцінка цільового розміру світу
    const targetEntityCount = this.estimateTargetSize(worldData);
    const remainingWork = Math.max(0, targetEntityCount - currentEntityCount);

    // Розрахунок часу на основі швидкості роботи
    const hoursPerEntity = 0.5; // Середній час на створення сутності
    const estimatedHours = remainingWork * hoursPerEntity / Math.max(workingSpeed, 0.1);

    // Прогноз дати завершення
    const workHoursPerWeek = 10; // Припущення про 10 годин на тиждень
    const weeksToComplete = estimatedHours / workHoursPerWeek;
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + weeksToComplete * 7);

    // Визначення вузьких місць
    const bottlenecks = this.identifyBottlenecks(worldData);
    
    // Рівень впевненості
    const confidenceLevel = this.calculateConfidence(workingSpeed, remainingWork);

    return {
      estimatedHours: Math.round(estimatedHours),
      completionDate,
      confidenceLevel,
      bottlenecks,
      recommendations: this.generateWorkloadRecommendations(remainingWork, bottlenecks)
    };
  }

  planSeasonalContent(worldData: any, timeframe: number = 12): ContentPrediction {
    const weeks = timeframe;
    const timeline: Array<{ week: number; goals: string[]; deliverables: string[] }> = [];
    
    // Аналіз поточного стану
    const analysis = contentAnalyzer.analyzeWorld(worldData);
    const totalWork = analysis.improvementSuggestions.length;
    
    // Розподіл роботи по тижнях
    const workPerWeek = Math.ceil(totalWork / weeks);
    
    for (let week = 1; week <= weeks; week++) {
      const goals: string[] = [];
      const deliverables: string[] = [];
      
      if (week <= 4) {
        // Перший місяць - базовий контент
        goals.push('Розвиток основних персонажів');
        goals.push('Створення ключових локацій');
        deliverables.push('3-5 детально описаних персонажів');
        deliverables.push('2-3 основні локації');
      } else if (week <= 8) {
        // Другий місяць - поглиблення
        goals.push('Створення зв\'язків та відносин');
        goals.push('Розробка історії світу');
        deliverables.push('Мережа відносин між персонажами');
        deliverables.push('Часова лінія ключових подій');
      } else {
        // Третій місяць - доопрацювання
        goals.push('Покращення якості існуючого контенту');
        goals.push('Додавання деталей та глибини');
        deliverables.push('Поліпшені описи всіх сутностей');
        deliverables.push('Повністю зв\'язний світ');
      }
      
      timeline.push({ week, goals, deliverables });
    }

    // Пріоритетні завдання
    const prioritizedTasks = this.generatePrioritizedTasks(worldData);

    return {
      nextLogicalSteps: this.predictNextLogicalStep(worldData, []),
      prioritizedTasks,
      timeline
    };
  }

  assessPublishingReadiness(worldData: any): QualityPrediction {
    const analysis = contentAnalyzer.analyzeWorld(worldData);
    
    // Оцінка поточної якості
    const qualityScores = Object.values(analysis.qualityDistribution);
    const avgQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
    
    // Передбачення траєкторії
    const recentActivity = behaviorTracker.generateProductivityReport();
    const trajectory = this.predictQualityTrajectory(recentActivity);
    
    // Прогноз майбутньої якості
    const predictedQualityScore = this.extrapolateQuality(avgQuality, trajectory);
    
    // Фактори ризику
    const riskFactors = this.identifyRiskFactors(worldData, analysis);
    
    // Можливості покращення
    const improvementOpportunities = analysis.improvementSuggestions;
    
    // Готовність до публікації
    const publishingReadiness = this.assessPublishingScore(worldData, avgQuality);

    return {
      currentTrajectory: trajectory,
      predictedQualityScore: Math.round(predictedQualityScore),
      riskFactors,
      improvementOpportunities,
      publishingReadiness
    };
  }

  modelReaderInterest(worldData: any, targetAudience: string = 'fantasy'): number {
    let interestScore = 50; // Базовий рівень
    
    // Фактори що підвищують інтерес
    const entities = [
      ...(worldData.characters || []),
      ...(worldData.locations || []),
      ...(worldData.creatures || [])
    ];

    // Різноманітність персонажів
    const characterTypes = new Set(
      (worldData.characters || []).map((c: any) => c.class || c.race)
    );
    interestScore += Math.min(characterTypes.size * 5, 20);

    // Унікальність світу
    const uniqueElements = entities.filter((e: any) => 
      e.description && e.description.length > 100
    ).length;
    interestScore += Math.min(uniqueElements * 3, 15);

    // Складність сюжету
    const plotComplexity = (worldData.events || []).length + 
                          (worldData.relationships || []).length;
    interestScore += Math.min(plotComplexity * 2, 15);

    return Math.min(Math.max(interestScore, 0), 100);
  }

  private detectCurrentFocus(recentContexts: string[]): string {
    const contextCounts: Record<string, number> = {};
    
    recentContexts.forEach(context => {
      if (context.includes('character')) {
        contextCounts['characters'] = (contextCounts['characters'] || 0) + 1;
      } else if (context.includes('location')) {
        contextCounts['locations'] = (contextCounts['locations'] || 0) + 1;
      } else if (context.includes('lore')) {
        contextCounts['lore'] = (contextCounts['lore'] || 0) + 1;
      }
    });

    return Object.entries(contextCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] || 'general';
  }

  private estimateTargetSize(worldData: any): number {
    // Базова оцінка розміру світу для повноцінної історії
    const baseTarget = {
      characters: 8,
      locations: 6,
      creatures: 4,
      events: 10,
      artifacts: 3
    };

    // Коригування на основі існуючого контенту
    const currentSize = Object.keys(worldData).length;
    const scale = Math.max(1, currentSize / 5);

    return Math.round(Object.values(baseTarget).reduce((a, b) => a + b, 0) * scale);
  }

  private identifyBottlenecks(worldData: any): string[] {
    const bottlenecks: string[] = [];
    
    // Аналіз неповного контенту
    const entities = [
      ...(worldData.characters || []),
      ...(worldData.locations || [])
    ];

    const incompleteEntities = entities.filter(entity => 
      !entity.description || entity.description.length < 50
    );

    if (incompleteEntities.length > 3) {
      bottlenecks.push('Багато неповних описів сутностей');
    }

    // Відсутність зв'язків
    const connectedEntities = entities.filter(entity => 
      entity.relationships && entity.relationships.length > 0
    );

    if (connectedEntities.length < entities.length * 0.5) {
      bottlenecks.push('Недостатньо зв\'язків між елементами світу');
    }

    return bottlenecks;
  }

  private calculateConfidence(workingSpeed: number, remainingWork: number): number {
    let confidence = 70; // Базовий рівень

    // Коригування на основі швидкості роботи
    if (workingSpeed > 1.5) confidence += 20;
    else if (workingSpeed < 0.5) confidence -= 20;

    // Коригування на основі обсягу роботи
    if (remainingWork < 10) confidence += 10;
    else if (remainingWork > 50) confidence -= 15;

    return Math.min(Math.max(confidence, 10), 95);
  }

  private generateWorkloadRecommendations(remainingWork: number, bottlenecks: string[]): string[] {
    const recommendations: string[] = [];
    
    if (remainingWork > 30) {
      recommendations.push('Розгляньте можливість розбиття роботи на менші етапи');
    }
    
    if (bottlenecks.includes('неповних описів')) {
      recommendations.push('Зосередьтеся спочатку на завершенні існуючого контенту');
    }
    
    if (bottlenecks.includes('зв\'язків')) {
      recommendations.push('Приділіть час створенню відносин між персонажами');
    }

    return recommendations;
  }

  private generatePrioritizedTasks(worldData: any): Array<{
    task: string;
    priority: number;
    estimatedTime: number;
    dependencies: string[];
  }> {
    const tasks = [];
    
    const entityCounts = {
      characters: worldData.characters?.length || 0,
      locations: worldData.locations?.length || 0,
      events: worldData.events?.length || 0
    };

    if (entityCounts.characters < 3) {
      tasks.push({
        task: 'Створити основних персонажів',
        priority: 10,
        estimatedTime: 60,
        dependencies: []
      });
    }

    if (entityCounts.locations < 2) {
      tasks.push({
        task: 'Додати ключові локації',
        priority: 8,
        estimatedTime: 45,
        dependencies: ['Створити основних персонажів']
      });
    }

    if (entityCounts.events < 3) {
      tasks.push({
        task: 'Розробити історичні події',
        priority: 6,
        estimatedTime: 30,
        dependencies: ['Додати ключові локації']
      });
    }

    return tasks.sort((a, b) => b.priority - a.priority);
  }

  private predictQualityTrajectory(recentActivity: any): 'improving' | 'stable' | 'declining' {
    const productivity = recentActivity.wordsPerDay;
    const timeSpent = recentActivity.timeSpentWriting;
    
    if (productivity > 100 && timeSpent > 60) return 'improving';
    if (productivity < 50 || timeSpent < 30) return 'declining';
    return 'stable';
  }

  private extrapolateQuality(currentQuality: number, trajectory: string): number {
    const multipliers = {
      improving: 1.2,
      stable: 1.0,
      declining: 0.9
    };
    
    return currentQuality * multipliers[trajectory];
  }

  private identifyRiskFactors(worldData: any, analysis: any): string[] {
    const risks: string[] = [];
    
    if (analysis.totalEntities < 5) {
      risks.push('Недостатньо контенту для повноцінного світу');
    }
    
    if (analysis.weakestAreas.length > 2) {
      risks.push('Кілька областей потребують значного покращення');
    }
    
    const productivity = behaviorTracker.generateProductivityReport();
    if (productivity.wordsPerDay < 50) {
      risks.push('Низька продуктивність може затримати завершення');
    }

    return risks;
  }

  private assessPublishingScore(worldData: any, avgQuality: number): {
    score: number;
    blockers: string[];
    timeToReady: number;
  } {
    let score = Math.round(avgQuality);
    const blockers: string[] = [];
    
    const entities = Object.values(worldData).flat().length;
    if (entities < 10) {
      blockers.push('Недостатньо контенту');
      score -= 20;
    }
    
    const analysis = contentAnalyzer.analyzeWorld(worldData);
    if (analysis.improvementSuggestions.length > 5) {
      blockers.push('Багато областей потребують покращення');
      score -= 15;
    }
    
    // Оцінка часу до готовності (у тижнях)
    const timeToReady = Math.max(0, (100 - score) / 10);
    
    return {
      score: Math.max(0, score),
      blockers,
      timeToReady
    };
  }
}

export const predictionModel = new PredictionModel();