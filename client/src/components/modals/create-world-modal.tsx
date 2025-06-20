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

const worldSchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  description: z
    .object({ uk: z.string().max(3000), en: z.string().max(3000) })
    .optional(),
  icon: z.string().max(2).optional(),
  image: z.string().optional(),
  type: z.string().min(1).optional(),
  genre: z.string().optional(),
  size: z.string().optional(),
  era: z.string().optional(),
  settings: z.string().optional(),
  order: z.number().optional(),
});

type WorldForm = z.infer<typeof worldSchema>;

type CreateWorldModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorldForm) => void;
  initialData?: Partial<WorldForm>;
};

const genreOptions = [
  { value: "fantasy", label: "Fantasy" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "historical", label: "Historical" },
  { value: "modern", label: "Modern" },
  { value: "other", label: "Other" },
];

export default function CreateWorldModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CreateWorldModalProps) {
  const { toast } = useToast();
  const t = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            {t.actions.add} Світ
          </DialogTitle>
        </DialogHeader>
        <EntityForm
          schema={worldSchema}
          defaultValues={
            initialData || {
              name: { uk: "", en: "" },
              description: { uk: "", en: "" },
              icon: "",
              image: undefined,
              type: "fantasy",
              genre: "fantasy",
              size: "",
              era: "",
              settings: "",
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
              name: "genre",
              label: "Жанр",
              type: "select",
              options: genreOptions,
              required: false,
            },
            {
              name: "size",
              label: "Розмір/Масштаб",
              type: "text",
              required: false,
              maxLength: 100,
            },
            {
              name: "era",
              label: "Епоха/Час",
              type: "text",
              required: false,
              maxLength: 100,
            },
            {
              name: "settings",
              label: "Налаштування/Особливості",
              type: "textarea",
              required: false,
              maxLength: 1000,
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
