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

const artifactSchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  description: z
    .object({ uk: z.string().max(2000), en: z.string().max(2000) })
    .optional(),
  icon: z.string().max(2).optional(),
  image: z.string().optional(),
  type: z.string().min(1).optional(),
  rarity: z.string().min(1).optional(),
  power: z.string().optional(),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
});

type ArtifactForm = z.infer<typeof artifactSchema>;

type CreateArtifactModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ArtifactForm) => void;
  initialData?: Partial<ArtifactForm>;
  allArtifacts?: { id: number | string; name?: { uk?: string } }[];
};

const rarityOptions = [
  { value: "common", label: "Звичайний" },
  { value: "uncommon", label: "Незвичайний" },
  { value: "rare", label: "Рідкісний" },
  { value: "epic", label: "Епічний" },
  { value: "legendary", label: "Легендарний" },
];

export default function CreateArtifactModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  allArtifacts = [],
}: CreateArtifactModalProps) {
  const { toast } = useToast();
  const t = useTranslation();

  const parentOptions = (
    allArtifacts as { id: number | string; name?: { uk?: string } }[]
  )
    .filter(
      (a): a is { id: number | string; name?: { uk?: string } } =>
        !!a && typeof a.id !== "undefined"
    )
    .map((a) => ({
      value: String(a.id),
      label: a.name && a.name.uk ? a.name.uk : String(a.id),
    }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-200 flex items-center gap-2">
            💎 {t.actions.add} Артефакт
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-sm">
            Створіть новий магічний артефакт для вашого світу
          </DialogDescription>
        </DialogHeader>
        <EntityForm
          schema={artifactSchema}
          defaultValues={
            initialData || {
              name: { uk: "", en: "" },
              description: { uk: "", en: "" },
              icon: "",
              image: undefined,
              type: "artifact",
              rarity: "common",
              power: "",
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
              name: "rarity",
              label: "Рідкість",
              type: "select",
              options: rarityOptions,
              required: false,
            },
            {
              name: "power",
              label: "Сила/Ефект",
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
