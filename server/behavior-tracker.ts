export interface UserAction {
  action: string;
  context: string;
  duration: number;
  timestamp: Date;
  metadata?: any;
}

export interface ActivityPattern {
  mostActiveHours: number[];
  dailyStats: Record<string, number>;
  weeklyTrends: Record<string, number>;
  contentPreferences: Record<string, number>;
}

export interface ProductivityMetrics {
  wordsPerDay: number;
  entitiesCreated: number;
  timeSpentWriting: number;
  mostProductiveTime: string;
  focusAreas: string[];
}

export class BehaviorTracker {
  private actions: UserAction[] = [];

  trackUserAction(action: string, context: string, duration: number = 0, metadata?: any) {
    const userAction: UserAction = {
      action,
      context,
      duration,
      timestamp: new Date(),
      metadata
    };
    
    this.actions.push(userAction);
    
    // Зберегти в localStorage для persistence
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('userBehavior') || '[]');
      stored.push(userAction);
      // Зберігаємо останні 1000 дій
      if (stored.length > 1000) {
        stored.splice(0, stored.length - 1000);
      }
      localStorage.setItem('userBehavior', JSON.stringify(stored));
    }
  }

  getActivityPatterns(timeRange: number = 7): ActivityPattern {
    const now = new Date();
    const cutoff = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000);
    
    const recentActions = this.actions.filter(action => 
      new Date(action.timestamp) >= cutoff
    );

    // Аналіз найактивніших годин
    const hourCounts = new Array(24).fill(0);
    recentActions.forEach(action => {
      const hour = new Date(action.timestamp).getHours();
      hourCounts[hour]++;
    });
    
    const mostActiveHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => item.hour);

    // Денна статистика
    const dailyStats: Record<string, number> = {};
    recentActions.forEach(action => {
      const day = new Date(action.timestamp).toISOString().split('T')[0];
      dailyStats[day] = (dailyStats[day] || 0) + 1;
    });

    // Тижневі тренди
    const weeklyTrends: Record<string, number> = {};
    recentActions.forEach(action => {
      const dayOfWeek = new Date(action.timestamp).toLocaleDateString('uk-UA', { weekday: 'long' });
      weeklyTrends[dayOfWeek] = (weeklyTrends[dayOfWeek] || 0) + 1;
    });

    // Контентні переваги
    const contentPreferences: Record<string, number> = {};
    recentActions.forEach(action => {
      if (action.context.includes('character')) contentPreferences['characters'] = (contentPreferences['characters'] || 0) + 1;
      if (action.context.includes('location')) contentPreferences['locations'] = (contentPreferences['locations'] || 0) + 1;
      if (action.context.includes('creature')) contentPreferences['creatures'] = (contentPreferences['creatures'] || 0) + 1;
      if (action.context.includes('lore')) contentPreferences['lore'] = (contentPreferences['lore'] || 0) + 1;
    });

    return {
      mostActiveHours,
      dailyStats,
      weeklyTrends,
      contentPreferences
    };
  }

  generateProductivityReport(): ProductivityMetrics {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekActions = this.actions.filter(action => 
      new Date(action.timestamp) >= weekAgo
    );

    // Підрахунок слів (приблизно)
    const writingActions = weekActions.filter(action => 
      action.action.includes('create') || action.action.includes('edit')
    );
    const estimatedWords = writingActions.reduce((sum, action) => {
      // Приблизно 50 слів на дію створення/редагування
      return sum + (action.duration > 60 ? 50 : 25);
    }, 0);

    // Створені сутності
    const entitiesCreated = weekActions.filter(action => 
      action.action === 'create'
    ).length;

    // Час написання
    const timeSpentWriting = writingActions.reduce((sum, action) => 
      sum + action.duration, 0
    ) / 1000 / 60; // у хвилинах

    // Найпродуктивніший час
    const hourCounts = new Array(24).fill(0);
    writingActions.forEach(action => {
      const hour = new Date(action.timestamp).getHours();
      hourCounts[hour] += action.duration;
    });
    const mostProductiveHour = hourCounts.indexOf(Math.max(...hourCounts));
    const mostProductiveTime = `${mostProductiveHour}:00-${mostProductiveHour + 1}:00`;

    // Фокусні області
    const focusAreas: Record<string, number> = {};
    weekActions.forEach(action => {
      if (action.context) {
        const area = action.context.split('/')[1] || action.context;
        focusAreas[area] = (focusAreas[area] || 0) + 1;
      }
    });
    
    const topFocusAreas = Object.entries(focusAreas)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([area]) => area);

    return {
      wordsPerDay: Math.round(estimatedWords / 7),
      entitiesCreated,
      timeSpentWriting: Math.round(timeSpentWriting),
      mostProductiveTime,
      focusAreas: topFocusAreas
    };
  }

  loadFromStorage() {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('userBehavior') || '[]');
      this.actions = stored.map((action: any) => ({
        ...action,
        timestamp: new Date(action.timestamp)
      }));
    }
  }
}

export const behaviorTracker = new BehaviorTracker();