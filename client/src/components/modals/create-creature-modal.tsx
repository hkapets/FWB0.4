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
import { Badge } from "@/components/ui/badge";
import { Crown, Plus, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Creature } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";
import EntityForm from "@/components/entity-form";

const creatureSchema = z.object({
  name: z.object({ uk: z.string().min(1), en: z.string().min(1) }),
  type: z.string().min(1),
  dangerLevel: z.string().min(1),
  description: z
    .object({ uk: z.string().max(1000), en: z.string().max(1000) })
    .optional(),
  abilities: z.array(z.string()).optional(),
  icon: z.string().max(2).optional(),
  image: z.string().optional(),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
});

type CreatureForm = z.infer<typeof creatureSchema>;

type CreateCreatureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  worldId: number;
  allCreatures?: { id: number | string; name?: { uk?: string } }[];
};

const worldTypes = [
  { value: "beast", label: "Beast" },
  { value: "dragon", label: "Dragon" },
  { value: "undead", label: "Undead" },
  { value: "spirit", label: "Spirit" },
  { value: "construct", label: "Construct" },
  { value: "humanoid", label: "Humanoid" },
  { value: "plant", label: "Plant" },
  { value: "other", label: "Other" },
];

const dangerLevels = [
  { value: "Safe", label: "Safe" },
  { value: "Protected", label: "Protected" },
  { value: "Dangerous", label: "Dangerous" },
];

export default function CreateCreatureModal({
  isOpen,
  onClose,
  worldId,
  allCreatures = [],
}: CreateCreatureModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [abilities, setAbilities] = useState<string[]>([]);
  const [newAbility, setNewAbility] = useState("");
  const t = useTranslation();

  const parentOptions = (
    allCreatures as { id: number | string; name?: { uk?: string } }[]
  )
    .filter(
      (c): c is { id: number | string; name?: { uk?: string } } =>
        !!c && typeof c.id !== "undefined"
    )
    .map((c) => ({
      value: String(c.id),
      label: c.name && c.name.uk ? c.name.uk : String(c.id),
    }));

  const createCreatureMutation = useMutation({
    mutationFn: async (data: CreatureForm) => {
      const response = await apiRequest(
        "POST",
        `/api/worlds/${worldId}/creatures`,
        {
          ...data,
          abilities,
        }
      );
      return response.json();
    },
    onSuccess: (creature: Creature) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "creatures"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "stats"],
      });
      toast({
        title: "Creature Created",
        description: `${
          typeof creature.name === "object"
            ? (creature.name as any).uk
            : creature.name
        } has been successfully added to your world!`,
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create creature. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CreatureForm) => {
    createCreatureMutation.mutate(data);
  };

  const handleClose = () => {
    onClose();
  };

  const addAbility = () => {
    if (newAbility.trim() && !abilities.includes(newAbility.trim())) {
      setAbilities([...abilities, newAbility.trim()]);
      setNewAbility("");
    }
  };

  const removeAbility = (ability: string) => {
    setAbilities(abilities.filter((a) => a !== ability));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            <Crown className="mr-2" />
            {t.dashboard.addCreature}
          </DialogTitle>
        </DialogHeader>
        <EntityForm
          schema={creatureSchema}
          defaultValues={{
            name: { uk: "", en: "" },
            description: { uk: "", en: "" },
            icon: "",
            image: undefined,
            type: "beast",
            dangerLevel: "Safe",
            parentId: null,
            order: 0,
          }}
          onSubmit={handleSubmit}
          onCancel={handleClose}
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
              options: worldTypes,
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
