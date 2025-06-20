import { useTranslation } from "@/lib/i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateMythologyModal from "@/components/modals/create-mythology-modal";
import { useToast } from "@/hooks/use-toast";

export default function MythologyPage() {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 flex items-center justify-between">
        Міфологія
        <Button onClick={() => setIsOpen(true)}>{t.actions.add}</Button>
      </h1>
      <p>Mythology content coming soon...</p>
      <CreateMythologyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(data) => {
          toast({ title: "Міфологію створено!", description: data.name.uk });
          setIsOpen(false);
        }}
      />
    </div>
  );
}
