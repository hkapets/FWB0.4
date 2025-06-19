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
import { MapPin, Mountain } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Location } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";

const createLocationSchema = z.object({
  name: z
    .string()
    .min(1, "Location name is required")
    .max(100, "Name too long"),
  type: z.string().min(1, "Location type is required"),
  description: z.string().max(1000, "Description too long").optional(),
  dangerLevel: z.string().min(1, "Danger level is required"),
});

type CreateLocationForm = z.infer<typeof createLocationSchema>;

interface CreateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldId: number;
}

const locationTypes = [
  { value: "City", label: "City" },
  { value: "Town", label: "Town" },
  { value: "Village", label: "Village" },
  { value: "Forest", label: "Forest" },
  { value: "Mountain", label: "Mountain" },
  { value: "Cave", label: "Cave" },
  { value: "Castle", label: "Castle" },
  { value: "Dungeon", label: "Dungeon" },
  { value: "Temple", label: "Temple" },
  { value: "Ruins", label: "Ruins" },
  { value: "Desert", label: "Desert" },
  { value: "Swamp", label: "Swamp" },
  { value: "Plains", label: "Plains" },
  { value: "River", label: "River" },
  { value: "Lake", label: "Lake" },
  { value: "Island", label: "Island" },
  { value: "Tower", label: "Tower" },
  { value: "Mine", label: "Mine" },
  { value: "Harbor", label: "Harbor" },
  { value: "Market", label: "Market" },
];

const dangerLevels = [
  { value: "Safe", label: "Safe" },
  { value: "Protected", label: "Protected" },
  { value: "Dangerous", label: "Dangerous" },
];

export default function CreateLocationModal({
  isOpen,
  onClose,
  worldId,
}: CreateLocationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useTranslation();

  const form = useForm<CreateLocationForm>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      name: "",
      type: "",
      description: "",
      dangerLevel: "",
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: async (data: CreateLocationForm) => {
      const response = await apiRequest(
        "POST",
        `/api/worlds/${worldId}/locations`,
        data
      );
      return response.json();
    },
    onSuccess: (location: Location) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "locations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "stats"],
      });
      toast({
        title: "Location Created",
        description: `${location.name} has been successfully added to your world!`,
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateLocationForm) => {
    createLocationMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            <MapPin className="mr-2" />
            {t.dashboard.addLocation}
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
                      placeholder={t.forms.name + "..."}
                      className="fantasy-input text-white"
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
              render={({ field }) => (
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
                        {Object.entries(t.locationTypes).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dangerLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">
                    {t.forms.dangerLevel} *
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger className="fantasy-input text-white">
                        <SelectValue placeholder={t.forms.dangerLevel} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(t.dangerLevels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      placeholder={t.forms.description + "..."}
                      className="fantasy-input text-white h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between gap-2 pt-2">
              <Button type="submit" className="fantasy-button flex-1">
                {t.forms.create + " " + t.navigation.locations.slice(0, -1)}
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
