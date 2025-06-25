import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Lightbulb } from 'lucide-react';
import RecommendationPanel from '@/components/analytics/recommendation-panel';
import { useTranslation } from 'react-i18next';

interface RecommendationsButtonProps {
  worldId: number;
}

export default function RecommendationsButton({ worldId }: RecommendationsButtonProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  if (!worldId) return null;

  const getLanguageCode = (): 'uk' | 'pl' | 'en' => {
    const lang = i18n.language;
    if (lang.startsWith('uk')) return 'uk';
    if (lang.startsWith('pl')) return 'pl';
    return 'en';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-yellow-600/30 hover:border-yellow-500/50 text-yellow-200 hover:text-yellow-100"
        >
          <Lightbulb className="w-4 h-4" />
          Рекомендації
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto fantasy-modal">
        <DialogHeader>
          <DialogTitle className="text-fantasy-gold-300 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            ШІ Рекомендації
          </DialogTitle>
        </DialogHeader>
        <RecommendationPanel worldId={worldId} language={getLanguageCode()} />
      </DialogContent>
    </Dialog>
  );
}