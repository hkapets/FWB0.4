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

const relationSchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  description: z
    .object({ uk: z.string().max(2000), en: z.string().max(2000) })
    .optional(),
  icon: z.string().max(2).optional(),
  image: z.string().optional(),
  type: z.string().min(1).optional(),
  participants: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
});

type RelationForm = z.infer<typeof relationSchema>;

type CreateRelationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RelationForm) => void;
  initialData?: Partial<RelationForm>;
  allRelations?: { id: number | string; name?: { uk?: string } }[];
};

const statusOptions = [
  { value: "active", label: "Активний" },
  { value: "inactive", label: "Неактивний" },
  { value: "ended", label: "Завершений" },
];

export default function CreateRelationModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  allRelations = [],
}: CreateRelationModalProps) {
  const { toast } = useToast();
  const t = useTranslation();

  const parentOptions = (
    allRelations as { id: number | string; name?: { uk?: string } }[]
  )
    .filter(
      (r): r is { id: number | string; name?: { uk?: string } } =>
        !!r && typeof r.id !== "undefined"
    )
    .map((r) => ({
      value: String(r.id),
      label: r.name && r.name.uk ? r.name.uk : String(r.id),
    }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            {t.actions.add} Зв'язок
          </DialogTitle>
        </DialogHeader>
        <EntityForm
          schema={relationSchema}
          defaultValues={
            initialData || {
              name: { uk: "", en: "" },
              description: { uk: "", en: "" },
              icon: "",
              image: undefined,
              type: "relation",
              participants: "",
              startDate: "",
              endDate: "",
              status: "active",
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
              name: "participants",
              label: "Учасники (ID або імена через кому)",
              type: "text",
              required: false,
              maxLength: 200,
            },
            {
              name: "startDate",
              label: "Дата початку",
              type: "text",
              required: false,
            },
            {
              name: "endDate",
              label: "Дата завершення",
              type: "text",
              required: false,
            },
            {
              name: "status",
              label: "Статус",
              type: "select",
              options: statusOptions,
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
