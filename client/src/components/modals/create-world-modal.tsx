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
import { worldTemplates, WorldTemplate } from "@/lib/worldTemplates";

const worldSchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  description: z
    .object({ uk: z.string().max(3000), en: z.string().max(3000) })
    .optional(),
  icon: z.string().max(2).optional(),
  image: z.string().optional(),
  type: z.string().min(1).optional(),
  genre: z.string().optional(),
  size: z.string().optional(),
  era: z.string().optional(),
  settings: z.string().optional(),
  order: z.number().optional(),
  races: z.array(z.string()).optional(),
  classes: z.array(z.string()).optional(),
  magic: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  bestiary: z.array(z.string()).optional(),
  artifacts: z.array(z.string()).optional(),
});

type WorldForm = z.infer<typeof worldSchema>;

type CreateWorldModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorldForm) => void;
  initialData?: Partial<WorldForm>;
};

const genreOptions = [
  { value: "fantasy", label: "Fantasy" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "historical", label: "Historical" },
  { value: "modern", label: "Modern" },
  { value: "other", label: "Other" },
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

  const getDefaultValues = () => {
    if (initialData) return initialData;
    if (selectedTemplate) {
      return {
        name: { uk: selectedTemplate.name, en: selectedTemplate.name },
        description: {
          uk: selectedTemplate.description,
          en: selectedTemplate.description,
        },
        icon: selectedTemplate.icon,
        type: "fantasy",
        genre: "fantasy",
        size: "",
        era: "",
        settings: selectedTemplate.features.join(", "),
        order: 0,
        races: selectedTemplate.races,
        classes: selectedTemplate.classes,
        magic: selectedTemplate.magic,
        locations: selectedTemplate.locations,
        bestiary: selectedTemplate.bestiary,
        artifacts: selectedTemplate.artifacts,
      };
    }
    return {
      name: { uk: "", en: "" },
      description: { uk: "", en: "" },
      icon: "",
      image: undefined,
      type: "fantasy",
      genre: "fantasy",
      size: "",
      era: "",
      settings: "",
      order: 0,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            {t.actions.add} Світ
          </DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {worldTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className={`rounded-lg border-2 px-4 py-2 flex flex-col items-center min-w-[120px] max-w-[160px] transition-all duration-200 ${
                  selectedTemplate?.id === tpl.id
                    ? "border-yellow-400 bg-yellow-900/30"
                    : "border-gray-700 bg-black/30 hover:border-yellow-300"
                }`}
                onClick={() => setSelectedTemplate(tpl)}
              >
                <span className="text-3xl mb-1">{tpl.icon}</span>
                <span className="font-bold text-yellow-100 text-center">
                  {tpl.name}
                </span>
                <span className="text-xs text-gray-300 text-center line-clamp-2">
                  {tpl.description}
                </span>
              </button>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <button
              type="button"
              className={`rounded px-3 py-1 text-sm font-semibold ${
                !selectedTemplate
                  ? "bg-yellow-700 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-yellow-800"
              }`}
              onClick={() => setSelectedTemplate(null)}
            >
              Почати з нуля
            </button>
          </div>
        </div>
        <EntityForm
          schema={worldSchema}
          defaultValues={getDefaultValues()}
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
              maxLength: 3000,
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
              name: "genre",
              label: "Жанр",
              type: "select",
              options: genreOptions,
              required: false,
            },
            {
              name: "size",
              label: "Розмір/Масштаб",
              type: "text",
              required: false,
              maxLength: 100,
            },
            {
              name: "era",
              label: "Епоха/Час",
              type: "text",
              required: false,
              maxLength: 100,
            },
            {
              name: "settings",
              label: "Налаштування/Особливості",
              type: "textarea",
              required: false,
              maxLength: 1000,
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
