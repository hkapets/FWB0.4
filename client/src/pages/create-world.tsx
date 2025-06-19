import { useTranslation } from "@/lib/i18n";

export default function CreateWorldPage() {
  const t = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{t.navigation.createWorld}</h1>
      <p>Create World content coming soon...</p>
    </div>
  );
}
