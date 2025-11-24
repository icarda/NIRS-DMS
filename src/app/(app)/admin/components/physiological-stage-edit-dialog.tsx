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
import { updatePhysiologicalStage } from "@/features/studies/actions/physiological-stage";
import { physiologicalStageAddSchema } from "@/lib/schemas";
import { PhysiologicalStage } from "../columns";

interface PhysiologicalStageEditDialogProps {
  physiologicalStage: PhysiologicalStage;
  crops: Awaited<ReturnType<typeof getCrops>>;
  open: boolean;
  onOpenChange(open: boolean): void;
}

export function PhysiologicalStageEditDialog({
  physiologicalStage,
  crops,
  open,
  onOpenChange,
}: PhysiologicalStageEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof physiologicalStageAddSchema>>({
    resolver: zodResolver(physiologicalStageAddSchema),
    defaultValues: {
      stage: physiologicalStage.stage,
      crop: physiologicalStage.crop,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      stage: physiologicalStage.stage,
      crop: physiologicalStage.crop,
    });
  }, [form, open, physiologicalStage]);

  const handleSubmit = async (
    data: z.infer<typeof physiologicalStageAddSchema>
  ) => {
    try {
      setIsLoading(true);
      const result = await updatePhysiologicalStage({
        id: physiologicalStage.id,
        stage: data.stage,
        crop: data.crop,
      });

      if (result.error) {
        toast.error(result.message);
      } else {
        toast.success("Physiological stage updated successfully");
        onOpenChange(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "There was an error updating the physiological stage. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit physiological stage</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Stage</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter physiological stage" />
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
