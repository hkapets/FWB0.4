import { useTranslation } from "@/lib/i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateEventModal from "@/components/modals/create-event-modal";
import { useToast } from "@/hooks/use-toast";

export default function EventsPage() {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 flex items-center justify-between">
        {t.lore.events}
        <Button onClick={() => setIsOpen(true)}>{t.actions.add}</Button>
      </h1>
      <p>Events content coming soon...</p>
      <CreateEventModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(data) => {
          toast({ title: "Подію створено!", description: data.name.uk });
          setIsOpen(false);
        }}
      />
    </div>
  );
}
