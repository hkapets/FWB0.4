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

const createWorldSchema = z.object({
  name: z.string().min(1, "World name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  type: z.string().min(1, "World type is required"),
});

type CreateWorldForm = z.infer<typeof createWorldSchema>;

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

  const onSubmit = (data: CreateWorldForm) => {
    createWorldMutation.mutate(data);
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
        className="fantasy-border max-w-md w-full mx-4"
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
                console.log("Select value:", field.value, worldTypes);
                return (
                  <FormItem>
                    <FormLabel className="text-yellow-300">
                      {t.forms.type} *
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger className="fantasy-input text-white">
                          <SelectValue placeholder={t.forms.type} />
                        </SelectTrigger>
                        <SelectContent>
                          {worldTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="flex justify-between gap-2 pt-2">
              <Button type="submit" className="fantasy-button flex-1">
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
