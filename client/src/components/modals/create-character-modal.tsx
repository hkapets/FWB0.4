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

const createCharacterSchema = z.object({
  name: z
    .string()
    .min(1, "Character name is required")
    .max(100, "Name too long"),
  race: z.string().min(1, "Race is required"),
  class: z.string().min(1, "Class is required"),
  level: z
    .number()
    .min(1, "Level must be at least 1")
    .max(100, "Max level is 100")
    .default(1),
  description: z.string().max(1000, "Description too long").optional(),
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

  const form = useForm<CreateCharacterForm>({
    resolver: zodResolver(createCharacterSchema),
    defaultValues: {
      name: "",
      race: "",
      class: "",
      level: 1,
      description: "",
    },
  });

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
        description: `${character.name} has been successfully added to your world!`,
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

  const onSubmit = (data: CreateCharacterForm) => {
    createCharacterMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const races = Object.entries(t.races).map(([value, label]) => ({
    value,
    label,
  }));
  const classes = Object.entries(t.classes).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            <Users className="mr-2" />
            {t.dashboard.createCharacter}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">
                    {t.forms.name} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.forms.name + "..."}
                      className="fantasy-input text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="race"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">
                    {t.forms.race} *
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger className="fantasy-input text-white">
                        <SelectValue placeholder={t.forms.race} />
                      </SelectTrigger>
                      <SelectContent>
                        {races.map((race) => (
                          <SelectItem key={race.value} value={race.value}>
                            {race.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">
                    {t.forms.class} *
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger className="fantasy-input text-white">
                        <SelectValue placeholder={t.forms.class} />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((characterClass) => (
                          <SelectItem
                            key={characterClass.value}
                            value={characterClass.value}
                          >
                            {characterClass.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">
                    {t.forms.level}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="1"
                      className="fantasy-input text-white"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">
                    {t.forms.description}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.forms.description + "..."}
                      className="fantasy-input text-white h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between gap-2 pt-2">
              <Button type="submit" className="fantasy-button flex-1">
                {t.forms.create + " " + t.navigation.characters.slice(0, -1)}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
              >
                {t.forms.cancel}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
