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
import { Church, Crown, Heart, Shield, X, Upload, Users } from "lucide-react";

const religionSchema = z.object({
  name: z.object({
    uk: z.string().min(1, "Назва українською обов'язкова"),
    en: z.string().min(1, "Назва англійською обов'язкова"),
  }),
  description: z.object({
    uk: z.string().min(10, "Опис українською мінімум 10 символів"),
    en: z.string().min(10, "Опис англійською мінімум 10 символів"),
  }),
  type: z.enum(["monotheistic", "polytheistic", "pantheistic", "animistic", "ancestor_worship", "nature_worship", "mystery_cult", "philosophical"]),
  core_beliefs: z.object({
    uk: z.string().min(10, "Основні вірування обов'язкові"),
    en: z.string().min(10, "Core beliefs required"),
  }),
  moral_code: z.object({
    uk: z.string().optional(),
    en: z.string().optional(),
  }),
  creation_story: z.object({
    uk: z.string().optional(),
    en: z.string().optional(),
  }),
  afterlife_beliefs: z.object({
    uk: z.string().optional(),
    en: z.string().optional(),
  }),
  clergy_structure: z.enum(["hierarchical", "decentralized", "none", "tribal", "monastic"]).optional(),
  worship_practices: z.array(z.string()).default([]),
  sacred_texts: z.array(z.string()).default([]),
  holy_symbols: z.array(z.string()).default([]),
  religious_holidays: z.array(z.string()).default([]),
  pilgrimage_sites: z.array(z.string()).default([]),
  taboos: z.array(z.string()).default([]),
  influence_level: z.enum(["local", "regional", "national", "continental"]).optional(),
  followers_count: z.string().optional(),
  relatedCharacters: z.array(z.string()).default([]),
  relatedLocations: z.array(z.string()).default([]),
  relatedMythology: z.array(z.string()).default([]),
  image: z.string().optional(),
});

type ReligionForm = z.infer<typeof religionSchema>;

interface CreateReligionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReligionForm) => void;
  initialData?: Partial<ReligionForm>;
  worldId: number;
}

