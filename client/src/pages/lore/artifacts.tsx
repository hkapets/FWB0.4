import { useTranslation } from "@/lib/i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateArtifactModal from "@/components/modals/create-artifact-modal";
import { useToast } from "@/hooks/use-toast";

export default function ArtifactsPage() {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 flex items-center justify-between">
        {t.lore.artifacts}
        <Button onClick={() => setIsOpen(true)}>{t.actions.add}</Button>
      </h1>
      <p>Artifacts content coming soon...</p>
      <CreateArtifactModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(data) => {
          toast({ title: "Артефакт створено!", description: data.name.uk });
          setIsOpen(false);
        }}
      />
    </div>
  );
}
