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

const geographySchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  description: z
    .object({ uk: z.string().max(2000), en: z.string().max(2000) })
    .optional(),
  icon: z.string().max(2).optional(),
  image: z.string().optional(),
  type: z.string().min(1).optional(),
  coordinates: z.string().optional(),
  area: z.string().optional(),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
});

type GeographyForm = z.infer<typeof geographySchema>;

type CreateGeographyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GeographyForm) => void;
  initialData?: Partial<GeographyForm>;
  allGeography?: { id: number | string; name?: { uk?: string } }[];
};

export default function CreateGeographyModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  allGeography = [],
}: CreateGeographyModalProps) {
  const { toast } = useToast();
  const t = useTranslation();

  const parentOptions = (
    allGeography as { id: number | string; name?: { uk?: string } }[]
  )
    .filter(
      (g): g is { id: number | string; name?: { uk?: string } } =>
        !!g && typeof g.id !== "undefined"
    )
    .map((g) => ({
      value: String(g.id),
      label: g.name && g.name.uk ? g.name.uk : String(g.id),
    }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            {t.actions.add} Географія
          </DialogTitle>
        </DialogHeader>
        <EntityForm
          schema={geographySchema}
          defaultValues={
            initialData || {
              name: { uk: "", en: "" },
              description: { uk: "", en: "" },
              icon: "",
              image: undefined,
              type: "geography",
              coordinates: "",
              area: "",
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
            {
              name: "coordinates",
              label: "Координати",
              type: "text",
              required: false,
            },
            {
              name: "area",
              label: "Площа/Розмір",
              type: "text",
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
