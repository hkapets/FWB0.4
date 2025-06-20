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

const noteSchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  description: z
    .object({ uk: z.string().max(3000), en: z.string().max(3000) })
    .optional(),
  icon: z.string().max(2).optional(),
  image: z.string().optional(),
  type: z.string().min(1).optional(),
  tags: z.string().optional(),
  date: z.string().optional(),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
});

type NoteForm = z.infer<typeof noteSchema>;

type CreateNoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NoteForm) => void;
  initialData?: Partial<NoteForm>;
  allNotes?: { id: number | string; name?: { uk?: string } }[];
};

export default function CreateNoteModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  allNotes = [],
}: CreateNoteModalProps) {
  const { toast } = useToast();
  const t = useTranslation();

  const parentOptions = (
    allNotes as { id: number | string; name?: { uk?: string } }[]
  )
    .filter(
      (n): n is { id: number | string; name?: { uk?: string } } =>
        !!n && typeof n.id !== "undefined"
    )
    .map((n) => ({
      value: String(n.id),
      label: n.name && n.name.uk ? n.name.uk : String(n.id),
    }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            {t.actions.add} Замітка
          </DialogTitle>
        </DialogHeader>
        <EntityForm
          schema={noteSchema}
          defaultValues={
            initialData || {
              name: { uk: "", en: "" },
              description: { uk: "", en: "" },
              icon: "",
              image: undefined,
              type: "note",
              tags: "",
              date: "",
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
            {
              name: "tags",
              label: "Теги (через кому)",
              type: "text",
              required: false,
              maxLength: 200,
            },
            { name: "date", label: "Дата", type: "text", required: false },
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
