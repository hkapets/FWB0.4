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

const mythologySchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  description: z
    .object({ uk: z.string().max(2000), en: z.string().max(2000) })
    .optional(),
  icon: z.string().max(2).optional(),
  image: z.string().optional(),
  type: z.string().min(1).optional(),
  deities: z.string().optional(),
  legends: z.string().optional(),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
});

type MythologyForm = z.infer<typeof mythologySchema>;

type CreateMythologyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MythologyForm) => void;
  initialData?: Partial<MythologyForm>;
  allMythologies?: { id: number | string; name?: { uk?: string } }[];
};

export default function CreateMythologyModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  allMythologies = [],
}: CreateMythologyModalProps) {
  const { toast } = useToast();
  const t = useTranslation();

  const parentOptions = (
    allMythologies as { id: number | string; name?: { uk?: string } }[]
  )
    .filter(
      (m): m is { id: number | string; name?: { uk?: string } } =>
        !!m && typeof m.id !== "undefined"
    )
    .map((m) => ({
      value: String(m.id),
      label: m.name && m.name.uk ? m.name.uk : String(m.id),
    }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            {t.actions.add} Міфологія
          </DialogTitle>
        </DialogHeader>
        <EntityForm
          schema={mythologySchema}
          defaultValues={
            initialData || {
              name: { uk: "", en: "" },
              description: { uk: "", en: "" },
              icon: "",
              image: undefined,
              type: "mythology",
              deities: "",
              legends: "",
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
              name: "deities",
              label: "Божества/Істоти",
              type: "text",
              required: false,
              maxLength: 500,
            },
            {
              name: "legends",
              label: "Легенди/Міфи",
              type: "textarea",
              required: false,
              maxLength: 1000,
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
