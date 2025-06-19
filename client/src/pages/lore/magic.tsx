import { useTranslation } from "@/lib/i18n";

export default function MagicPage() {
  const t = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{t.lore.magic}</h1>
      <p>Magic content coming soon...</p>
    </div>
  );
}
