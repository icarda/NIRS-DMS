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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCrops } from "@/features/crops/db/crop";
import { updateProductType } from "@/features/studies/actions/product-type";
import { productTypeAddSchema } from "@/lib/schemas";
import { ProductType } from "../columns";

interface ProductTypeEditDialogProps {
  productType: ProductType;
  crops: Awaited<ReturnType<typeof getCrops>>;
  open: boolean;
  onOpenChange(open: boolean): void;
}

export function ProductTypeEditDialog({
  productType,
  crops,
  open,
  onOpenChange,
}: ProductTypeEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof productTypeAddSchema>>({
    resolver: zodResolver(productTypeAddSchema),
    defaultValues: {
      type: productType.type,
      crop: productType.crop,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      type: productType.type,
      crop: productType.crop,
    });
  }, [form, open, productType]);

  const handleSubmit = async (data: z.infer<typeof productTypeAddSchema>) => {
    try {
      setIsLoading(true);
      const result = await updateProductType({
        id: productType.id,
        type: data.type,
        crop: data.crop,
      });

      if (result.error) {
        toast.error(result.message);
      } else {
        toast.success("Product type updated successfully");
        onOpenChange(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "There was an error updating the product type. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit product type</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Product Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter product type" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="crop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Crop</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a crop" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {crops.map((crop) => (
                            <SelectItem key={crop.id} value={crop.name}>
                              {crop.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
