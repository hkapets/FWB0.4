import { useTranslation } from "@/lib/i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateRelationModal from "@/components/modals/create-relation-modal";
import { useToast } from "@/hooks/use-toast";

export default function RelationsPage() {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 flex items-center justify-between">
        {t.navigation.relations}
        <Button onClick={() => setIsOpen(true)}>{t.actions.add}</Button>
      </h1>
      <p>Relations content coming soon...</p>
      <CreateRelationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(data) => {
          toast({ title: "Зв'язок створено!", description: data.name.uk });
          setIsOpen(false);
        }}
      />
    </div>
  );
}
