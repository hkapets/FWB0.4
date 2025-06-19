import { useTranslation } from "@/lib/i18n";

export default function ArtifactsPage() {
  const t = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{t.lore.artifacts}</h1>
      <p>Artifacts content coming soon...</p>
    </div>
  );
}
