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
import { Globe, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { World } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";
import { worldTemplates, WorldTemplate } from "@/lib/worldTemplates";

const createWorldSchema = z.object({
  name: z.string().min(1, "World name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  type: z.string().min(1, "World type is required"),
});

type CreateWorldForm = z.infer<typeof createWorldSchema>;

// Дозволяємо додаткові поля для сабміту
export type CreateWorldFormWithTemplate = CreateWorldForm & {
  races?: string[];
  classes?: string[];
  magic?: string[];
  locations?: string[];
  bestiary?: string[];
  artifacts?: string[];
};

interface CreateWorldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorldCreated: (world: World) => void;
}

export default function CreateWorldModal({
  isOpen,
  onClose,
  onWorldCreated,
}: CreateWorldModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useTranslation();

  const form = useForm<CreateWorldForm>({
    resolver: zodResolver(createWorldSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "",
    },
  });

  const createWorldMutation = useMutation({
    mutationFn: async (data: CreateWorldForm) => {
      const response = await apiRequest("POST", "/api/worlds", data);
      return response.json();
    },
    onSuccess: (world: World) => {
      queryClient.invalidateQueries({ queryKey: ["/api/worlds"] });
      toast({
        title: "World Created",
        description: `${world.name} has been successfully created!`,
      });
      onWorldCreated(world);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create world. Please try again.",
        variant: "destructive",
      });
    },
  });

  const [selectedTemplate, setSelectedTemplate] =
    useState<WorldTemplate | null>(null);

  const onSubmit = (data: CreateWorldForm) => {
    if (selectedTemplate && selectedTemplate.id !== "custom") {
      const submitData: CreateWorldFormWithTemplate = {
        ...data,
        races: selectedTemplate.races,
        classes: selectedTemplate.classes,
        magic: selectedTemplate.magic,
        locations: selectedTemplate.locations,
        bestiary: selectedTemplate.bestiary,
        artifacts: selectedTemplate.artifacts,
      };
      createWorldMutation.mutate(submitData);
    } else {
      createWorldMutation.mutate(data);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const worldTypes = Object.entries(t.worldTypes).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="fantasy-border max-w-2xl w-full mx-4"
        aria-describedby="modal-desc"
      >
        <div id="modal-desc" style={{ display: "none" }}>
          {/* Опис модалки для screen reader */}
        </div>
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            <Globe className="mr-2" />
            {t.dashboard.createWorld}
          </DialogTitle>
        </DialogHeader>

        {/* Вибір шаблону */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-yellow-300 mb-2">
            Оберіть шаблон світу
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {worldTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                className={`rounded-xl border-2 p-4 text-left transition-all shadow-md bg-purple-900/30 hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                  selectedTemplate?.id === template.id
                    ? "border-yellow-400 ring-2 ring-yellow-400"
                    : "border-transparent"
                }`}
                onClick={() => {
                  setSelectedTemplate(template);
                  // Автоматично підставляємо тип і опис у форму
                  form.setValue("type", template.name);
                  if (template.description)
                    form.setValue("description", template.description);
                }}
              >
                <div className="flex items-center mb-2">
                  <span className="text-3xl mr-2">{template.icon}</span>
                  <span className="font-bold text-yellow-200 text-lg">
                    {template.name}
                  </span>
                </div>
                <div className="text-sm text-gray-300 mb-1 line-clamp-2">
                  {template.description}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.features.map((f, i) => (
                    <span
                      key={i}
                      className="bg-purple-800/60 text-xs rounded px-2 py-0.5 text-white"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Прев'ю шаблону */}
        {selectedTemplate && (
          <div className="mb-6 p-4 rounded-xl bg-purple-950/60 border border-yellow-700">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{selectedTemplate.icon}</span>
              <span className="font-bold text-yellow-200 text-lg">
                {selectedTemplate.name}
              </span>
            </div>
            <div className="text-sm text-gray-300 mb-2">
              {selectedTemplate.description}
            </div>
            <div className="flex flex-wrap gap-2 mb-1">
              <span className="font-semibold text-yellow-300">Раси:</span>
              {selectedTemplate.races.length ? (
                selectedTemplate.races.map((r, i) => (
                  <span
                    key={i}
                    className="text-xs bg-purple-800/60 rounded px-2 py-0.5"
                  >
                    {r}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">(немає)</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-1">
              <span className="font-semibold text-yellow-300">Класи:</span>
              {selectedTemplate.classes.length ? (
                selectedTemplate.classes.map((c, i) => (
                  <span
                    key={i}
                    className="text-xs bg-purple-800/60 rounded px-2 py-0.5"
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">(немає)</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-1">
              <span className="font-semibold text-yellow-300">Магія:</span>
              {selectedTemplate.magic.length ? (
                selectedTemplate.magic.map((m, i) => (
                  <span
                    key={i}
                    className="text-xs bg-purple-800/60 rounded px-2 py-0.5"
                  >
                    {m}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">(немає)</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-1">
              <span className="font-semibold text-yellow-300">Локації:</span>
              {selectedTemplate.locations.length ? (
                selectedTemplate.locations.map((l, i) => (
                  <span
                    key={i}
                    className="text-xs bg-purple-800/60 rounded px-2 py-0.5"
                  >
                    {l}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">(немає)</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-1">
              <span className="font-semibold text-yellow-300">Бестіарій:</span>
              {selectedTemplate.bestiary.length ? (
                selectedTemplate.bestiary.map((b, i) => (
                  <span
                    key={i}
                    className="text-xs bg-purple-800/60 rounded px-2 py-0.5"
                  >
                    {b}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">(немає)</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-1">
              <span className="font-semibold text-yellow-300">Артефакти:</span>
              {selectedTemplate.artifacts.length ? (
                selectedTemplate.artifacts.map((a, i) => (
                  <span
                    key={i}
                    className="text-xs bg-purple-800/60 rounded px-2 py-0.5"
                  >
                    {a}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">(немає)</span>
              )}
            </div>
          </div>
        )}

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
                      style={{ color: "#fff", background: "#222" }}
                      className="fantasy-input text-white"
                      placeholder={t.forms.name + "..."}
                      {...field}
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
                      style={{ color: "#fff", background: "#222" }}
                      className="fantasy-input text-white h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="text-yellow-300">
                      {t.forms.type} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="fantasy-input text-white"
                        placeholder={t.forms.type}
                        {...field}
                        readOnly
                        value={
                          selectedTemplate ? selectedTemplate.name : field.value
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="flex justify-between gap-2 pt-2">
              <Button
                type="submit"
                className="fantasy-button flex-1"
                disabled={!selectedTemplate}
              >
                {t.forms.create + " " + t.navigation.dashboard}
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
