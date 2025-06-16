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

const createCreatureSchema = z.object({
  name: z.string().min(1, "Creature name is required").max(100, "Name too long"),
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

const creatureTypes = [
  { value: "Crown", label: "Crown" },
  { value: "Beast", label: "Beast" },
  { value: "Undead", label: "Undead" },
  { value: "Demon", label: "Demon" },
  { value: "Angel", label: "Angel" },
  { value: "Elemental", label: "Elemental" },
  { value: "Fey", label: "Fey" },
  { value: "Giant", label: "Giant" },
  { value: "Goblinoid", label: "Goblinoid" },
  { value: "Humanoid", label: "Humanoid" },
  { value: "Magical Beast", label: "Magical Beast" },
  { value: "Monster", label: "Monster" },
  { value: "Spirit", label: "Spirit" },
  { value: "Construct", label: "Construct" },
  { value: "Aberration", label: "Aberration" },
  { value: "Plant", label: "Plant" },
  { value: "Ooze", label: "Ooze" },
];

const dangerLevels = [
  { value: "Harmless", label: "Harmless" },
  { value: "Low", label: "Low" },
  { value: "Moderate", label: "Moderate" },
  { value: "High", label: "High" },
  { value: "Extreme", label: "Extreme" },
  { value: "Legendary", label: "Legendary" },
];

export default function CreateCreatureModal({ isOpen, onClose, worldId }: CreateCreatureModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [abilities, setAbilities] = useState<string[]>([]);
  const [newAbility, setNewAbility] = useState("");

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
      const response = await apiRequest("POST", `/api/worlds/${worldId}/creatures`, {
        ...data,
        abilities,
      });
      return response.json();
    },
    onSuccess: (creature: Creature) => {
      queryClient.invalidateQueries({ queryKey: ["/api/worlds", worldId, "creatures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/worlds", worldId, "stats"] });
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
    setAbilities(abilities.filter(a => a !== ability));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fantasy-border bg-gradient-to-b from-gray-800 to-gray-900 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            <Crown className="mr-2" />
            Add New Creature
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">Creature Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter creature name..."
                      className="fantasy-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-yellow-300">Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="fantasy-input">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {creatureTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                name="dangerLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-yellow-300">Danger Level *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="fantasy-input">
                          <SelectValue placeholder="Select danger" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dangerLevels.map((level) => (
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this creature..."
                      className="fantasy-input h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Abilities Section */}
            <div className="space-y-3">
              <FormLabel className="text-yellow-300">Abilities</FormLabel>
              
              {/* Add ability input */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Add an ability..."
                  className="fantasy-input flex-1"
                  value={newAbility}
                  onChange={(e) => setNewAbility(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
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
            
            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                className="fantasy-button flex-1"
                disabled={createCreatureMutation.isPending}
              >
                {createCreatureMutation.isPending ? (
                  "Creating..."
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Create Creature
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleClose}
                disabled={createCreatureMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
