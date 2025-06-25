import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Terminal, CheckCircle, ExternalLink } from "lucide-react";

interface OllamaSetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OllamaSetupGuide({ isOpen, onClose }: OllamaSetupGuideProps) {
  if (!isOpen) return null;

  const handleDownloadOllama = () => {
    window.open('https://ollama.ai/download', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="fantasy-border bg-gray-900/95 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Налаштування Ollama AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-blue-600/50 bg-blue-900/20">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle className="text-blue-200">Локальний AI асистент</AlertTitle>
            <AlertDescription className="text-blue-300">
              Ollama дозволяє використовувати AI моделі локально на вашому комп'ютері без відправки даних у хмару.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-fantasy-gold-300">Крок 1: Встановлення Ollama</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                onClick={handleDownloadOllama}
                className="fantasy-button flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Windows
              </Button>
              <Button 
                onClick={handleDownloadOllama}
                className="fantasy-button flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                macOS
              </Button>
              <Button 
                onClick={handleDownloadOllama}
                className="fantasy-button flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Linux
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-fantasy-gold-300">Крок 2: Встановлення моделі Mistral</h3>
            <div className="bg-gray-800/50 p-4 rounded border border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-mono text-sm">Термінал / Командний рядок</span>
              </div>
              <code className="text-green-300 font-mono text-sm block">
                ollama pull mistral
              </code>
            </div>
            <p className="text-gray-400 text-sm">
              Ця команда завантажить модель Mistral (~4GB). Процес може зайняти кілька хвилин.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-fantasy-gold-300">Крок 3: Запуск Ollama</h3>
            <div className="bg-gray-800/50 p-4 rounded border border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-mono text-sm">Термінал / Командний рядок</span>
              </div>
              <code className="text-green-300 font-mono text-sm block">
                ollama serve
              </code>
            </div>
            <p className="text-gray-400 text-sm">
              Ollama запуститься на порту 11434. Залиште термінал відкритим під час роботи з AI функціями.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-fantasy-gold-300">Системні вимоги</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-purple-200">RAM</Badge>
                <span className="text-gray-300 text-sm">8GB+ рекомендовано</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-purple-200">Диск</Badge>
                <span className="text-gray-300 text-sm">4GB+ вільного місця</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-purple-200">GPU</Badge>
                <span className="text-gray-300 text-sm">Опціонально (прискорює роботу)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-purple-200">ОС</Badge>
                <span className="text-gray-300 text-sm">Windows/macOS/Linux</span>
              </div>
            </div>
          </div>

          <Alert className="border-green-600/50 bg-green-900/20">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle className="text-green-200">Готово!</AlertTitle>
            <AlertDescription className="text-green-300">
              Після виконання цих кроків ви зможете використовувати AI асистент для генерації імен, описів та подій.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Зрозуміло
            </Button>
            <Button 
              onClick={handleDownloadOllama}
              className="fantasy-button"
            >
              Завантажити Ollama
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}