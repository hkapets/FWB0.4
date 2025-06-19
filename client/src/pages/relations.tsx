import { useTranslation } from "@/lib/i18n";

export default function RelationsPage() {
  const t = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{t.navigation.relations}</h1>
      <p>Relations content coming soon...</p>
    </div>
  );
}
