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
import { updateCropCommonName } from "@/features/crops/actions/crop-common-names";

interface CropTraitEditDialogProps {
  cropCommonName: { id: number; commonName: string };
  open: boolean;
  onOpenChange(open: boolean): void;
  cropId: number;
}

const cropCommonNameSchema = z.object({
  commonName: z.string().min(1, "Common name should not be empty"),
});

export function CropCommonNameEditDialog({
  cropCommonName,
  open,
  onOpenChange,
  cropId,
}: CropTraitEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof cropCommonNameSchema>>({
    resolver: zodResolver(cropCommonNameSchema),
    defaultValues: {
      commonName: cropCommonName.commonName,
    },
  });

  const id = cropCommonName.id;

  const onSave = async (data: z.infer<typeof cropCommonNameSchema>) => {
    try {
      setIsLoading(true);
      let result = await updateCropCommonName(id, {
        commonName: data.commonName.trim(),
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
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Edit <span className="capitalize">{cropCommonName.commonName}</span>{" "}
            common name
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-2">
            <FormField
              control={form.control}
              name="commonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Common name</FormLabel>
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
