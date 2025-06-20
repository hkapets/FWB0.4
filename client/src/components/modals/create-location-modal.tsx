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
import EntityForm from "@/components/entity-form";

const locationSchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  type: z.string().min(1),
  description: z
    .object({ uk: z.string().max(1000), en: z.string().max(1000) })
    .optional(),
  dangerLevel: z.string().min(1),
  icon: z.string().max(2).optional(),
  image: z.string().optional(),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
});

type LocationForm = z.infer<typeof locationSchema>;

type CreateLocationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  worldId: number;
  allLocations?: { id: number | string; name?: { uk?: string } }[];
};

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
  allLocations = [],
}: CreateLocationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useTranslation();

  const parentOptions = (
    allLocations as { id: number | string; name?: { uk?: string } }[]
  )
    .filter(
      (l): l is { id: number | string; name?: { uk?: string } } =>
        !!l && typeof l.id !== "undefined"
    )
    .map((l) => ({
      value: String(l.id),
      label: l.name && l.name.uk ? l.name.uk : String(l.id),
    }));

  const createLocationMutation = useMutation({
    mutationFn: async (data: LocationForm) => {
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
        description: `${
          typeof location.name === "object"
            ? (location.name as any).uk
            : location.name
        } has been successfully added to your world!`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: LocationForm) => {
    createLocationMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            <MapPin className="mr-2" />
            {t.dashboard.addLocation}
          </DialogTitle>
        </DialogHeader>
        <EntityForm
          schema={locationSchema}
          defaultValues={{
            name: { uk: "", en: "" },
            description: { uk: "", en: "" },
            icon: "",
            image: undefined,
            type: "City",
            dangerLevel: "Safe",
            parentId: null,
            order: 0,
          }}
          onSubmit={handleSubmit}
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
              maxLength: 1000,
            },
            { name: "icon", label: "Іконка", type: "text", maxLength: 2 },
            { name: "image", label: "Зображення", type: "image" },
            {
              name: "type",
              label: t.forms.type || "Тип",
              type: "select",
              options: locationTypes,
              required: true,
            },
            {
              name: "dangerLevel",
              label: "Рівень небезпеки",
              type: "select",
              options: dangerLevels,
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
