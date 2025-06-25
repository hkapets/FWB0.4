import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import EntityForm from "@/components/entity-form";
import { z } from "zod";
import React from "react";

const eventSchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  description: z
    .object({ uk: z.string().max(2000), en: z.string().max(2000) })
    .optional(),
  icon: z.string().max(2).optional(),
  image: z.string().optional(),
  type: z.string().min(1).optional(),
  date: z.string().optional(),
  importance: z.string().optional(),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
});

type EventForm = z.infer<typeof eventSchema>;

type CreateEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventForm) => void;
  initialData?: Partial<EventForm>;
  allEvents?: { id: number | string; name?: { uk?: string } }[];
};

const importanceOptions = [
  { value: "low", label: "Низька" },
  { value: "medium", label: "Середня" },
  { value: "high", label: "Висока" },
];

export default function CreateEventModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  allEvents = [],
}: CreateEventModalProps) {
  const { toast } = useToast();
  const t = useTranslation();

  const parentOptions = (
    allEvents as { id: number | string; name?: { uk?: string } }[]
  )
    .filter(
      (e): e is { id: number | string; name?: { uk?: string } } =>
        !!e && typeof e.id !== "undefined"
    )
    .map((e) => ({
      value: String(e.id),
      label: e.name && e.name.uk ? e.name.uk : String(e.id),
    }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-200 flex items-center gap-2">
            📜 {t.actions.add} Подія
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-sm">
            Додайте нову історичну подію до вашого світу
          </DialogDescription>
        </DialogHeader>
        <EntityForm
          schema={eventSchema}
          defaultValues={
            initialData || {
              name: { uk: "", en: "" },
              description: { uk: "", en: "" },
              icon: "",
              image: undefined,
              type: "event",
              date: "",
              importance: "medium",
              parentId: null,
              order: 0,
            }
          }
          onSubmit={onSubmit}
          onCancel={onClose}
          submitLabel={t.forms.create}
          cancelLabel={t.forms.cancel}
          fields={[
            {
              name: "name",
              label: t.forms.name,
              type: "text",
              lang: true,
              required: true,
              maxLength: 100,
            },
            {
              name: "description",
              label: t.forms.description,
              type: "textarea",
              lang: true,
              maxLength: 2000,
            },
            { name: "icon", label: "Іконка", type: "text", maxLength: 2 },
            { name: "image", label: "Зображення", type: "image" },
            {
              name: "type",
              label: t.forms.type || "Тип",
              type: "text",
              required: false,
            },
            { name: "date", label: "Дата/Час", type: "text", required: false },
            {
              name: "importance",
              label: "Важливість",
              type: "select",
              options: importanceOptions,
              required: false,
            },
            {
              name: "parentId",
              label: "Батьківський елемент",
              type: "select",
              options: parentOptions,
              required: false,
            },
            {
              name: "order",
              label: "Порядок",
              type: "number",
              required: false,
            },
          ]}
        />
      </DialogContent>
    </Dialog>
  );
}
