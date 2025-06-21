import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import EntityForm from "@/components/entity-form";

const raceSchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  description: z
    .object({ uk: z.string().max(1000), en: z.string().max(1000) })
    .optional(),
  characteristics: z.string().max(500).optional(),
  origin: z.string().max(200).optional(),
  homeland: z.string().max(200).optional(),
  enemies: z.string().max(200).optional(),
  allies: z.string().max(200).optional(),
  leaders: z.string().max(200).optional(),
  skills: z.string().max(500).optional(),
  population: z.string().max(100).optional(),
  icon: z.string().max(2).optional(),
  image: z.string().optional(),
  order: z.number().optional(),
});

type RaceForm = z.infer<typeof raceSchema>;

type CreateRaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RaceForm) => void;
  initialData?: Partial<RaceForm>;
};

const originOptions = [
  { value: "natural", label: "Природне" },
  { value: "divine", label: "Божественне" },
  { value: "magical", label: "Магічне" },
  { value: "hybrid", label: "Гібридне" },
  { value: "artificial", label: "Штучне" },
];

const lifespanOptions = [
  { value: "short", label: "Коротка (до 50 років)" },
  { value: "medium", label: "Середня (50-200 років)" },
  { value: "long", label: "Довга (200-1000 років)" },
  { value: "immortal", label: "Безсмертна" },
];

export default function CreateRaceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CreateRaceModalProps) {
  const { toast } = useToast();
  const t = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            <Users className="mr-2" />
            Додати расу
          </DialogTitle>
        </DialogHeader>
        <EntityForm
          schema={raceSchema}
          defaultValues={{
            name: { uk: "", en: "" },
            description: { uk: "", en: "" },
            characteristics: "",
            origin: "",
            homeland: "",
            enemies: "",
            allies: "",
            leaders: "",
            skills: "",
            population: "",
            icon: "",
            image: undefined,
            order: 0,
            ...initialData,
          }}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitLabel="Створити"
          cancelLabel="Скасувати"
          fields={[
            {
              name: "name",
              label: "Назва",
              type: "text",
              lang: true,
              required: true,
              maxLength: 100,
            },
            {
              name: "description",
              label: "Опис",
              type: "textarea",
              lang: true,
              maxLength: 1000,
            },
            {
              name: "characteristics",
              label: "Особливості",
              type: "textarea",
              maxLength: 500,
            },
            {
              name: "origin",
              label: "Походження",
              type: "select",
              options: originOptions,
            },
            {
              name: "homeland",
              label: "Місце проживання",
              type: "text",
              maxLength: 200,
            },
            {
              name: "enemies",
              label: "Вороги",
              type: "text",
              maxLength: 200,
            },
            {
              name: "allies",
              label: "Союзники",
              type: "text",
              maxLength: 200,
            },
            {
              name: "leaders",
              label: "Лідери/відомі представники",
              type: "text",
              maxLength: 200,
            },
            {
              name: "skills",
              label: "Навики/вміння",
              type: "textarea",
              maxLength: 500,
            },
            {
              name: "population",
              label: "Чисельність",
              type: "text",
              maxLength: 100,
            },
            { name: "icon", label: "Іконка", type: "text", maxLength: 2 },
            { name: "image", label: "Зображення", type: "image" },
          ]}
        />
      </DialogContent>
    </Dialog>
  );
}
