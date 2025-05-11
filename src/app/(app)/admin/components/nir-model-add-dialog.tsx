"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createNirModel } from "@/features/nir-models/actions/nir-model";
import { nirModelSchema } from "@/features/nir-models/schemas/nir-model";
import { useIsMobile } from "@/hooks/use-mobile";

interface NirModelAddDialogProps {
  // onSave: (data: z.infer<typeof nirModelSchema>) => void;
}

export function NirModelAddDialog({}: NirModelAddDialogProps) {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof nirModelSchema>>({
    resolver: zodResolver(nirModelSchema),
    defaultValues: {
      name: "",
      type: "Benchtop",
      wavelengthRange: "",
      resolution: "",
      manufacturer: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof nirModelSchema>) => {
    try {
      setIsLoading(true);
      const result = await createNirModel(data);
      if (result.error) {
        toast.error(result.message);
      } else {
        toast.success("Product type created successfully");
        setOpen(false);
      }
    } catch (e) {
      toast.error(
        "There was an error creating the product type. Please try again."
      );
    }
    setIsLoading(false);

    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          {!isMobile && "Add NIR Model"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New NIR Model</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Model Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter model name" />
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
                  <FormLabel required>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Benchtop">Benchtop</SelectItem>
                      <SelectItem value="Portable">Portable</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wavelengthRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Wavelength Range (nm)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="400-1000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resolution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Resolution (nm)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.1"
                      placeholder="0.5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Manufacturer</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter manufacturer name" />
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
                    Adding Model...
                  </>
                ) : (
                  "Add Model"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
