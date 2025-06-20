import { useState, useRef, useEffect } from "react";
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
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EntityForm from "@/components/entity-form";

const loreTypes = [
  { value: "artifact", label: "Artifact" },
  { value: "event", label: "Event" },
  { value: "geography", label: "Geography" },
  { value: "magic", label: "Magic" },
  { value: "mythology", label: "Mythology" },
  { value: "religion", label: "Religion" },
  { value: "custom", label: "Custom" },
];

const LANGS = [
  { code: "uk", label: "Українська" },
  { code: "en", label: "English" },
];

const loreSchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  description: z
    .object({ uk: z.string().max(5000), en: z.string().max(5000) })
    .optional(),
  icon: z.string().max(2).optional(),
  image: z.string().optional(),
  type: z.string().min(1),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
});

type LoreForm = z.infer<typeof loreSchema>;

type LoreListItem = { id: number | string; name?: { uk?: string } };

type CreateEditLoreModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LoreForm) => void;
  initialData?: Partial<LoreForm>;
  worldId: number;
  allLore?: LoreListItem[];
};

const DRAFT_KEY = "draft-lore";

export default function CreateEditLoreModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  worldId,
  allLore = [],
}: CreateEditLoreModalProps) {
  const { toast } = useToast();
  const t = useTranslation();
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image ?? null
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mdUploading, setMdUploading] = useState(false);
  const [mdDropActive, setMdDropActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lang, setLang] = useState<"uk" | "en">("uk");

  const form = useForm<LoreForm>({
    resolver: zodResolver(loreSchema),
    defaultValues: {
      name: initialData?.name || { uk: "", en: "" },
      description: initialData?.description || { uk: "", en: "" },
      icon: initialData?.icon || "",
      image: initialData?.image || undefined,
      type: initialData?.type || "custom",
      parentId: initialData?.parentId ?? null,
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
          if (
            typeof parsed === "object" &&
            parsed !== null &&
            parsed.image !== undefined
          )
            setImagePreview(parsed.image || null);
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Max file size is 2MB",
          variant: "destructive",
        });
        return;
      }
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch("/api/upload/race-image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          form.setValue("image", data.url);
          setImagePreview(data.url);
          toast({ title: "Success", description: "Image uploaded!" });
        } else {
          toast({
            title: "Error",
            description: data.message || "Upload failed",
            variant: "destructive",
          });
        }
      } catch (e) {
        toast({
          title: "Error",
          description: "Upload failed",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    }
  };

  // Drag & drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
      }
      await handleImageChange({ target: { files: [file] } } as any);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const handleRemoveImage = () => {
    form.setValue("image", undefined);
    setImagePreview(null);
  };

  const handleSubmit = (data: LoreForm) => {
    onSubmit(data);
    form.reset();
    setImagePreview(null);
    localStorage.removeItem(DRAFT_KEY);
    onClose();
  };

  const handleClose = () => {
    form.reset();
    setImagePreview(initialData?.image ?? null);
    if (!initialData) localStorage.removeItem(DRAFT_KEY);
    onClose();
  };

  // Parent select options (exclude self and descendants)
  const parentOptions: { value: string; label: string }[] = (
    allLore as LoreListItem[]
  )
    .filter(
      (l): l is LoreListItem =>
        !!l &&
        !!l.name &&
        typeof l.name === "object" &&
        typeof l.id !== "undefined" &&
        (!initialData || l.id !== (initialData as LoreListItem)?.id)
    )
    .map((l: any) => ({
      value: String(l.id),
      label: l.name.uk || String(l.id),
    }));

  // Drag&drop у textarea (markdown)
  const handleMarkdownDrop = async (
    e: React.DragEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    setMdDropActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Only images supported",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Max file size is 2MB",
          variant: "destructive",
        });
        return;
      }
      setMdUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch("/api/upload/race-image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          // Вставити markdown-посилання у textarea
          const textarea = textareaRef.current;
          if (
            textarea &&
            textarea.selectionStart !== undefined &&
            textarea.selectionEnd !== undefined
          ) {
            const start = textarea?.selectionStart ?? 0;
            const end = textarea?.selectionEnd ?? 0;
            const descObj = (form.getValues("description") ?? {}) as {
              uk?: string;
              en?: string;
            };
            const before = (descObj[lang] ?? "").slice(0, start);
            const after = (descObj[lang] ?? "").slice(end);
            const md = `![image](${data.url})`;
            const desc: { uk?: string; en?: string } = descObj;
            const newValue = before + md + after;
            form.setValue("description", {
              uk: desc.uk ?? "",
              en: desc.en ?? "",
              [lang]: newValue,
            });
            setTimeout(() => {
              if (textarea?.setSelectionRange)
                textarea.setSelectionRange(
                  start + md.length,
                  start + md.length
                );
            }, 0);
          } else {
            const desc2: { uk?: string; en?: string } = form.getValues(
              "description"
            ) || { uk: "", en: "" };
            form.setValue("description", {
              uk: desc2.uk ?? "",
              en: desc2.en ?? "",
              [lang]: (desc2[lang] || "") + `\n![image](${data.url})`,
            });
          }
          toast({
            title: "Success",
            description: "Image uploaded & markdown inserted!",
          });
        } else {
          toast({
            title: "Error",
            description: data.message || "Upload failed",
            variant: "destructive",
          });
        }
      } catch (e) {
        toast({
          title: "Error",
          description: "Upload failed",
          variant: "destructive",
        });
      } finally {
        setMdUploading(false);
      }
    }
  };

  const loreTypes = [
    { value: "artifact", label: t.lore.artifacts },
    { value: "event", label: t.lore.events },
    { value: "geography", label: t.lore.geography },
    { value: "magic", label: t.lore.magic },
    { value: "mythology", label: "Міфологія" },
    { value: "religion", label: "Релігія" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            {t.actions.add} {t.navigation.lore}
          </DialogTitle>
        </DialogHeader>
        <EntityForm
          schema={loreSchema}
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
              maxLength: 5000,
            },
            {
              name: "icon",
              label: "Іконка",
              type: "text",
              maxLength: 2,
            },
            {
              name: "image",
              label: "Зображення",
              type: "image",
            },
            {
              name: "type",
              label: t.forms.type,
              type: "select",
              options: loreTypes,
              required: true,
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
