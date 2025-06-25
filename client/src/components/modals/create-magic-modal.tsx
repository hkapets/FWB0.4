import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EntityForm from "@/components/entity-form";

const magicSchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  description: z
    .object({ uk: z.string().max(1000), en: z.string().max(1000) })
    .optional(),
  icon: z.string().max(2).optional(),
  image: z.string().optional(),
  type: z.string().min(1).optional(),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
});

type MagicForm = z.infer<typeof magicSchema>;

type CreateEditMagicModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MagicForm) => void;
  initialData?: Partial<MagicForm>;
  worldId: number;
  allMagic?: { id: number | string; name?: { uk?: string } }[];
};

export default function CreateEditMagicModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  worldId,
  allMagic = [],
}: CreateEditMagicModalProps) {
  const { toast } = useToast();
  const t = useTranslation();

  const parentOptions = (
    allMagic as { id: number | string; name?: { uk?: string } }[]
  )
    .filter(
      (m): m is { id: number | string; name?: { uk?: string } } =>
        !!m &&
        typeof m.id !== "undefined" &&
        (!initialData || m.id !== (initialData as any)?.id)
    )
    .map((m) => ({
      value: String(m.id),
      label: m.name && m.name.uk ? m.name.uk : String(m.id),
    }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-200 flex items-center gap-2">
            ✨ {t.actions.add} Магія
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-sm">
            Додайте нову магічну систему до вашого світу
          </DialogDescription>
        </DialogHeader>
        <EntityForm
          schema={magicSchema}
          defaultValues={
            initialData || {
              name: { uk: "", en: "" },
              description: { uk: "", en: "" },
              icon: "",
              image: undefined,
              type: "custom",
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
              maxLength: 1000,
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
