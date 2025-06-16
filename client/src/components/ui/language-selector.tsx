import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, useTranslation, type Language } from "@/lib/i18n";

const languageFlags: Record<Language, string> = {
  uk: '🇺🇦',
  en: '🇺🇸',
  pl: '🇵🇱',
};

export default function LanguageSelector() {
  const { language, setLanguage } = useI18n();
  const t = useTranslation();

  const languages: { value: Language; label: string }[] = [
    { value: 'uk', label: t.languages.ukrainian },
    { value: 'en', label: t.languages.english },
    { value: 'pl', label: t.languages.polish },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 px-0"
        >
          <span className="text-lg">{languageFlags[language]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => setLanguage(lang.value)}
            className={`flex items-center space-x-2 ${
              language === lang.value ? 'bg-purple-900/30' : ''
            }`}
          >
            <span className="text-sm">{languageFlags[lang.value]}</span>
            <span className="text-sm">{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}