import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { Upload, X } from "lucide-react";

const historySchema = z.object({
  name: z.object({
    uk: z.string().min(1, "Назва обов'язкова"),
    en: z.string().min(1, "Name is required"),
  }),
  description: z.object({
    uk: z.string().min(1, "Опис обов'язковий"),
    en: z.string().min(1, "Description is required"),
  }),
  type: z.enum(["era", "period", "event", "war", "dynasty", "civilization"]),
  importance: z.enum(["minor", "moderate", "major", "critical"]).optional(),
  date: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  order: z.number().default(0),
});

type HistoryForm = z.infer<typeof historySchema>;

interface CreateHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HistoryForm) => void;
  initialData?: any;
  worldId: number;
}

const DRAFT_KEY = "draft-history";

export default function CreateHistoryModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  worldId,
}: CreateHistoryModalProps) {
  const { toast } = useToast();
  const t = useTranslation();
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image ?? null
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lang, setLang] = useState<"uk" | "en">("uk");

  const form = useForm<HistoryForm>({
    resolver: zodResolver(historySchema),
    defaultValues: {
      name: initialData?.name || { uk: "", en: "" },
      description: initialData?.description || { uk: "", en: "" },
      icon: initialData?.icon || "",
      image: initialData?.image || undefined,
      type: initialData?.type || "event",
      importance: initialData?.importance || undefined,
      date: initialData?.date || "",
      order: initialData?.order ?? 0,
    },
  });

  // Підвантаження чернетки при відкритті
  useEffect(() => {
    if (isOpen && !initialData) {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          form.reset(parsed);
          if (parsed.image) setImagePreview(parsed.image);
        } catch {}
      }
    }
  }, [isOpen, initialData]);

  // Збереження чернетки при зміні полів
  useEffect(() => {
    if (isOpen && !initialData) {
      const sub = form.watch((values) => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      });
      return () => sub.unsubscribe();
    }
  }, [isOpen, initialData, form]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        setImagePreview(url);
        form.setValue("image", url);
        toast({
          title: "Зображення завантажено",
          description: "Зображення успішно додано",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast({
        title: "Помилка завантаження",
        description: "Не вдалося завантажити зображення",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (data: HistoryForm) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        localStorage.removeItem(DRAFT_KEY);
      }
      onClose();
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося зберегти історичну подію",
        variant: "destructive",
      });
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue("image", undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData
              ? "Редагувати історичну подію"
              : "Створити історичну подію"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Перемикач мов */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={lang === "uk" ? "default" : "outline"}
              size="sm"
              onClick={() => setLang("uk")}
            >
              Українська
            </Button>
            <Button
              type="button"
              variant={lang === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => setLang("en")}
            >
              English
            </Button>
          </div>

          {/* Назва */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Назва {lang === "uk" ? "(українською)" : "(англійською)"}
            </label>
            <Input
              {...form.register(`name.${lang}`)}
              placeholder={
                lang === "uk"
                  ? "Назва історичної події..."
                  : "Historical event name..."
              }
              className="fantasy-input"
            />
            {form.formState.errors.name?.[lang] && (
              <p className="text-red-400 text-sm mt-1">
                {form.formState.errors.name[lang]?.message}
              </p>
            )}
          </div>

          {/* Опис */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Опис {lang === "uk" ? "(українською)" : "(англійською)"}
            </label>
            <Textarea
              {...form.register(`description.${lang}`)}
              placeholder={
                lang === "uk"
                  ? "Опис історичної події..."
                  : "Description of the historical event..."
              }
              className="fantasy-input min-h-[100px]"
            />
            {form.formState.errors.description?.[lang] && (
              <p className="text-red-400 text-sm mt-1">
                {form.formState.errors.description[lang]?.message}
              </p>
            )}
          </div>

          {/* Тип */}
          <div>
            <label className="block text-sm font-medium mb-1">Тип</label>
            <Select
              value={form.watch("type")}
              onValueChange={(value) => form.setValue("type", value as any)}
            >
              <SelectTrigger className="fantasy-input">
                <SelectValue placeholder="Виберіть тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="era">Епоха</SelectItem>
                <SelectItem value="period">Період</SelectItem>
                <SelectItem value="event">Подія</SelectItem>
                <SelectItem value="war">Війна</SelectItem>
                <SelectItem value="dynasty">Династія</SelectItem>
                <SelectItem value="civilization">Цивілізація</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Важливість */}
          <div>
            <label className="block text-sm font-medium mb-1">Важливість</label>
            <Select
              value={form.watch("importance") || ""}
              onValueChange={(value) =>
                form.setValue("importance", value as any)
              }
            >
              <SelectTrigger className="fantasy-input">
                <SelectValue placeholder="Виберіть важливість" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minor">Незначна</SelectItem>
                <SelectItem value="moderate">Помірна</SelectItem>
                <SelectItem value="major">Велика</SelectItem>
                <SelectItem value="critical">Критична</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Дата */}
          <div>
            <label className="block text-sm font-medium mb-1">Дата</label>
            <Input
              {...form.register("date")}
              placeholder="1234 р. або 5-й век до н.е."
              className="fantasy-input"
            />
          </div>

          {/* Іконка */}
          <div>
            <label className="block text-sm font-medium mb-1">Іконка</label>
            <Input
              {...form.register("icon")}
              placeholder="📜 або Unicode символ"
              className="fantasy-input"
            />
          </div>

          {/* Зображення */}
          <div>
            <label className="block text-sm font-medium mb-1">Зображення</label>
            <div className="space-y-2">
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0"
                    onClick={removeImage}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Завантаження..." : "Завантажити зображення"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit" disabled={uploading}>
              {initialData ? "Зберегти" : "Створити"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
