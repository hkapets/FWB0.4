import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Crown, Sword, Shield, X, Upload, Image as ImageIcon } from "lucide-react";

const mythologySchema = z.object({
  name: z.object({
    uk: z.string().min(1, "Назва українською обов'язкова"),
    en: z.string().min(1, "Назва англійською обов'язкова"),
  }),
  description: z.object({
    uk: z.string().min(10, "Опис українською мінімум 10 символів"),
    en: z.string().min(10, "Опис англійською мінімум 10 символів"),
  }),
  type: z.enum(["pantheon", "deity", "spirit", "legend", "creation_myth", "prophecy", "ritual", "sacred_place"]),
  domain: z.string().optional(),
  power_level: z.enum(["minor", "major", "supreme"]).optional(),
  alignment: z.enum(["good", "neutral", "evil", "chaotic", "lawful"]).optional(),
  symbols: z.array(z.string()).default([]),
  followers: z.string().optional(),
  sacred_texts: z.array(z.string()).default([]),
  holy_days: z.array(z.string()).default([]),
  temples: z.array(z.string()).default([]),
  mythology_connections: z.array(z.string()).default([]),
  relatedCharacters: z.array(z.string()).default([]),
  relatedLocations: z.array(z.string()).default([]),
  image: z.string().optional(),
});

type MythologyForm = z.infer<typeof mythologySchema>;

interface CreateMythologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MythologyForm) => void;
  initialData?: Partial<MythologyForm>;
  worldId: number;
}

