import { useTranslation } from "@/lib/i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateWorldModal from "@/components/modals/create-world-modal";
import { useToast } from "@/hooks/use-toast";

export default function CreateWorldPage() {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 flex items-center justify-between">
        {t.navigation.createWorld}
        <Button onClick={() => setIsOpen(true)}>{t.actions.add}</Button>
      </h1>
      <p>World creation content coming soon...</p>
      <CreateWorldModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(data) => {
          toast({ title: "Світ створено!", description: data.name.uk });
          setIsOpen(false);
        }}
      />
    </div>
  );
}
