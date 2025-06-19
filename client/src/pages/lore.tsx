import { useTranslation } from "@/lib/i18n";

export default function LorePage() {
  const t = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{t.navigation.lore}</h1>
      <p>Lore content coming soon...</p>
    </div>
  );
}
