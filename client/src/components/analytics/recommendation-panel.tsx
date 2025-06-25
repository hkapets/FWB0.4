import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, ThumbsUp, ThumbsDown, Clock, Users, MapPin, 
  Zap, Target, TrendingUp, AlertCircle, CheckCircle, Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Recommendation {
  id: string;
  type: 'content' | 'improvement' | 'connection' | 'expansion';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  actionable: boolean;
  estimatedTime: number;
  relatedEntities: string[];
}

interface RecommendationPanelProps {
  worldId: number;
  language?: 'uk' | 'pl' | 'en';
  onRecommendationAccepted?: (recommendation: Recommendation) => void;
}

export default function RecommendationPanel({ 
  worldId, 
  language = 'uk',
  onRecommendationAccepted 
}: RecommendationPanelProps) {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'content' | 'improvement' | 'connection' | 'expansion'>('all');
  const [acceptedRecommendations, setAcceptedRecommendations] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations();
  }, [worldId]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recommendations/${worldId}?language=${language}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      } else {
        throw new Error('Failed to load recommendations');
      }
    } catch (error) {
      toast({
        title: getLocalizedText('error', language),
        description: getLocalizedText('recommendationsLoadError', language),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRecommendation = async (recommendation: Recommendation) => {
    try {
      // Відправити feedback
      await fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          feedback: 'accepted',
          worldId
        })
      });

      setAcceptedRecommendations(prev => new Set([...prev, recommendation.id]));
      
      toast({
        title: getLocalizedText('recommendationAccepted', language),
        description: recommendation.title,
      });

      if (onRecommendationAccepted) {
        onRecommendationAccepted(recommendation);
      }
    } catch (error) {
      toast({
        title: getLocalizedText('error', language),
        description: getLocalizedText('feedbackError', language),
        variant: 'destructive',
      });
    }
  };

  const handleRejectRecommendation = async (recommendation: Recommendation) => {
    try {
      await fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          feedback: 'rejected',
          worldId
        })
      });

      // Видалити з списку
      setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
      
      toast({
        title: getLocalizedText('recommendationRejected', language),
        description: recommendation.title,
      });
    } catch (error) {
      toast({
        title: getLocalizedText('error', language),
        description: getLocalizedText('feedbackError', language),
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-900/20 text-red-200 border-red-600/30';
      case 'medium': return 'bg-yellow-900/20 text-yellow-200 border-yellow-600/30';
      case 'low': return 'bg-green-900/20 text-green-200 border-green-600/30';
      default: return 'bg-gray-900/20 text-gray-200 border-gray-600/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content': return <Lightbulb className="w-4 h-4" />;
      case 'improvement': return <TrendingUp className="w-4 h-4" />;
      case 'connection': return <Users className="w-4 h-4" />;
      case 'expansion': return <MapPin className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'character': return <Users className="w-4 h-4 text-purple-400" />;
      case 'location': return <MapPin className="w-4 h-4 text-blue-400" />;
      case 'plot': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'world': return <Target className="w-4 h-4 text-green-400" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredRecommendations = recommendations.filter(rec => 
    filter === 'all' || rec.type === filter
  );

  if (loading) {
    return (
      <Card className="fantasy-border bg-black/20">
        <CardHeader>
          <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 animate-pulse" />
            {getLocalizedText('loadingRecommendations', language)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-fantasy text-fantasy-gold-300 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          {getLocalizedText('intelligentRecommendations', language)}
        </h3>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            {getLocalizedText('all', language)}
          </Button>
          <Button
            variant={filter === 'content' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('content')}
          >
            {getLocalizedText('content', language)}
          </Button>
          <Button
            variant={filter === 'improvement' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('improvement')}
          >
            {getLocalizedText('improvements', language)}
          </Button>
          <Button
            variant={filter === 'connection' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('connection')}
          >
            {getLocalizedText('connections', language)}
          </Button>
        </div>
      </div>

      {filteredRecommendations.length === 0 ? (
        <Card className="fantasy-border bg-black/20">
          <CardContent className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="text-gray-400">{getLocalizedText('noRecommendations', language)}</p>
            <p className="text-sm text-gray-500 mt-2">
              {getLocalizedText('worldLooksGood', language)}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation) => (
            <Card key={recommendation.id} className="fantasy-border bg-black/20 hover:bg-black/30 transition-colors">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(recommendation.type)}
                        {getCategoryIcon(recommendation.category)}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-200">{recommendation.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{recommendation.description}</p>
                      </div>
                    </div>
                    
                    <Badge className={getPriorityColor(recommendation.priority)}>
                      {getLocalizedText(recommendation.priority, language)}
                    </Badge>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recommendation.estimatedTime} {getLocalizedText('minutes', language)}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {getLocalizedText(recommendation.category, language)}
                    </div>
                    
                    {recommendation.relatedEntities.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {recommendation.relatedEntities.length} {getLocalizedText('entities', language)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!acceptedRecommendations.has(recommendation.id) && (
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        className="fantasy-button gap-2"
                        onClick={() => handleAcceptRecommendation(recommendation)}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        {getLocalizedText('accept', language)}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleRejectRecommendation(recommendation)}
                      >
                        <ThumbsDown className="w-3 h-3" />
                        {getLocalizedText('reject', language)}
                      </Button>
                    </div>
                  )}

                  {acceptedRecommendations.has(recommendation.id) && (
                    <div className="flex items-center gap-2 pt-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">{getLocalizedText('accepted', language)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredRecommendations.length > 0 && (
        <Card className="fantasy-border bg-black/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {getLocalizedText('totalRecommendations', language)}: {filteredRecommendations.length}
              </div>
              
              <div className="text-sm text-gray-400">
                {getLocalizedText('estimatedTime', language)}: {
                  filteredRecommendations.reduce((sum, rec) => sum + rec.estimatedTime, 0)
                } {getLocalizedText('minutes', language)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Локалізація
function getLocalizedText(key: string, language: 'uk' | 'pl' | 'en'): string {
  const texts = {
    uk: {
      intelligentRecommendations: 'Розумні рекомендації',
      loadingRecommendations: 'Завантаження рекомендацій...',
      recommendationsLoadError: 'Помилка завантаження рекомендацій',
      error: 'Помилка',
      all: 'Всі',
      content: 'Контент',
      improvements: 'Покращення',
      connections: 'Зв\'язки',
      noRecommendations: 'Немає нових рекомендацій',
      worldLooksGood: 'Ваш світ виглядає добре збалансованим!',
      recommendationAccepted: 'Рекомендацію прийнято',
      recommendationRejected: 'Рекомендацію відхилено',
      feedbackError: 'Помилка надсилання відгуку',
      high: 'Високий',
      medium: 'Середній',
      low: 'Низький',
      minutes: 'хв',
      entities: 'елементів',
      character: 'Персонаж',
      location: 'Локація',
      plot: 'Сюжет',
      world: 'Світ',
      accept: 'Прийняти',
      reject: 'Відхилити',
      accepted: 'Прийнято',
      totalRecommendations: 'Всього рекомендацій',
      estimatedTime: 'Орієнтовний час'
    },
    pl: {
      intelligentRecommendations: 'Inteligentne rekomendacje',
      loadingRecommendations: 'Ładowanie rekomendacji...',
      recommendationsLoadError: 'Błąd ładowania rekomendacji',
      error: 'Błąd',
      all: 'Wszystkie',
      content: 'Treść',
      improvements: 'Ulepszenia',
      connections: 'Połączenia',
      noRecommendations: 'Brak nowych rekomendacji',
      worldLooksGood: 'Twój świat wygląda na dobrze zrównoważony!',
      recommendationAccepted: 'Rekomendacja zaakceptowana',
      recommendationRejected: 'Rekomendacja odrzucona',
      feedbackError: 'Błąd wysyłania opinii',
      high: 'Wysoki',
      medium: 'Średni',
      low: 'Niski',
      minutes: 'min',
      entities: 'elementów',
      character: 'Postać',
      location: 'Lokacja',
      plot: 'Fabuła',
      world: 'Świat',
      accept: 'Akceptuj',
      reject: 'Odrzuć',
      accepted: 'Zaakceptowano',
      totalRecommendations: 'Łączne rekomendacje',
      estimatedTime: 'Szacowany czas'
    },
    en: {
      intelligentRecommendations: 'Intelligent Recommendations',
      loadingRecommendations: 'Loading recommendations...',
      recommendationsLoadError: 'Failed to load recommendations',
      error: 'Error',
      all: 'All',
      content: 'Content',
      improvements: 'Improvements',
      connections: 'Connections',
      noRecommendations: 'No new recommendations',
      worldLooksGood: 'Your world looks well balanced!',
      recommendationAccepted: 'Recommendation accepted',
      recommendationRejected: 'Recommendation rejected',
      feedbackError: 'Error sending feedback',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      minutes: 'min',
      entities: 'entities',
      character: 'Character',
      location: 'Location',
      plot: 'Plot',
      world: 'World',
      accept: 'Accept',
      reject: 'Reject',
      accepted: 'Accepted',
      totalRecommendations: 'Total recommendations',
      estimatedTime: 'Estimated time'
    }
  };

  return texts[language]?.[key] || texts.uk[key] || key;
}