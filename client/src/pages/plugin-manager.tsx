import PluginManager from '@/components/plugins/plugin-manager';
import { useTranslation } from 'react-i18next';

export default function PluginManagerPage() {
  const { i18n } = useTranslation();

  const getLanguageCode = (): 'uk' | 'pl' | 'en' => {
    const lang = i18n.language;
    if (lang.startsWith('uk')) return 'uk';
    if (lang.startsWith('pl')) return 'pl';
    return 'en';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PluginManager language={getLanguageCode()} />
    </div>
  );
}