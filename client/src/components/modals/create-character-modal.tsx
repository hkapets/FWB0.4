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
import { Users, Sword } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Character } from "@shared/schema";

const createCharacterSchema = z.object({
  name: z.string().min(1, "Character name is required").max(100, "Name too long"),
  race: z.string().min(1, "Race is required"),
  class: z.string().min(1, "Class is required"),
  level: z.number().min(1, "Level must be at least 1").max(100, "Max level is 100").default(1),
  description: z.string().max(1000, "Description too long").optional(),
});

type CreateCharacterForm = z.infer<typeof createCharacterSchema>;

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldId: number;
}

const races = [
  { value: "Human", label: "Human" },
  { value: "Elf", label: "Elf" },
  { value: "Dwarf", label: "Dwarf" },
  { value: "Halfling", label: "Halfling" },
  { value: "Gnome", label: "Gnome" },
  { value: "Half-Elf", label: "Half-Elf" },
  { value: "Half-Orc", label: "Half-Orc" },
  { value: "Tiefling", label: "Tiefling" },
  { value: "Dragonborn", label: "Dragonborn" },
  { value: "Orc", label: "Orc" },
  { value: "Goblin", label: "Goblin" },
  { value: "Fairy", label: "Fairy" },
  { value: "Angel", label: "Angel" },
  { value: "Demon", label: "Demon" },
  { value: "Vampire", label: "Vampire" },
  { value: "Werewolf", label: "Werewolf" },
];

const classes = [
  { value: "Warrior", label: "Warrior" },
  { value: "Wizard", label: "Wizard" },
  { value: "Rogue", label: "Rogue" },
  { value: "Cleric", label: "Cleric" },
  { value: "Ranger", label: "Ranger" },
  { value: "Bard", label: "Bard" },
  { value: "Paladin", label: "Paladin" },
  { value: "Sorcerer", label: "Sorcerer" },
  { value: "Warlock", label: "Warlock" },
  { value: "Druid", label: "Druid" },
  { value: "Barbarian", label: "Barbarian" },
  { value: "Monk", label: "Monk" },
  { value: "Assassin", label: "Assassin" },
  { value: "Knight", label: "Knight" },
  { value: "Merchant", label: "Merchant" },
  { value: "Scholar", label: "Scholar" },
  { value: "Noble", label: "Noble" },
  { value: "Peasant", label: "Peasant" },
];

export default function CreateCharacterModal({ isOpen, onClose, worldId }: CreateCharacterModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateCharacterForm>({
    resolver: zodResolver(createCharacterSchema),
    defaultValues: {
      name: "",
      race: "",
      class: "",
      level: 1,
      description: "",
    },
  });

  const createCharacterMutation = useMutation({
    mutationFn: async (data: CreateCharacterForm) => {
      const response = await apiRequest("POST", `/api/worlds/${worldId}/characters`, data);
      return response.json();
    },
    onSuccess: (character: Character) => {
      queryClient.invalidateQueries({ queryKey: ["/api/worlds", worldId, "characters"] });
      queryClient.invalidateQueries({ queryKey: ["/api/worlds", worldId, "stats"] });
      toast({
        title: "Character Created",
        description: `${character.name} has been successfully added to your world!`,
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create character. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCharacterForm) => {
    createCharacterMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fantasy-border bg-gradient-to-b from-gray-800 to-gray-900 max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            <Users className="mr-2" />
            Create New Character
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">Character Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter character name..."
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
                name="race"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-yellow-300">Race *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="fantasy-input">
                          <SelectValue placeholder="Select race" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {races.map((race) => (
                          <SelectItem key={race.value} value={race.value}>
                            {race.label}
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
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-yellow-300">Class *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="fantasy-input">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((characterClass) => (
                          <SelectItem key={characterClass.value} value={characterClass.value}>
                            {characterClass.label}
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
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="1"
                      className="fantasy-input"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                  <FormLabel className="text-yellow-300">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this character..."
                      className="fantasy-input h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                className="fantasy-button flex-1"
                disabled={createCharacterMutation.isPending}
              >
                {createCharacterMutation.isPending ? (
                  "Creating..."
                ) : (
                  <>
                    <Sword className="mr-2 h-4 w-4" />
                    Create Character
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleClose}
                disabled={createCharacterMutation.isPending}
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
