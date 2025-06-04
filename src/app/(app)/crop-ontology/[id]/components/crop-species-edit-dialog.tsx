"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { updateSpecies } from "@/features/studies/actions/species";
import { speciesSchema } from "@/features/studies/schemas/species";

interface CropSpeciesEditDialogProps {
  species: { id: number; name: string };
  open: boolean;
  onOpenChange(open: boolean): void;
}

export function CropspeciesEditDialog({
  species,
  open,
  onOpenChange,
}: CropSpeciesEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof speciesSchema>>({
    resolver: zodResolver(speciesSchema),
    defaultValues: {
      name: species.name,
    },
  });

  const id = species.id;

  const onSave = async (data: z.infer<typeof speciesSchema>) => {
    try {
      setIsLoading(true);
      let result = await updateSpecies(id, {
        name: data.name.trim(),
      });

      if (result.error) {
        toast.error(result.message);
      } else {
        toast.success(`Crop species edited successfully`);
        onOpenChange(false);
      }
    } catch (e) {
      toast.error(
        `There was an error editing this crop species. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Edit <span className="capitalize">{species.name}</span> species
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Species name</FormLabel>
                  <FormControl>
                    <Input placeholder="Grain Barley" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Applying Changes..
                  </>
                ) : (
                  "Apply Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
