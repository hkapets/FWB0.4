import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Brain, TrendingUp, Clock, Target, Lightbulb, AlertTriangle, 
  CheckCircle, Activity, Calendar, BookOpen 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  productivity: {
    wordsPerDay: number;
    entitiesCreated: number;
    timeSpentWriting: number;
    mostProductiveTime: string;
    focusAreas: string[];
  };
  quality: {
    currentTrajectory: 'improving' | 'stable' | 'declining';
    predictedQualityScore: number;
    riskFactors: string[];
    improvementOpportunities: string[];
    publishingReadiness: {
      score: number;
      blockers: string[];
      timeToReady: number;
    };
  };
  predictions: {
    nextLogicalSteps: string[];
    estimatedHours: number;
    completionDate: string;
    confidenceLevel: number;
  };
  activity: {
    dailyStats: Record<string, number>;
    weeklyTrends: Record<string, number>;
    contentPreferences: Record<string, number>;
    mostActiveHours: number[];
  };
}

interface AnalyticsDashboardProps {
  worldId: number;
  language?: 'uk' | 'pl' | 'en';
}

export default function AnalyticsDashboard({ worldId, language = 'uk' }: AnalyticsDashboardProps) {
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [worldId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/advanced/${worldId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        throw new Error('Failed to load analytics');
      }
    } catch (error) {
      toast({
        title: getLocalizedText('error', language),
        description: getLocalizedText('analyticsLoadError', language),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="fantasy-border bg-black/20">
        <CardHeader>
          <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
            <Brain className="w-5 h-5 animate-pulse" />
            {getLocalizedText('loadingAnalytics', language)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card className="fantasy-border bg-black/20">
        <CardContent className="text-center py-8">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">{getLocalizedText('noAnalyticsData', language)}</p>
        </CardContent>
      </Card>
    );
  }

  const getTrajectoryColor = (trajectory: string) => {
    switch (trajectory) {
      case 'improving': return 'text-green-400';
      case 'declining': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getTrajectoryIcon = (trajectory: string) => {
    switch (trajectory) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'declining': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-yellow-400" />;
    }
  };

  // Підготовка даних для графіків
  const weeklyData = Object.entries(analyticsData.activity.weeklyTrends).map(([day, count]) => ({
    day: getLocalizedDayName(day, language),
    activity: count
  }));

  const contentPrefsData = Object.entries(analyticsData.activity.contentPreferences).map(([type, count]) => ({
    name: getLocalizedContentType(type, language),
    value: count
  }));

  const COLORS = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#06B6D4'];

  const hourlyData = analyticsData.activity.mostActiveHours.map(hour => ({
    hour: `${hour}:00`,
    activity: Math.random() * 100 // Mockup for visualization
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-fantasy text-fantasy-gold-300 flex items-center gap-2">
          <Brain className="w-6 h-6" />
          {getLocalizedText('advancedAnalytics', language)}
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="overview" className="text-gray-300 gap-2">
            <Activity className="w-4 h-4" />
            {getLocalizedText('overview', language)}
          </TabsTrigger>
          <TabsTrigger value="productivity" className="text-gray-300 gap-2">
            <TrendingUp className="w-4 h-4" />
            {getLocalizedText('productivity', language)}
          </TabsTrigger>
          <TabsTrigger value="quality" className="text-gray-300 gap-2">
            <Target className="w-4 h-4" />
            {getLocalizedText('quality', language)}
          </TabsTrigger>
          <TabsTrigger value="predictions" className="text-gray-300 gap-2">
            <Lightbulb className="w-4 h-4" />
            {getLocalizedText('predictions', language)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="fantasy-border bg-black/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{getLocalizedText('wordsPerDay', language)}</p>
                    <p className="text-2xl font-bold text-purple-300">{analyticsData.productivity.wordsPerDay}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="fantasy-border bg-black/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{getLocalizedText('qualityScore', language)}</p>
                    <p className="text-2xl font-bold text-yellow-300">{analyticsData.quality.predictedQualityScore}%</p>
                  </div>
                  <Target className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="fantasy-border bg-black/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{getLocalizedText('timeToCompletion', language)}</p>
                    <p className="text-2xl font-bold text-green-300">{analyticsData.predictions.estimatedHours}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="fantasy-border bg-black/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{getLocalizedText('confidence', language)}</p>
                    <p className="text-2xl font-bold text-blue-300">{analyticsData.predictions.confidenceLevel}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity Trend */}
          <Card className="fantasy-border bg-black/20">
            <CardHeader>
              <CardTitle className="text-fantasy-gold-300">{getLocalizedText('weeklyActivity', language)}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #4B5563',
                      color: '#F3F4F6'
                    }} 
                  />
                  <Bar dataKey="activity" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          {/* Productivity Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="fantasy-border bg-black/20">
              <CardHeader>
                <CardTitle className="text-fantasy-gold-300">{getLocalizedText('contentPreferences', language)}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contentPrefsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {contentPrefsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="fantasy-border bg-black/20">
              <CardHeader>
                <CardTitle className="text-fantasy-gold-300">{getLocalizedText('hourlyActivity', language)}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #4B5563',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Line type="monotone" dataKey="activity" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Focus Areas */}
          <Card className="fantasy-border bg-black/20">
            <CardHeader>
              <CardTitle className="text-fantasy-gold-300">{getLocalizedText('focusAreas', language)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analyticsData.productivity.focusAreas.map((area, index) => (
                  <div key={area} className="text-center p-4 bg-gray-800/50 rounded">
                    <div className="text-2xl font-bold text-purple-300">#{index + 1}</div>
                    <div className="text-gray-300">{getLocalizedContentType(area, language)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          {/* Quality Trajectory */}
          <Card className="fantasy-border bg-black/20">
            <CardHeader>
              <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
                {getTrajectoryIcon(analyticsData.quality.currentTrajectory)}
                {getLocalizedText('qualityTrajectory', language)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">{getLocalizedText('currentTrend', language)}</span>
                  <Badge className={getTrajectoryColor(analyticsData.quality.currentTrajectory)}>
                    {getLocalizedText(analyticsData.quality.currentTrajectory, language)}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{getLocalizedText('predictedQuality', language)}</span>
                    <span className="text-purple-300">{analyticsData.quality.predictedQualityScore}%</span>
                  </div>
                  <Progress value={analyticsData.quality.predictedQualityScore} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publishing Readiness */}
          <Card className="fantasy-border bg-black/20">
            <CardHeader>
              <CardTitle className="text-fantasy-gold-300">{getLocalizedText('publishingReadiness', language)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-300">{getLocalizedText('readinessScore', language)}</span>
                  <span className="text-2xl font-bold text-green-300">
                    {analyticsData.quality.publishingReadiness.score}%
                  </span>
                </div>
                
                <Progress value={analyticsData.quality.publishingReadiness.score} className="h-3" />
                
                <div className="text-center text-gray-400">
                  {getLocalizedText('estimatedTimeToReady', language)}: {analyticsData.quality.publishingReadiness.timeToReady} {getLocalizedText('weeks', language)}
                </div>

                {analyticsData.quality.publishingReadiness.blockers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-300">{getLocalizedText('blockers', language)}:</h4>
                    <ul className="space-y-1">
                      {analyticsData.quality.publishingReadiness.blockers.map((blocker, index) => (
                        <li key={index} className="text-gray-400 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          {blocker}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors and Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="fantasy-border bg-black/20">
              <CardHeader>
                <CardTitle className="text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {getLocalizedText('riskFactors', language)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analyticsData.quality.riskFactors.map((risk, index) => (
                    <li key={index} className="text-gray-400 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="fantasy-border bg-black/20">
              <CardHeader>
                <CardTitle className="text-green-300 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  {getLocalizedText('opportunities', language)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analyticsData.quality.improvementOpportunities.map((opportunity, index) => (
                    <li key={index} className="text-gray-400 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {/* Next Logical Steps */}
          <Card className="fantasy-border bg-black/20">
            <CardHeader>
              <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                {getLocalizedText('nextSteps', language)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.predictions.nextLogicalSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-800/30 rounded">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Completion Forecast */}
          <Card className="fantasy-border bg-black/20">
            <CardHeader>
              <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {getLocalizedText('completionForecast', language)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-800/30 rounded">
                  <div className="text-2xl font-bold text-blue-300">{analyticsData.predictions.estimatedHours}h</div>
                  <div className="text-gray-400">{getLocalizedText('estimatedWork', language)}</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/30 rounded">
                  <div className="text-2xl font-bold text-green-300">
                    {new Date(analyticsData.predictions.completionDate).toLocaleDateString(language === 'uk' ? 'uk-UA' : language === 'pl' ? 'pl-PL' : 'en-US')}
                  </div>
                  <div className="text-gray-400">{getLocalizedText('targetDate', language)}</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/30 rounded">
                  <div className="text-2xl font-bold text-yellow-300">{analyticsData.predictions.confidenceLevel}%</div>
                  <div className="text-gray-400">{getLocalizedText('confidence', language)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Локалізація функцій
function getLocalizedText(key: string, language: 'uk' | 'pl' | 'en'): string {
  const texts = {
    uk: {
      advancedAnalytics: 'Розширена аналітика',
      overview: 'Огляд',
      productivity: 'Продуктивність',
      quality: 'Якість',
      predictions: 'Прогнози',
      loadingAnalytics: 'Завантаження аналітики...',
      analyticsLoadError: 'Помилка завантаження аналітики',
      noAnalyticsData: 'Немає даних для аналізу',
      error: 'Помилка',
      wordsPerDay: 'Слів/день',
      qualityScore: 'Оцінка якості',
      timeToCompletion: 'До завершення',
      confidence: 'Впевненість',
      weeklyActivity: 'Тижнева активність',
      contentPreferences: 'Переваги контенту',
      hourlyActivity: 'Погодинна активність',
      focusAreas: 'Фокусні області',
      qualityTrajectory: 'Траєкторія якості',
      currentTrend: 'Поточна тенденція',
      predictedQuality: 'Прогнозована якість',
      publishingReadiness: 'Готовність до публікації',
      readinessScore: 'Оцінка готовності',
      estimatedTimeToReady: 'Час до готовності',
      weeks: 'тижнів',
      blockers: 'Перешкоди',
      riskFactors: 'Фактори ризику',
      opportunities: 'Можливості',
      nextSteps: 'Наступні кроки',
      completionForecast: 'Прогноз завершення',
      estimatedWork: 'Очікувана робота',
      targetDate: 'Цільова дата',
      improving: 'Покращується',
      stable: 'Стабільно',
      declining: 'Погіршується'
    },
    pl: {
      advancedAnalytics: 'Zaawansowana analityka',
      overview: 'Przegląd',
      productivity: 'Produktywność',
      quality: 'Jakość',
      predictions: 'Prognozy',
      loadingAnalytics: 'Ładowanie analityki...',
      analyticsLoadError: 'Błąd ładowania analityki',
      noAnalyticsData: 'Brak danych do analizy',
      error: 'Błąd',
      wordsPerDay: 'Słów/dzień',
      qualityScore: 'Ocena jakości',
      timeToCompletion: 'Do ukończenia',
      confidence: 'Pewność',
      weeklyActivity: 'Aktywność tygodniowa',
      contentPreferences: 'Preferencje treści',
      hourlyActivity: 'Aktywność godzinowa',
      focusAreas: 'Obszary fokusa',
      qualityTrajectory: 'Trajektoria jakości',
      currentTrend: 'Obecny trend',
      predictedQuality: 'Przewidywana jakość',
      publishingReadiness: 'Gotowość do publikacji',
      readinessScore: 'Ocena gotowości',
      estimatedTimeToReady: 'Czas do gotowości',
      weeks: 'tygodni',
      blockers: 'Przeszkody',
      riskFactors: 'Czynniki ryzyka',
      opportunities: 'Możliwości',
      nextSteps: 'Następne kroki',
      completionForecast: 'Prognoza ukończenia',
      estimatedWork: 'Szacowana praca',
      targetDate: 'Data docelowa',
      improving: 'Poprawia się',
      stable: 'Stabilnie',
      declining: 'Pogarsza się'
    },
    en: {
      advancedAnalytics: 'Advanced Analytics',
      overview: 'Overview',
      productivity: 'Productivity',
      quality: 'Quality',
      predictions: 'Predictions',
      loadingAnalytics: 'Loading analytics...',
      analyticsLoadError: 'Failed to load analytics',
      noAnalyticsData: 'No data available for analysis',
      error: 'Error',
      wordsPerDay: 'Words/day',
      qualityScore: 'Quality Score',
      timeToCompletion: 'Time to completion',
      confidence: 'Confidence',
      weeklyActivity: 'Weekly Activity',
      contentPreferences: 'Content Preferences',
      hourlyActivity: 'Hourly Activity',
      focusAreas: 'Focus Areas',
      qualityTrajectory: 'Quality Trajectory',
      currentTrend: 'Current Trend',
      predictedQuality: 'Predicted Quality',
      publishingReadiness: 'Publishing Readiness',
      readinessScore: 'Readiness Score',
      estimatedTimeToReady: 'Time to Ready',
      weeks: 'weeks',
      blockers: 'Blockers',
      riskFactors: 'Risk Factors',
      opportunities: 'Opportunities',
      nextSteps: 'Next Steps',
      completionForecast: 'Completion Forecast',
      estimatedWork: 'Estimated Work',
      targetDate: 'Target Date',
      improving: 'Improving',
      stable: 'Stable',
      declining: 'Declining'
    }
  };

  return texts[language]?.[key] || texts.uk[key] || key;
}

function getLocalizedDayName(day: string, language: 'uk' | 'pl' | 'en'): string {
  const dayNames = {
    uk: {
      monday: 'Понеділок',
      tuesday: 'Вівторок',
      wednesday: 'Середа',
      thursday: 'Четвер',
      friday: 'П\'ятниця',
      saturday: 'Субота',
      sunday: 'Неділя'
    },
    pl: {
      monday: 'Poniedziałek',
      tuesday: 'Wtorek',
      wednesday: 'Środa',
      thursday: 'Czwartek',
      friday: 'Piątek',
      saturday: 'Sobota',
      sunday: 'Niedziela'
    },
    en: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    }
  };

  const lowerDay = day.toLowerCase();
  return dayNames[language]?.[lowerDay] || day;
}

function getLocalizedContentType(type: string, language: 'uk' | 'pl' | 'en'): string {
  const typeNames = {
    uk: {
      characters: 'Персонажі',
      locations: 'Локації',
      creatures: 'Створіння',
      events: 'Події',
      artifacts: 'Артефакти',
      lore: 'Знання'
    },
    pl: {
      characters: 'Postacie',
      locations: 'Lokacje',
      creatures: 'Stworzenia',
      events: 'Wydarzenia',
      artifacts: 'Artefakty',
      lore: 'Wiedza'
    },
    en: {
      characters: 'Characters',
      locations: 'Locations',
      creatures: 'Creatures',
      events: 'Events',
      artifacts: 'Artifacts',
      lore: 'Lore'
    }
  };

  return typeNames[language]?.[type] || type;
}