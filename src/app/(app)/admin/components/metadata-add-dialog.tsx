"use client";

import { useEffect, useState } from "react";

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
import { Switch } from "@/components/ui/switch";
import { createStudyMetadataConfig } from "@/features/studies/actions/study";
import { createTrialMetadataConfig } from "@/features/trials/actions/trial";
import { metadataConfigSchema } from "@/features/trials/schemas/trial";
import { useIsMobile } from "@/hooks/use-mobile";
import { metadataDialog } from "@/lib/schemas";
import { capitalize, labelToCamel } from "@/lib/utils";

interface MetadataAddDialogProps {
  type: "study" | "trial";
  // onSave: (data: z.infer<typeof metadataDialog>) => void;
}

export function MetadataAddDialog({ type }: MetadataAddDialogProps) {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof metadataConfigSchema>>({
    resolver: zodResolver(metadataConfigSchema),
    defaultValues: {
      name: "",
      label: "",
      type: "string",
      defaultValue: "",
      required: false,
    },
  });
  console.log(form.formState.errors);

  const labelValue = form.watch("label");

  useEffect(() => {
    if (labelValue) {
      const generatedName = labelToCamel(labelValue);
      form.setValue("name", generatedName, { shouldValidate: true });
    }
  }, [labelValue, form]);

  const handleSubmit = async (data: z.infer<typeof metadataConfigSchema>) => {
    try {
      setIsLoading(true);
      let result;
      const name = labelToCamel(data.label);
      if (type === "study") {
        result = await createStudyMetadataConfig({
          ...data,
          name,
        });
      } else {
        // result = await createStudyMetadataConfig(data);
        result = await createTrialMetadataConfig({
          ...data,
          name,
        });
      }
      if (result.error) {
        toast.error(result.message);
      } else {
        toast.success(`${capitalize(type)} metadata created successfully`);
        setOpen(false);
      }
    } catch (e) {
      toast.error(
        `There was an error creating the ${type} metadata. Please try again.`
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
          {!isMobile && (
            <span>
              Add <span className="capitalize">{type}</span> Metadata
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new {type} metadata</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Metadata name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Fertilizer amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input type="hidden" {...field} />
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
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select metadata type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["string", "number", "boolean", "date", "array"].map(
                            (type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="defaultValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Default Value</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. false" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormLabel required>Required</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Value</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="e.g. 30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Value</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="e.g. 400" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Adding Metadata...
                  </>
                ) : (
                  "Add Metadata"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
