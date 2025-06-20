import { useTranslation } from "@/lib/i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateMagicModal from "@/components/modals/create-magic-modal";
import { useToast } from "@/hooks/use-toast";

export default function MagicPage() {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 flex items-center justify-between">
        {t.lore.magic}
        <Button onClick={() => setIsOpen(true)}>{t.actions.add}</Button>
      </h1>
      <p>Magic content coming soon...</p>
      <CreateMagicModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(data) => {
          toast({ title: "Магія створена!", description: data.name.uk });
          setIsOpen(false);
        }}
        worldId={1}
      />
    </div>
  );
}
