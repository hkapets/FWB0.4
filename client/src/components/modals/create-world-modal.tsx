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

const worldTypes = [
  { value: "high-fantasy", label: "High Fantasy" },
  { value: "dark-fantasy", label: "Dark Fantasy" },
  { value: "medieval", label: "Medieval" },
  { value: "steampunk", label: "Steampunk Fantasy" },
  { value: "modern-fantasy", label: "Modern Fantasy" },
  { value: "custom", label: "Custom" },
];

export default function CreateWorldModal({ isOpen, onClose, onWorldCreated }: CreateWorldModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fantasy-border bg-gradient-to-b from-gray-800 to-gray-900 max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
            <Globe className="mr-2" />
            Create New World
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">World Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter world name..."
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-300">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your world..."
                      className="fantasy-input h-24 resize-none"
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
                  <FormLabel className="text-yellow-300">World Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="fantasy-input">
                        <SelectValue placeholder="Select world type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {worldTypes.map((type) => (
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
            
            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                className="fantasy-button flex-1"
                disabled={createWorldMutation.isPending}
              >
                {createWorldMutation.isPending ? (
                  "Creating..."
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create World
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleClose}
                disabled={createWorldMutation.isPending}
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
