import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { z } from "zod";
import React from "react";
import { worldTemplates, WorldTemplate } from "@/lib/worldTemplates";

const worldSchema = z.object({
  name: z.string().min(1, { message: "Назва світу є обов'язковою." }),
  description: z.string().max(3000).optional(),
  icon: z.string().max(2).optional(),
  genre: z.string().optional(),
});

type WorldForm = z.infer<typeof worldSchema>;

type CreateWorldModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Partial<WorldForm>;
};

const genreOptions = [
  { value: "high-fantasy", label: "Високе фентезі" },
  { value: "low-fantasy", label: "Низьке фентезі" },
  { value: "dark-fantasy", label: "Темне фентезі" },
  { value: "urban-fantasy", label: "Міське фентезі" },
  { value: "sci-fi-fantasy", label: "Наукове фентезі" },
  { value: "steampunk", label: "Стімпанк" },
  { value: "other", label: "Інше" },
];

export default function CreateWorldModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CreateWorldModalProps) {
  const { toast } = useToast();
  const t = useTranslation();
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<WorldTemplate | null>(null);

  const form = useForm<WorldForm>({
    resolver: zodResolver(worldSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      icon: initialData?.icon || "✨",
      genre: initialData?.genre || "high-fantasy",
    },
  });

  React.useEffect(() => {
    const values = selectedTemplate
      ? {
          name: selectedTemplate.name,
          description: selectedTemplate.description,
          icon: selectedTemplate.icon,
          genre: "high-fantasy",
        }
      : {
          name: "",
          description: "",
          icon: "✨",
          genre: "high-fantasy",
        };
    form.reset(values);
  }, [selectedTemplate, form]);

  const handleFormSubmit = (data: WorldForm) => {
    const submissionData = {
      ...data,
      type: selectedTemplate ? "template" : "custom",
      ...(selectedTemplate
        ? {
            races: selectedTemplate.races,
            classes: selectedTemplate.classes,
            magic: selectedTemplate.magic,
            locations: selectedTemplate.locations,
            bestiary: selectedTemplate.bestiary,
            artifacts: selectedTemplate.artifacts,
          }
        : {}),
    };
    onSubmit(submissionData);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-200 flex items-center gap-2">
            ✨ {t.navigation.createWorld}
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-sm">
            Створіть новий фентезійний світ для ваших пригод
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4">
          <p className="text-center text-sm text-gray-300 mb-2">
            Оберіть шаблон або почніть з чистого аркуша.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {worldTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className={`rounded-lg border-2 px-3 py-2 flex flex-col items-center min-w-[120px] transition-all duration-200 ${
                  selectedTemplate?.id === tpl.id
                    ? "border-yellow-400 bg-yellow-900/30"
                    : "border-gray-700 bg-black/30 hover:border-yellow-300"
                }`}
                onClick={() => setSelectedTemplate(tpl)}
              >
                <span className="text-3xl mb-1">{tpl.icon}</span>
                <span className="font-bold text-yellow-100 text-center text-sm">
                  {tpl.name}
                </span>
              </button>
            ))}
            <button
              type="button"
              className={`rounded-lg border-2 px-3 py-2 flex flex-col items-center justify-center min-w-[120px] transition-all duration-200 ${
                !selectedTemplate
                  ? "border-yellow-400 bg-yellow-900/30"
                  : "border-gray-700 bg-black/30 hover:border-yellow-300"
              }`}
              onClick={() => setSelectedTemplate(null)}
            >
              <span className="text-3xl mb-1">✍️</span>
              <span className="font-bold text-yellow-100 text-center text-sm">
                З нуля
              </span>
            </button>
          </div>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg text-yellow-300">
                    Назва Світу
                  </FormLabel>
                  <FormDescription>
                    Головна назва вашого всесвіту. Наприклад, "Середзем'я" або
                    "Вестерос".
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder="Наприклад: Королівства Етерії"
                      {...field}
                      className="fantasy-input"
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
                  <FormLabel className="text-lg text-yellow-300">
                    Короткий опис
                  </FormLabel>
                  <FormDescription>
                    Опишіть ваш світ у кількох реченнях. Яка його головна ідея?
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Наприклад: Світ магії та мечів, де стародавні дракони знову прокидаються..."
                      {...field}
                      className="fantasy-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg text-yellow-300">
                      Жанр
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="fantasy-input">
                          <SelectValue placeholder="Оберіть жанр..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genreOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Це допоможе визначити настрій.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg text-yellow-300">
                      Іконка
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="✨"
                        {...field}
                        maxLength={2}
                        className="fantasy-input text-center"
                      />
                    </FormControl>
                    <FormDescription>Один емодзі для іконки.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {t.forms.cancel}
              </Button>
              <Button type="submit" className="fantasy-button">
                {t.forms.create}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
