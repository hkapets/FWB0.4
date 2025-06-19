import { useState, useRef } from "react";
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

const magicSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(1000).optional(),
  icon: z.string().max(2).optional(),
  image: z.any().optional(), // File or string (url)
});

type MagicForm = z.infer<typeof magicSchema>;

type CreateEditMagicModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MagicForm) => void;
  initialData?: Partial<MagicForm>;
  worldId: number;
};

export default function CreateEditMagicModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  worldId,
}: CreateEditMagicModalProps) {
  const { toast } = useToast();
  const t = useTranslation();
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image ?? null
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<MagicForm>({
    resolver: zodResolver(magicSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      icon: initialData?.icon || "",
      image: initialData?.image || undefined,
    },
  });

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

  const handleSubmit = (data: MagicForm) => {
    onSubmit(data);
    form.reset();
    setImagePreview(null);
    onClose();
  };

  const handleClose = () => {
    form.reset();
    setImagePreview(initialData?.image ?? null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md fantasy-border bg-black/90">
        <DialogHeader>
          <DialogTitle>
            {initialData
              ? t.actions.edit + " " + (t.forms.magic || "Magic")
              : t.actions.add + " " + (t.forms.magic || "Magic")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
                      {...field}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">
                    {t.forms.description}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="fantasy-input text-white"
                      maxLength={1000}
                    />
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
                  <FormLabel className="text-yellow-300">
                    Emoji {t.forms.optional}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="fantasy-input text-white"
                      maxLength={2}
                      placeholder="✨"
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
                      alt="Magic image preview"
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
