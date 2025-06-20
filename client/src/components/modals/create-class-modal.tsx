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

const classSchema = z.object({
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

type ClassForm = z.infer<typeof classSchema>;

type CreateEditClassModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClassForm) => void;
  initialData?: Partial<ClassForm>;
  worldId: number;
  allClasses?: { id: number | string; name?: { uk?: string } }[];
};

export default function CreateEditClassModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  worldId,
  allClasses = [],
}: CreateEditClassModalProps) {
  const { toast } = useToast();
  const t = useTranslation();

  const parentOptions = (
    allClasses as { id: number | string; name?: { uk?: string } }[]
  )
    .filter(
      (c): c is { id: number | string; name?: { uk?: string } } =>
        !!c &&
        typeof c.id !== "undefined" &&
        (!initialData || c.id !== (initialData as any)?.id)
    )
    .map((c) => ({
      value: String(c.id),
      label: c.name && c.name.uk ? c.name.uk : String(c.id),
    }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            {t.actions.add} Клас
          </DialogTitle>
        </DialogHeader>
        <EntityForm
          schema={classSchema}
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
