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
  name: z.object({
    uk: z.string().min(1).max(100),
    en: z.string().min(1).max(100),
  }),
  description: z
    .object({ uk: z.string().max(5000), en: z.string().max(5000) })
    .optional(),
  icon: z.string().max(2).optional(),
  image: z.any().optional(),
  type: z.string().min(1),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
});

type LoreForm = z.infer<typeof loreSchema>;

type CreateEditLoreModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LoreForm) => void;
  initialData?: Partial<LoreForm>;
  worldId: number;
  allLore: any[];
};

const DRAFT_KEY = "draft-lore";

export default function CreateEditLoreModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  worldId,
  allLore,
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
  const parentOptions = (allLore as any[])
    .filter(
      (l: any) =>
        l &&
        typeof l.id !== "undefined" &&
        (!initialData || l.id !== (initialData as any)?.id)
    )
    .map((l: any) => ({ value: String(l.id), label: l.name }));

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
            const before = form.getValues("description")[lang].slice(0, start);
            const after = form.getValues("description")[lang].slice(end);
            const md = `![image](${data.url})`;
            const newValue = before + md + after;
            const desc = form.getValues("description") || { uk: "", en: "" };
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
            const desc2 = form.getValues("description") || { uk: "", en: "" };
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md fantasy-border bg-black/90">
        <DialogHeader>
          <DialogTitle>
            {initialData ? t.actions.edit + " Lore" : t.actions.add + " Lore"}
          </DialogTitle>
        </DialogHeader>
        <Tabs
          value={lang}
          onValueChange={(v) => setLang(v as "uk" | "en")}
          className="mb-2"
        >
          <TabsList>
            {LANGS.map((l) => (
              <TabsTrigger key={l.code} value={l.code}>
                {l.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name={`name.${lang}` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">
                    Name ({LANGS.find((l) => l.code === lang)?.label}) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="fantasy-input text-white"
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">Type *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="fantasy-input text-white bg-black/80"
                    >
                      {loreTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">Parent</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      value={field.value == null ? "" : String(field.value)}
                      className="fantasy-input text-white bg-black/80"
                    >
                      <option value="">None</option>
                      {parentOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">Emoji</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="fantasy-input text-white"
                      maxLength={2}
                      placeholder="📜"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel className="text-yellow-300">
                Image (.jpg/.png/.webp, max 2MB)
              </FormLabel>
              <div
                className={`border-2 border-dashed rounded p-2 text-center cursor-pointer ${
                  uploading ? "opacity-50 pointer-events-none" : ""
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <FormControl>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </FormControl>
                {uploading ? (
                  <div className="text-yellow-400">Uploading...</div>
                ) : imagePreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={imagePreview}
                      alt="Lore image preview"
                      className="w-24 h-24 object-cover rounded border border-yellow-400 transition-opacity duration-500 opacity-0 animate-fadein max-w-full"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={handleRemoveImage}
                            aria-label="Remove image"
                          >
                            Remove
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove image</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <span className="text-gray-400">
                    Drag & drop or click to upload
                  </span>
                )}
              </div>
            </FormItem>
            <FormField
              control={form.control}
              name={`description.${lang}` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">
                    Description ({LANGS.find((l) => l.code === lang)?.label})
                  </FormLabel>
                  <FormControl>
                    <div className={"relative"}>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        ref={textareaRef}
                        className={`fantasy-input text-white ${
                          mdDropActive ? "ring-2 ring-yellow-400" : ""
                        }`}
                        rows={6}
                        maxLength={5000}
                        placeholder="You can use **markdown** here! Drag images here."
                        onDrop={handleMarkdownDrop}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setMdDropActive(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setMdDropActive(false);
                        }}
                        disabled={mdUploading}
                      />
                      {mdUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-yellow-300 z-10">
                          Uploading image...
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      className="fantasy-input text-white"
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t.forms.cancel}
              </Button>
              <Button type="submit" variant="default">
                {initialData ? t.forms.save : t.forms.create}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
