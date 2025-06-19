import { useTranslation } from "@/lib/i18n";

export default function GeographyPage() {
  const t = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{t.lore.geography}</h1>
      <p>Geography content coming soon...</p>
    </div>
  );
}