export default function CreateReligionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  worldId,
}: CreateReligionModalProps) {
  const { toast } = useToast();
  const [currentPractice, setCurrentPractice] = useState("");
  const [currentText, setCurrentText] = useState("");
  const [currentSymbol, setCurrentSymbol] = useState("");
  const [currentHoliday, setCurrentHoliday] = useState("");
  const [currentSite, setCurrentSite] = useState("");
  const [currentTaboo, setCurrentTaboo] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lang, setLang] = useState<"uk" | "en">("uk");

  const form = useForm<ReligionForm>({
    resolver: zodResolver(religionSchema),
    defaultValues: {
      name: initialData?.name || { uk: "", en: "" },
      description: initialData?.description || { uk: "", en: "" },
      type: initialData?.type || "monotheistic",
      core_beliefs: initialData?.core_beliefs || { uk: "", en: "" },
      moral_code: initialData?.moral_code || { uk: "", en: "" },
      creation_story: initialData?.creation_story || { uk: "", en: "" },
      afterlife_beliefs: initialData?.afterlife_beliefs || { uk: "", en: "" },
      clergy_structure: initialData?.clergy_structure || "hierarchical",
      worship_practices: initialData?.worship_practices || [],
      sacred_texts: initialData?.sacred_texts || [],
      holy_symbols: initialData?.holy_symbols || [],
      religious_holidays: initialData?.religious_holidays || [],
      pilgrimage_sites: initialData?.pilgrimage_sites || [],
      taboos: initialData?.taboos || [],
      influence_level: initialData?.influence_level || "local",
      followers_count: initialData?.followers_count || "",
      relatedCharacters: initialData?.relatedCharacters || [],
      relatedLocations: initialData?.relatedLocations || [],
      relatedMythology: initialData?.relatedMythology || [],
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
          description: "Зображення успішно додано до релігії",
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

  const addArrayItem = (field: keyof ReligionForm, value: string, setValue: (value: string) => void) => {
    if (!value.trim()) return;
    const currentArray = form.getValues(field) as string[];
    if (!currentArray.includes(value.trim())) {
      form.setValue(field, [...currentArray, value.trim()]);
      setValue("");
    }
  };

  const removeArrayItem = (field: keyof ReligionForm, index: number) => {
    const currentArray = form.getValues(field) as string[];
    form.setValue(field, currentArray.filter((_, i) => i !== index));
  };

  const onFormSubmit = (data: ReligionForm) => {
    onSubmit(data);
    onClose();
    form.reset();
  };

  const religionTypes = [
    { value: "monotheistic", label: "Монотеїстична", icon: Crown },
    { value: "polytheistic", label: "Політеїстична", icon: Users },
    { value: "pantheistic", label: "Пантеїстична", icon: Heart },
    { value: "animistic", label: "Анімістична", icon: Shield },
    { value: "ancestor_worship", label: "Культ предків", icon: Crown },
    { value: "nature_worship", label: "Культ природи", icon: Heart },
    { value: "mystery_cult", label: "Містичний культ", icon: Shield },
    { value: "philosophical", label: "Філософська", icon: Crown }
  ];

  const clergyStructures = [
    { value: "hierarchical", label: "Ієрархічна" },
    { value: "decentralized", label: "Децентралізована" },
    { value: "none", label: "Без духовенства" },
    { value: "tribal", label: "Племінна" },
    { value: "monastic", label: "Монастирська" }
  ];

  const influenceLevels = [
    { value: "local", label: "Місцева" },
    { value: "regional", label: "Регіональна" },
    { value: "national", label: "Національна" },
    { value: "continental", label: "Континентальна" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fantasy-modal max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="fantasy-title">
            {initialData ? "Редагувати релігію" : "Створити релігію"}
          </DialogTitle>
          <DialogDescription>
            Додайте релігійні системи, вірування та практики у ваш світ
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
                        <FormLabel>Назва релігії (українською)</FormLabel>
                        <FormControl>
                          <Input placeholder="Церква Світла" {...field} />
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
                            placeholder="Опишіть цю релігію, її вплив на суспільство..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="core_beliefs.uk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Основні вірування (українською)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Опишіть основні догми та вірування цієї релігії..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moral_code.uk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Моральний кодекс (українською)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Опишіть етичні принципи та правила поведінки..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="creation_story.uk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Історія створення (українською)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Як ця релігія пояснює створення світу..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="afterlife_beliefs.uk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Вірування про загробне життя (українською)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Що відбувається після смерті згідно з цією релігією..."
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
                        <FormLabel>Religion Name (English)</FormLabel>
                        <FormControl>
                          <Input placeholder="Church of Light" {...field} />
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
                            placeholder="Describe this religion, its influence on society..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="core_beliefs.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Core Beliefs (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the main dogmas and beliefs of this religion..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moral_code.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moral Code (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe ethical principles and behavioral rules..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="creation_story.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Creation Story (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="How this religion explains the creation of the world..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="afterlife_beliefs.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Afterlife Beliefs (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What happens after death according to this religion..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тип релігії</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть тип" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {religionTypes.map((type) => (
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
                  name="clergy_structure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Структура духовенства</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть структуру" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clergyStructures.map((structure) => (
                            <SelectItem key={structure.value} value={structure.value}>
                              {structure.label}
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
                  name="influence_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Рівень впливу</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть рівень" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {influenceLevels.map((level) => (
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
              </div>

              <FormField
                control={form.control}
                name="followers_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Кількість послідовників</FormLabel>
                    <FormControl>
                      <Input placeholder="Тисячі, мільйони, або точна цифра..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Практики поклоніння */}
              <div className="space-y-2">
                <FormLabel>Практики поклоніння</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Молитва, медитація, жертвоприношення..."
                    value={currentPractice}
                    onChange={(e) => setCurrentPractice(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('worship_practices', currentPractice, setCurrentPractice);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addArrayItem('worship_practices', currentPractice, setCurrentPractice)}
                  >
                    Додати
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch('worship_practices').map((practice, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {practice}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeArrayItem('worship_practices', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Священні тексти */}
              <div className="space-y-2">
                <FormLabel>Священні тексти</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Книга Світла, Священні Писання..."
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('sacred_texts', currentText, setCurrentText);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addArrayItem('sacred_texts', currentText, setCurrentText)}
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

              {/* Священні символи */}
              <div className="space-y-2">
                <FormLabel>Священні символи</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Хрест, зірка, сонце..."
                    value={currentSymbol}
                    onChange={(e) => setCurrentSymbol(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('holy_symbols', currentSymbol, setCurrentSymbol);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addArrayItem('holy_symbols', currentSymbol, setCurrentSymbol)}
                  >
                    Додати
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch('holy_symbols').map((symbol, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {symbol}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeArrayItem('holy_symbols', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Релігійні свята */}
              <div className="space-y-2">
                <FormLabel>Релігійні свята</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="День Світла, Свято Врожаю..."
                    value={currentHoliday}
                    onChange={(e) => setCurrentHoliday(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('religious_holidays', currentHoliday, setCurrentHoliday);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addArrayItem('religious_holidays', currentHoliday, setCurrentHoliday)}
                  >
                    Додати
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch('religious_holidays').map((holiday, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {holiday}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeArrayItem('religious_holidays', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Місця паломництва */}
              <div className="space-y-2">
                <FormLabel>Місця паломництва</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Священна гора, Храм Світла..."
                    value={currentSite}
                    onChange={(e) => setCurrentSite(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('pilgrimage_sites', currentSite, setCurrentSite);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addArrayItem('pilgrimage_sites', currentSite, setCurrentSite)}
                  >
                    Додати
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch('pilgrimage_sites').map((site, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {site}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeArrayItem('pilgrimage_sites', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Табу */}
              <div className="space-y-2">
                <FormLabel>Табу та заборони</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Заборона вбивства, заборона їсти певну їжу..."
                    value={currentTaboo}
                    onChange={(e) => setCurrentTaboo(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('taboos', currentTaboo, setCurrentTaboo);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addArrayItem('taboos', currentTaboo, setCurrentTaboo)}
                  >
                    Додати
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch('taboos').map((taboo, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {taboo}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeArrayItem('taboos', index)}
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