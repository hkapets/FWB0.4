import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

export function useBehaviorTracker() {
  const [location] = useLocation();
  const startTime = useRef<number>(Date.now());
  const lastAction = useRef<string>('');

  const trackAction = async (action: string, context?: string, metadata?: any) => {
    const duration = Date.now() - startTime.current;
    
    try {
      await fetch('/api/analytics/track-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          context: context || location,
          duration,
          metadata
        })
      });
    } catch (error) {
      // Мовчазний fallback - не показуємо помилки трекінгу
      console.debug('Tracking failed:', error);
    }

    startTime.current = Date.now();
  };

  // Автоматичне відстеження навігації
  useEffect(() => {
    if (lastAction.current && lastAction.current !== location) {
      trackAction('navigation', location);
    }
    lastAction.current = location;
  }, [location]);

  // Відстеження часу на сторінці при виході
  useEffect(() => {
    const handleBeforeUnload = () => {
      const duration = Date.now() - startTime.current;
      if (duration > 5000) { // Мінімум 5 секунд
        navigator.sendBeacon('/api/analytics/track-action', JSON.stringify({
          action: 'page_time',
          context: location,
          duration
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location]);

  return { trackAction };
}