import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Brain } from 'lucide-react';
import AnalyticsDashboard from '@/components/analytics/analytics-dashboard';
import { useTranslation } from 'react-i18next';

interface AnalyticsButtonProps {
  worldId: number;
}

export default function AnalyticsButton({ worldId }: AnalyticsButtonProps) {
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
          className="gap-2 border-purple-600/30 hover:border-purple-500/50 text-purple-200 hover:text-purple-100"
        >
          <Brain className="w-4 h-4" />
          Аналітика
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto fantasy-modal">
        <DialogHeader>
          <DialogTitle className="text-fantasy-gold-300 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Розширена аналітика світу
          </DialogTitle>
        </DialogHeader>
        <AnalyticsDashboard worldId={worldId} language={getLanguageCode()} />
      </DialogContent>
    </Dialog>
  );
}