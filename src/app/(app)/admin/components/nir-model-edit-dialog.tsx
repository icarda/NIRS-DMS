"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { updateNirModel } from "@/features/nir-models/actions/nir-model";
import { nirModelSchema } from "@/features/nir-models/schemas/nir-model";
import { NIRModel } from "../columns";

interface NirModelEditDialogProps {
  nirModel: NIRModel;
  open: boolean;
  onOpenChange(open: boolean): void;
}

export function NirModelEditDialog({
  nirModel,
  open,
  onOpenChange,
}: NirModelEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof nirModelSchema>>({
    resolver: zodResolver(nirModelSchema),
    defaultValues: {
      name: nirModel.name,
      type: nirModel.type as z.infer<typeof nirModelSchema>["type"],
      wavelengthRange: nirModel.wavelengthRange,
      resolution: nirModel.resolution,
      manufacturer: nirModel.manufacturer,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: nirModel.name,
      type: nirModel.type as z.infer<typeof nirModelSchema>["type"],
      wavelengthRange: nirModel.wavelengthRange,
      resolution: nirModel.resolution,
      manufacturer: nirModel.manufacturer,
    });
  }, [form, nirModel, open]);

  const handleSubmit = async (data: z.infer<typeof nirModelSchema>) => {
    try {
      setIsLoading(true);
      const result = await updateNirModel({
        id: nirModel.id,
        ...data,
      });

      if (result.error) {
        toast.error(result.message);
      } else {
        toast.success("NIR model updated successfully");
        onOpenChange(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "There was an error updating the NIR model. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit NIR model</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter name" />
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
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Benchtop">Benchtop</SelectItem>
                        <SelectItem value="Portable">Portable</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wavelengthRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Wavelength Range</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 400-1000" />
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
                  <FormLabel required>Resolution</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter resolution" />
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
                    <Input {...field} placeholder="Enter manufacturer" />
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
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
