import { useTranslation } from "@/lib/i18n";

export default function BestiaryPage() {
  const t = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{t.lore.bestiary}</h1>
      <p>Bestiary content coming soon...</p>
    </div>
  );
}
