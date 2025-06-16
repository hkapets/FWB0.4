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

const createLocationSchema = z.object({
  name: z.string().min(1, "Location name is required").max(100, "Name too long"),
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

export default function CreateLocationModal({ isOpen, onClose, worldId }: CreateLocationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      const response = await apiRequest("POST", `/api/worlds/${worldId}/locations`, data);
      return response.json();
    },
    onSuccess: (location: Location) => {
      queryClient.invalidateQueries({ queryKey: ["/api/worlds", worldId, "locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/worlds", worldId, "stats"] });
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
      <DialogContent className="fantasy-border bg-gradient-to-b from-gray-800 to-gray-900 max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            <MapPin className="mr-2" />
            Add New Location
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">Location Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter location name..."
                      className="fantasy-input"
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
                  <FormLabel className="text-yellow-300">Location Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="fantasy-input">
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locationTypes.map((type) => (
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
                        <SelectValue placeholder="Select danger level" />
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
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this location..."
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
                disabled={createLocationMutation.isPending}
              >
                {createLocationMutation.isPending ? (
                  "Creating..."
                ) : (
                  <>
                    <Mountain className="mr-2 h-4 w-4" />
                    Create Location
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleClose}
                disabled={createLocationMutation.isPending}
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
