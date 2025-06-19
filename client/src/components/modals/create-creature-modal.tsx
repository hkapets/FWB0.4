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

const createCreatureSchema = z.object({
  name: z
    .string()
    .min(1, "Creature name is required")
    .max(100, "Name too long"),
  type: z.string().min(1, "Creature type is required"),
  dangerLevel: z.string().min(1, "Danger level is required"),
  description: z.string().max(1000, "Description too long").optional(),
  abilities: z.array(z.string()).optional(),
});

type CreateCreatureForm = z.infer<typeof createCreatureSchema>;

interface CreateCreatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldId: number;
}

export default function CreateCreatureModal({
  isOpen,
  onClose,
  worldId,
}: CreateCreatureModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [abilities, setAbilities] = useState<string[]>([]);
  const [newAbility, setNewAbility] = useState("");
  const t = useTranslation();

  const form = useForm<CreateCreatureForm>({
    resolver: zodResolver(createCreatureSchema),
    defaultValues: {
      name: "",
      type: "",
      dangerLevel: "",
      description: "",
      abilities: [],
    },
  });

  const createCreatureMutation = useMutation({
    mutationFn: async (data: CreateCreatureForm) => {
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
        description: `${creature.name} has been successfully added to your world!`,
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

  const onSubmit = (data: CreateCreatureForm) => {
    createCreatureMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    setAbilities([]);
    setNewAbility("");
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

  const worldTypes = Object.entries(t.worldTypes).map(([value, label]) => ({
    value,
    label,
  }));

  const dangerLevels = Object.entries(t.dangerLevels).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fantasy-border max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            <Crown className="mr-2" />
            {t.dashboard.addCreature}
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
                        {dangerLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
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

            {/* Abilities Section */}
            <div className="space-y-3">
              <FormLabel className="text-yellow-300">
                {t.forms.abilities}
              </FormLabel>

              {/* Add ability input */}
              <div className="flex space-x-2">
                <Input
                  placeholder={t.forms.addAbility + "..."}
                  className="fantasy-input text-white flex-1"
                  value={newAbility}
                  onChange={(e) => setNewAbility(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAbility();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addAbility}
                  disabled={!newAbility.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Display abilities */}
              {abilities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {abilities.map((ability, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-purple-900/50 text-white pr-1"
                    >
                      {ability}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 hover:bg-transparent"
                        onClick={() => removeAbility(ability)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <Button type="submit" className="fantasy-button flex-1">
                {t.forms.create + " " + t.navigation.creatures.slice(0, -1)}
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
