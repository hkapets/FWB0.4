import { useTranslation } from "@/lib/i18n";

export default function NotesPage() {
  const t = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{t.navigation.notes}</h1>
      <p>Notes content coming soon...</p>
    </div>
  );
}
