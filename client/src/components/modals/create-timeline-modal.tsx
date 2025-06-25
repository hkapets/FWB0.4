import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";

const timelineSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  description: z.string().max(1000).optional(),
});

type TimelineForm = z.infer<typeof timelineSchema>;

interface CreateTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldId: number;
  onSuccess?: () => void;
}

export default function CreateTimelineModal({
  isOpen,
  onClose,
  worldId,
  onSuccess,
}: CreateTimelineModalProps) {
  const { toast } = useToast();
  const t = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<TimelineForm>({
    resolver: zodResolver(timelineSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createTimelineMutation = useMutation({
    mutationFn: async (data: TimelineForm) => {
      const response = await apiRequest(
        "POST",
        `/api/worlds/${worldId}/timelines`,
        { ...data, worldId }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "timelines"],
      });
      toast({
        title: "Timeline Created",
        description: "New timeline has been successfully created!",
      });
      form.reset();
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create timeline. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: TimelineForm) => {
    createTimelineMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-200 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Створити хронологію
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-sm">
            Створіть нову хронологію для організації подій вашого світу
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-200">{t.forms.name}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="fantasy-input"
                      placeholder="Назва хронології..."
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
                  <FormLabel className="text-yellow-200">{t.forms.description}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="fantasy-input min-h-[100px]"
                      placeholder="Опис хронології..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {t.forms.cancel}
              </Button>
              <Button 
                type="submit" 
                className="fantasy-button"
                disabled={createTimelineMutation.isPending}
              >
                {createTimelineMutation.isPending ? "Створення..." : t.forms.create}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}