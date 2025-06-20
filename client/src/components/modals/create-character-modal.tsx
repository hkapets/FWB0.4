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
import { Users, Sword } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Character } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";
import EntityForm from "@/components/entity-form";

const createCharacterSchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  race: z.string().min(1),
  class: z.string().min(1),
  level: z.number().min(1).max(100).default(1),
  description: z
    .object({ uk: z.string().max(1000), en: z.string().max(1000) })
    .optional(),
  image: z.string().optional(),
});

type CreateCharacterForm = z.infer<typeof createCharacterSchema>;

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldId: number;
}

export default function CreateCharacterModal({
  isOpen,
  onClose,
  worldId,
}: CreateCharacterModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useTranslation();

  const races = Object.entries(t.races).map(([value, label]) => ({
    value,
    label,
  }));
  const classes = Object.entries(t.classes).map(([value, label]) => ({
    value,
    label,
  }));

  const handleSubmit = (data: CreateCharacterForm) => {
    createCharacterMutation.mutate(data);
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
        title: "Character Created",
        description: `${
          typeof character.name === "object" &&
          character.name !== null &&
          "uk" in character.name
            ? (character.name as { uk?: string }).uk
            : character.name
        } додано!`,
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create character. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            <Users className="mr-2" />
            {t.dashboard.createCharacter}
          </DialogTitle>
        </DialogHeader>
        <EntityForm
          schema={createCharacterSchema}
          defaultValues={{
            name: { uk: "", en: "" },
            race: "",
            class: "",
            level: 1,
            description: { uk: "", en: "" },
            image: undefined,
          }}
          onSubmit={handleSubmit}
          onCancel={handleClose}
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
              name: "race",
              label: t.forms.race,
              type: "select",
              options: races,
              required: true,
            },
            {
              name: "class",
              label: t.forms.class,
              type: "select",
              options: classes,
              required: true,
            },
            {
              name: "level",
              label: t.forms.level,
              type: "number",
              required: true,
            },
            {
              name: "description",
              label: t.forms.description,
              type: "textarea",
              lang: true,
              maxLength: 1000,
            },
            {
              name: "image",
              label: "Зображення",
              type: "image",
            },
          ]}
        />
      </DialogContent>
    </Dialog>
  );
}
