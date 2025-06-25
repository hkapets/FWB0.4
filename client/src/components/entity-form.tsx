import React, { useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodTypeAny } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionLinker } from "./integration-helpers";

interface EntityFormProps<T extends ZodTypeAny> {
  schema: T;
  defaultValues: any;
  onSubmit: (data: z.infer<T>) => void;
  onCancel: () => void;
  fields: Array<{
    name: string;
    label: string;
    type: "text" | "textarea" | "icon" | "image" | "select" | "number";
    options?: { value: string; label: string }[];
    lang?: boolean; // для мультимовних полів
    required?: boolean;
    maxLength?: number;
    placeholder?: string;
  }>;
  children?: React.ReactNode; // для додаткових полів
  submitLabel?: string;
  cancelLabel?: string;
}

export default function EntityForm<T extends ZodTypeAny>({
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  fields,
  children,
  submitLabel,
  cancelLabel,
}: EntityFormProps<T>) {
  const t = useTranslation();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(
    defaultValues?.image ?? null
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lang, setLang] = useState<"uk" | "en">("uk");

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // Завантаження зображення
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
  const handleRemoveImage = () => {
    form.setValue("image", undefined);
    setImagePreview(null);
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((f) => {
            if (f.type === "image") {
              return (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={f.name}
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-yellow-300">
                        {f.label}
                      </FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          {imagePreview && (
                            <div className="relative w-32 h-32 mb-2">
                              <img
                                src={imagePreview}
                                alt="preview"
                                className="rounded-lg object-cover w-full h-full"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute top-1 right-1"
                                onClick={handleRemoveImage}
                              >
                                ✕
                              </Button>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            }
            if (f.lang) {
              // Мультимовне поле (name, description)
              return (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={`${f.name}.${lang}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-yellow-300 flex gap-2 items-center">
                        {f.label}
                        <span className="flex gap-1">
                          <Button
                            type="button"
                            size="xs"
                            variant={lang === "uk" ? "default" : "outline"}
                            onClick={() => setLang("uk")}
                          >
                            УК
                          </Button>
                          <Button
                            type="button"
                            size="xs"
                            variant={lang === "en" ? "default" : "outline"}
                            onClick={() => setLang("en")}
                          >
                            EN
                          </Button>
                        </span>
                      </FormLabel>
                      <FormControl>
                        {f.type === "textarea" ? (
                          <Textarea
                            {...field}
                            maxLength={f.maxLength}
                            placeholder={f.placeholder}
                          />
                        ) : (
                          <Input
                            {...field}
                            maxLength={f.maxLength}
                            placeholder={f.placeholder}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            }
            if (f.type === "textarea") {
              return (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-yellow-300">
                        {f.label}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          maxLength={f.maxLength}
                          placeholder={f.placeholder}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            }
            if (f.type === "select" && f.options) {
              return (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-yellow-300">
                        {f.label}
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="fantasy-input">
                              <SelectValue placeholder={f.placeholder} />
                            </SelectTrigger>
                          </FormControl>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            }
            if (f.type === "number") {
              return (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-yellow-300">
                        {f.label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          className="fantasy-input text-white"
                          placeholder={f.placeholder}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            }
            // text, icon
            return (
              <FormField
                key={f.name}
                control={form.control}
                name={f.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-yellow-300">{f.label}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="fantasy-input text-white"
                        maxLength={f.maxLength}
                        placeholder={f.placeholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}
          {children}
          
          {/* Add section linking for compatible entities */}
          {fields.some(f => f.name === 'relatedCharacters' || f.name === 'relatedLocations') && (
            <div className="space-y-4 pt-4 border-t border-yellow-600/20">
              <h4 className="text-lg font-bold text-yellow-200">Пов'язані елементи</h4>
              {fields.find(f => f.name === 'relatedCharacters') && (
                <SectionLinker
                  sectionType="characters"
                  selectedIds={[]}
                  onSelectionChange={() => {}}
                  worldId={1}
                  placeholder="Пов'язати з персонажами..."
                />
              )}
              {fields.find(f => f.name === 'relatedLocations') && (
                <SectionLinker
                  sectionType="locations"
                  selectedIds={[]}
                  onSelectionChange={() => {}}
                  worldId={1}
                  placeholder="Пов'язати з локаціями..."
                />
              )}
            </div>
          )}
          
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelLabel || t.forms.cancel}
            </Button>
            <Button type="submit" className="fantasy-button">
              {submitLabel || t.forms.save}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
