import { useTranslation } from "@/lib/i18n";

export default function EventsPage() {
  const t = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{t.lore.events}</h1>
      <p>Events content coming soon...</p>
    </div>
  );
}
