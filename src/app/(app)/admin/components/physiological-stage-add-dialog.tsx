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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCrops } from "@/features/crops/db/crop";
import { createPhysiologicalStage } from "@/features/studies/actions/physiological-stage";
import { useIsMobile } from "@/hooks/use-mobile";
import { physiologicalStageAddSchema } from "@/lib/schemas";

interface PhysiologicalStageDialogProps {
  // onSave: (data: z.infer<typeof physiologicalStageAddSchema>) => void;
  crops: Awaited<ReturnType<typeof getCrops>>;
}

export function PhysiologicalStageAddDialog({
  crops,
}: PhysiologicalStageDialogProps) {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof physiologicalStageAddSchema>>({
    resolver: zodResolver(physiologicalStageAddSchema),
    defaultValues: {
      stage: "",
      crop: "",
    },
  });

  const handleSubmit = async (
    data: z.infer<typeof physiologicalStageAddSchema>
  ) => {
    try {
      setIsLoading(true);
      const result = await createPhysiologicalStage(data);
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
          {!isMobile && "Add Physiological Stage"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new physiological stage</DialogTitle>
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
                  <FormLabel>Physiological Stage</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter physiological Stage" />
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
                  <FormLabel>Crop</FormLabel>
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
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
