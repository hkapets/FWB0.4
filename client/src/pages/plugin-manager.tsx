import PluginManager from '@/components/plugins/plugin-manager';
import { useTranslation } from '@/lib/i18n';

export default function PluginManagerPage() {
  const t = useTranslation();

  const getLanguageCode = (): 'uk' | 'pl' | 'en' => {
    return 'uk';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PluginManager language={getLanguageCode()} />
    </div>
  );
}