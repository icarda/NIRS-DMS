"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Crop } from "@/components/crop-page-client";
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
import { Textarea } from "@/components/ui/textarea";
import { UnitSelector } from "@/components/unit-selector";
import { updateCropTrait } from "@/features/traits/actions/crop-trait";
import { cropTraitSchema } from "@/features/traits/schemas/crop-trait";

interface CropTraitEditDialogProps {
  cropTrait: Exclude<Crop, undefined>["cropTraits"][number];
  open: boolean;
  onOpenChange(open: boolean): void;
  units: string[];
  crop: Crop | null;
}

export function CropTraitEditDialog({
  cropTrait,
  open,
  onOpenChange,
  units,
  crop,
}: CropTraitEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof cropTraitSchema>>({
    resolver: zodResolver(cropTraitSchema),
    defaultValues: {
      traitVariable: cropTrait.traitVariable,
      traitName: cropTrait.traitName,
      entity: cropTrait.entity,
      methodDescription: cropTrait.methodDescription,
      unit: cropTrait.unit,
      minimumAllowed: cropTrait.minimumAllowed,
      maximumAllowed: cropTrait.maximumAllowed,
    },
  });

  const id = cropTrait.id;

  const onSave = async (data: z.infer<typeof cropTraitSchema>) => {
    try {
      setIsLoading(true);
      let result = await updateCropTrait(id, {
        cropId: crop?.id!,
        traitVariable: data.traitVariable,
        traitName: data.traitName,
        entity: data.entity,
        methodDescription: data.methodDescription,
        unit: data.unit,
        minimumAllowed: data.minimumAllowed!,
        maximumAllowed: data.maximumAllowed!,
      });

      if (result.error) {
        toast.error(result.message);
      } else {
        toast.success(`Crop trait edited successfully`);
        onOpenChange(false);
      }
    } catch (e) {
      toast.error(
        `There was an error editing this crop trait. Please try again.`
      );
    } finally {
      onOpenChange(false);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Edit <span className="capitalize">{cropTrait.traitName}</span> Trait
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="traitVariable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Trait variable</FormLabel>
                    <FormControl>
                      <Input placeholder="Fe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="traitName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Trait name</FormLabel>
                    <FormControl>
                      <Input placeholder="Iron" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Entity</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an entity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {crop?.productTypes.map((productType) => (
                          <SelectItem
                            key={productType.id}
                            value={productType.name}
                          >
                            {productType.name}
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Unit</FormLabel>
                    <UnitSelector
                      value={field.value}
                      onChange={field.onChange}
                      units={units}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimumAllowed"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Minimum allowed value</FormLabel>
                    <FormControl>
                      <Input
                        value={value ? value : ""}
                        placeholder="e.g. 20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maximumAllowed"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Maximum allowed value</FormLabel>
                    <FormControl>
                      <Input
                        value={value ? value : ""}
                        placeholder="e.g. 350"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="methodDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Method description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type method description here..."
                      className="resize-none"
                      {...field}
                    />
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
