import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Users, 
  MapPin, 
  Sword,
  Loader2 
} from 'lucide-react';

interface ValidationIssue {
  type: 'error' | 'warning' | 'suggestion';
  category: string;
  message: string;
  entities?: string[];
  severity: 'low' | 'medium' | 'high';
}

interface ValidationReport {
  score: number;
  issues: ValidationIssue[];
  summary: {
    totalEntities: number;
    connectedEntities: number;
    orphanedEntities: number;
    dateConflicts: number;
  };
}

interface WorldValidatorProps {
  worldId: number;
}

export default function WorldValidator({ worldId }: WorldValidatorProps) {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const runValidation = async () => {
    setIsValidating(true);
    
    try {
      // Симуляція валідації - тут буде реальний API запит
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockReport: ValidationReport = {
        score: 78,
        issues: [
          {
            type: 'error',
            category: 'Дати',
            message: 'Конфлікт дат: Народження персонажа "Елара" після його смерті',
            entities: ['Елара'],
            severity: 'high'
          },
          {
            type: 'warning',
            category: 'Звязки',
            message: 'Локація "Темний ліс" не має жодних звязків з персонажами',
            entities: ['Темний ліс'],
            severity: 'medium'
          },
          {
            type: 'suggestion',
            category: 'Розвиток',
            message: 'Раса "Ельфи" може мати більше культурних традицій',
            entities: ['Ельфи'],
            severity: 'low'
          },
          {
            type: 'warning',
            category: 'Магія',
            message: 'Артефакт "Посох Вогню" не має опису джерела магії',
            entities: ['Посох Вогню'],
            severity: 'medium'
          }
        ],
        summary: {
          totalEntities: 45,
          connectedEntities: 38,
          orphanedEntities: 7,
          dateConflicts: 1
        }
      };
      
      setReport(mockReport);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  const getIssueColor = (type: string, severity: string) => {
    if (type === 'error') return 'bg-red-900/20 text-red-200 border-red-600/30';
    if (type === 'warning') return 'bg-orange-900/20 text-orange-200 border-orange-600/30';
    return 'bg-blue-900/20 text-blue-200 border-blue-600/30';
  };

  const getSeverityLabel = (severity: string) => {
    const labels = {
      low: 'Низька',
      medium: 'Середня',
      high: 'Висока'
    };
    return labels[severity as keyof typeof labels] || severity;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <Card className="fantasy-border bg-black/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Валідація світу
            </CardTitle>
            <Button 
              onClick={runValidation} 
              disabled={isValidating}
              className="fantasy-button gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Перевіряю...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Запустити перевірку
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {!report && !isValidating && (
          <CardContent>
            <div className="text-center text-gray-400 py-8">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Натисніть кнопку вище для перевірки світу на суперечності</p>
              <p className="text-sm mt-2">Система проаналізує дати, звязки та логічність елементів</p>
            </div>
          </CardContent>
        )}

        {report && (
          <CardContent className="space-y-6">
            {/* Загальна оцінка */}
            <div className="text-center space-y-3">
              <div className={`text-4xl font-bold ${getScoreColor(report.score)}`}>
                {report.score}/100
              </div>
              <p className="text-gray-300">Загальна оцінка світу</p>
              <Progress value={report.score} className="w-full" />
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">
                  {report.summary.totalEntities}
                </div>
                <p className="text-gray-400 text-sm">Всього елементів</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">
                  {report.summary.connectedEntities}
                </div>
                <p className="text-gray-400 text-sm">Звязані</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-300">
                  {report.summary.orphanedEntities}
                </div>
                <p className="text-gray-400 text-sm">Ізольовані</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-300">
                  {report.summary.dateConflicts}
                </div>
                <p className="text-gray-400 text-sm">Конфліктів дат</p>
              </div>
            </div>

            {/* Проблеми та рекомендації */}
            <div className="space-y-4">
              <h3 className="text-fantasy-gold-300 font-semibold text-lg">
                Знайдені проблеми ({report.issues.length})
              </h3>
              
              {report.issues.map((issue, index) => {
                const Icon = getIssueIcon(issue.type);
                return (
                  <Alert key={index} className={`border ${getIssueColor(issue.type, issue.severity)}`}>
                    <Icon className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {issue.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getSeverityLabel(issue.severity)}
                            </Badge>
                          </div>
                          <p className="text-sm">{issue.message}</p>
                          {issue.entities && (
                            <p className="text-xs text-gray-400">
                              Елементи: {issue.entities.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                );
              })}
            </div>

            {/* Рекомендації для покращення */}
            <div className="space-y-3">
              <h3 className="text-fantasy-gold-300 font-semibold text-lg">
                Рекомендації для покращення
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-900/20 border border-green-600/30 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-300" />
                    <span className="text-green-300 font-medium">Хронологія</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Додайте більше історичних подій для створення глибшої історії світу
                  </p>
                </div>
                
                <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-300" />
                    <span className="text-blue-300 font-medium">Персонажі</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Створіть більше звязків між персонажами для цікавіших історій
                  </p>
                </div>
                
                <div className="p-4 bg-purple-900/20 border border-purple-600/30 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-purple-300" />
                    <span className="text-purple-300 font-medium">Локації</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Додайте опис клімату та географічних особливостей локацій
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Sword className="w-4 h-4 text-yellow-300" />
                    <span className="text-yellow-300 font-medium">Артефакти</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Опишіть історію створення та попередніх власників артефактів
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}