export default function CreateMythologyModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  worldId,
}: CreateMythologyModalProps) {
  const { toast } = useToast();
  const [currentSymbol, setCurrentSymbol] = useState("");
  const [currentSacredText, setCurrentSacredText] = useState("");
  const [currentHolyDay, setCurrentHolyDay] = useState("");
  const [currentTemple, setCurrentTemple] = useState("");
  const [currentConnection, setCurrentConnection] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lang, setLang] = useState<"uk" | "en">("uk");

  const form = useForm<MythologyForm>({
    resolver: zodResolver(mythologySchema),
    defaultValues: {
      name: initialData?.name || { uk: "", en: "" },
      description: initialData?.description || { uk: "", en: "" },
      type: initialData?.type || "deity",
      domain: initialData?.domain || "",
      power_level: initialData?.power_level || "minor",
      alignment: initialData?.alignment || "neutral",
      symbols: initialData?.symbols || [],
      followers: initialData?.followers || "",
      sacred_texts: initialData?.sacred_texts || [],
      holy_days: initialData?.holy_days || [],
      temples: initialData?.temples || [],
      mythology_connections: initialData?.mythology_connections || [],
      relatedCharacters: initialData?.relatedCharacters || [],
      relatedLocations: initialData?.relatedLocations || [],
      image: initialData?.image || "",
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Файл занадто великий",
        description: "Максимальний розмір файлу 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        setImagePreview(url);
        form.setValue('image', url);
        toast({
          title: "Зображення завантажено",
          description: "Зображення успішно додано до міфології",
        });
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

  const addArrayItem = (field: keyof MythologyForm, value: string, setValue: (value: string) => void) => {
    if (!value.trim()) return;
    const currentArray = form.getValues(field) as string[];
    if (!currentArray.includes(value.trim())) {
      form.setValue(field, [...currentArray, value.trim()]);
      setValue("");
    }
  };

  const removeArrayItem = (field: keyof MythologyForm, index: number) => {
    const currentArray = form.getValues(field) as string[];
    form.setValue(field, currentArray.filter((_, i) => i !== index));
  };

  const onFormSubmit = (data: MythologyForm) => {
    onSubmit(data);
    onClose();
    form.reset();
  };

  const mythologyTypes = [
    { value: "pantheon", label: "Пантеон", icon: Crown },
    { value: "deity", label: "Божество", icon: Sparkles },
    { value: "spirit", label: "Дух", icon: Shield },
    { value: "legend", label: "Легенда", icon: Sword },
    { value: "creation_myth", label: "Міф створення", icon: Crown },
    { value: "prophecy", label: "Пророцтво", icon: Sparkles },
    { value: "ritual", label: "Ритуал", icon: Shield },
    { value: "sacred_place", label: "Священне місце", icon: Crown }
  ];

  const powerLevels = [
    { value: "minor", label: "Малий" },
    { value: "major", label: "Великий" },
    { value: "supreme", label: "Верховний" }
  ];

  const alignments = [
    { value: "good", label: "Добро" },
    { value: "neutral", label: "Нейтралітет" },
    { value: "evil", label: "Зло" },
    { value: "chaotic", label: "Хаос" },
    { value: "lawful", label: "Порядок" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fantasy-modal max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="fantasy-title">
            {initialData ? "Редагувати міфологію" : "Створити міфологію"}
          </DialogTitle>
          <DialogDescription>
            Додайте божества, легенди, ритуали та священні місця у ваш світ
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
              <Tabs value={lang} onValueChange={(value) => setLang(value as "uk" | "en")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="uk">Українська</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>

                <TabsContent value="uk" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name.uk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Назва (українською)</FormLabel>
                        <FormControl>
                          <Input placeholder="Торн Громовержець" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description.uk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Опис (українською)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Опишіть цю міфологічну сутність, її вплив на світ..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="en" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (English)</FormLabel>
                        <FormControl>
                          <Input placeholder="Thorn the Thunderer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe this mythological entity, its influence on the world..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тип міфології</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть тип" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mythologyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="w-4 h-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Сфера впливу</FormLabel>
                      <FormControl>
                        <Input placeholder="Війна, мудрість, природа..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="power_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Рівень могутності</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть рівень" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {powerLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alignment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Світогляд</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть світогляд" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {alignments.map((alignment) => (
                            <SelectItem key={alignment.value} value={alignment.value}>
                              {alignment.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Символи */}
              <div className="space-y-2">
                <FormLabel>Символи</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Молот, блискавка, дуб..."
                    value={currentSymbol}
                    onChange={(e) => setCurrentSymbol(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('symbols', currentSymbol, setCurrentSymbol);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addArrayItem('symbols', currentSymbol, setCurrentSymbol)}
                  >
                    Додати
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch('symbols').map((symbol, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {symbol}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeArrayItem('symbols', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="followers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Послідовники</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Опишіть прихильників цієї міфології..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Священні тексти */}
              <div className="space-y-2">
                <FormLabel>Священні тексти</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Книга Громів, Кодекс Війни..."
                    value={currentSacredText}
                    onChange={(e) => setCurrentSacredText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('sacred_texts', currentSacredText, setCurrentSacredText);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addArrayItem('sacred_texts', currentSacredText, setCurrentSacredText)}
                  >
                    Додати
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch('sacred_texts').map((text, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {text}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeArrayItem('sacred_texts', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Священні дні */}
              <div className="space-y-2">
                <FormLabel>Священні дні</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="День Грому, Свято Врожаю..."
                    value={currentHolyDay}
                    onChange={(e) => setCurrentHolyDay(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('holy_days', currentHolyDay, setCurrentHolyDay);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addArrayItem('holy_days', currentHolyDay, setCurrentHolyDay)}
                  >
                    Додати
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch('holy_days').map((day, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {day}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeArrayItem('holy_days', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Храми */}
              <div className="space-y-2">
                <FormLabel>Храми та священні місця</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Храм Громовержця, Священна роща..."
                    value={currentTemple}
                    onChange={(e) => setCurrentTemple(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('temples', currentTemple, setCurrentTemple);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addArrayItem('temples', currentTemple, setCurrentTemple)}
                  >
                    Додати
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch('temples').map((temple, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {temple}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeArrayItem('temples', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Зображення */}
              <div className="space-y-2">
                <FormLabel>Зображення</FormLabel>
                <div className="flex items-center gap-4">
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
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Попередній перегляд"
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => {
                          setImagePreview(null);
                          form.setValue('image', '');
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Скасувати
                </Button>
                <Button type="submit" className="fantasy-button">
                  {initialData ? "Оновити" : "Створити"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}