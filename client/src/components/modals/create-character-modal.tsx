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
import type { Character } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";
import EntityForm from "@/components/entity-form";

const createCharacterSchema = z.object({
  name: z.object({
    uk: z.string().min(1, "Ім'я обов'язкове"),
    en: z.string().min(1, "Name is required"),
    pl: z.string().min(1, "Imię jest wymagane"),
  }),
  age: z.number().min(0).max(1000).optional(),
  birthplace: z
    .object({
      uk: z.string().optional(),
      en: z.string().optional(),
      pl: z.string().optional(),
    })
    .optional(),
  race: z.string().min(1, "Раса обов'язкова"),
  ethnicity: z
    .object({
      uk: z.string().optional(),
      en: z.string().optional(),
      pl: z.string().optional(),
    })
    .optional(),
  description: z
    .object({
      uk: z.string().max(2000).optional(),
      en: z.string().max(2000).optional(),
      pl: z.string().max(2000).optional(),
    })
    .optional(),
  imageUrl: z.string().optional(),
  family: z
    .object({
      uk: z.string().optional(),
      en: z.string().optional(),
      pl: z.string().optional(),
    })
    .optional(),
  relatedCharacters: z.array(z.number()).optional(),
  relatedEvents: z.array(z.number()).optional(),
  skills: z
    .object({
      uk: z.string().optional(),
      en: z.string().optional(),
      pl: z.string().optional(),
    })
    .optional(),
});

type CreateCharacterForm = z.infer<typeof createCharacterSchema>;

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldId: number;
  character?: Character | null;
  onSuccess?: () => void;
}

export default function CreateCharacterModal({
  isOpen,
  onClose,
  worldId,
  character,
  onSuccess,
}: CreateCharacterModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useTranslation();

  const races = Object.entries(t.races).map(([value, label]) => ({
    value,
    label: label as string,
  }));

  const handleSubmit = (data: CreateCharacterForm) => {
    if (character) {
      updateCharacterMutation.mutate(data);
    } else {
      createCharacterMutation.mutate(data);
    }
  };

  const createCharacterMutation = useMutation({
    mutationFn: async (data: CreateCharacterForm) => {
      const response = await apiRequest(
        "POST",
        `/api/worlds/${worldId}/characters`,
        data
      );
      return response.json();
    },
    onSuccess: (character: Character) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "characters"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "stats"],
      });
      toast({
        title: "Персонаж створено",
        description: `${(character.name as any).uk} додано!`,
      });
      onSuccess?.();
      handleClose();
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося створити персонажа. Спробуйте ще раз.",
        variant: "destructive",
      });
    },
  });

  const updateCharacterMutation = useMutation({
    mutationFn: async (data: CreateCharacterForm) => {
      const response = await apiRequest(
        "PUT",
        `/api/characters/${character?.id}`,
        data
      );
      return response.json();
    },
    onSuccess: (character: Character) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "characters"],
      });
      toast({
        title: "Персонаж оновлено",
        description: `${(character.name as any).uk} оновлено!`,
      });
      onSuccess?.();
      handleClose();
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося оновити персонажа. Спробуйте ще раз.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    onClose();
  };

  const defaultValues = character
    ? {
        name: (character.name as any) || { uk: "", en: "", pl: "" },
        age: character.age || undefined,
        birthplace: (character.birthplace as any) || { uk: "", en: "", pl: "" },
        race: character.race || "",
        ethnicity: (character.ethnicity as any) || { uk: "", en: "", pl: "" },
        description: (character.description as any) || {
          uk: "",
          en: "",
          pl: "",
        },
        imageUrl: character.imageUrl || "",
        family: (character.family as any) || { uk: "", en: "", pl: "" },
        relatedCharacters: (character.relatedCharacters as any) || [],
        relatedEvents: (character.relatedEvents as any) || [],
        skills: (character.skills as any) || { uk: "", en: "", pl: "" },
      }
    : {
        name: { uk: "", en: "", pl: "" },
        age: undefined,
        birthplace: { uk: "", en: "", pl: "" },
        race: "",
        ethnicity: { uk: "", en: "", pl: "" },
        description: { uk: "", en: "", pl: "" },
        imageUrl: "",
        family: { uk: "", en: "", pl: "" },
        relatedCharacters: [],
        relatedEvents: [],
        skills: { uk: "", en: "", pl: "" },
      };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-200 flex items-center gap-2">
            <Users className="w-6 h-6" />
            {character ? "Редагувати персонажа" : "Створити персонажа"}
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-sm">
            {character ? "Змініть інформацію про персонажа" : "Створіть нового персонажа для вашого світу"}
          </DialogDescription>
        </DialogHeader>
        <EntityForm
          schema={createCharacterSchema}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          submitLabel={character ? "Оновити" : "Створити"}
          cancelLabel="Скасувати"
          fields={[
            {
              name: "name",
              label: "Ім'я",
              type: "text",
              lang: true,
              required: true,
              maxLength: 100,
            },
            {
              name: "age",
              label: "Вік",
              type: "number",
              maxLength: 3,
            },
            {
              name: "birthplace",
              label: "Місце народження",
              type: "text",
              lang: true,
              maxLength: 200,
            },
            {
              name: "race",
              label: "Раса",
              type: "select",
              options: races,
              required: true,
            },
            {
              name: "ethnicity",
              label: "Етнічна приналежність",
              type: "text",
              lang: true,
              maxLength: 100,
            },
            {
              name: "description",
              label: "Опис",
              type: "textarea",
              lang: true,
              maxLength: 2000,
            },
            {
              name: "family",
              label: "Сім'я",
              type: "textarea",
              lang: true,
              maxLength: 500,
            },
            {
              name: "skills",
              label: "Вміння/навики",
              type: "textarea",
              lang: true,
              maxLength: 1000,
            },
            {
              name: "imageUrl",
              label: "Зображення",
              type: "image",
            },
          ]}
        />
      </DialogContent>
    </Dialog>
  );
}
