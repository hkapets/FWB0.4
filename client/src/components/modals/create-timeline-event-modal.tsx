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

const timelineEventSchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  description: z
    .object({ uk: z.string().max(3000), en: z.string().max(3000) })
    .optional(),
  icon: z.string().max(2).optional(),
  image: z.string().optional(),
  type: z.string().min(1).optional(),
  date: z.string().optional(),
  importance: z.string().optional(),
  tags: z.string().optional(),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
});

type TimelineEventForm = z.infer<typeof timelineEventSchema>;

type CreateTimelineEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TimelineEventForm) => void;
  initialData?: Partial<TimelineEventForm>;
  allEvents?: { id: number | string; name?: { uk?: string } }[];
};

const importanceOptions = [
  { value: "low", label: "Низька" },
  { value: "medium", label: "Середня" },
  { value: "high", label: "Висока" },
];

export default function CreateTimelineEventModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  allEvents = [],
}: CreateTimelineEventModalProps) {
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
      <DialogContent className="fantasy-border max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            {t.actions.add} Подія таймлайну
          </DialogTitle>
        </DialogHeader>
        <EntityForm
          schema={timelineEventSchema}
          defaultValues={
            initialData || {
              name: { uk: "", en: "" },
              description: { uk: "", en: "" },
              icon: "",
              image: undefined,
              type: "timeline-event",
              date: "",
              importance: "medium",
              tags: "",
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
              maxLength: 3000,
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
              name: "tags",
              label: "Теги (через кому)",
              type: "text",
              required: false,
              maxLength: 200,
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
