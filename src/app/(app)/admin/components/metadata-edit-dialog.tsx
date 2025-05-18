"use client";

import { useState } from "react";

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
import { Switch } from "@/components/ui/switch";
import { updateStudyMetadataConfig } from "@/features/studies/actions/study";
import { updateTrialMetadataConfig } from "@/features/trials/actions/trial";
import { metadataConfigSchema } from "@/features/trials/schemas/trial";
import { capitalize, labelToCamel } from "@/lib/utils";
import { MetadataSchema } from "../columns";

interface MetadataEditDialogProps {
  metadata: MetadataSchema;
  open: boolean;
  onOpenChange(open: boolean): void;
  type: "study" | "trial";
}

export function MetadataEditDialog({
  metadata,
  open,
  onOpenChange,
  type,
}: MetadataEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof metadataConfigSchema>>({
    resolver: zodResolver(metadataConfigSchema),
    defaultValues: {
      label: metadata.label,
      name: metadata.name,
      type: metadata.type,
      defaultValue: metadata.defaultValue,
      required: metadata.required,
      min: metadata.min || "",
      max: metadata.max || "",
    },
  });

  const id = metadata.id;

  const onSave = async (data: z.infer<typeof metadataConfigSchema>) => {
    onOpenChange(false);
    try {
      setIsLoading(true);
      console.log("data", data);
      let result;
      const name = labelToCamel(data.label!);
      if (type === "study") {
        result = await updateStudyMetadataConfig(id, {
          name,
          source: "json",
          label: data.label!,
          type: data.type!,
          defaultValue: data.defaultValue!,
          required: data.required!,
          min: data.min,
          max: data.max,
        });
      } else {
        result = await updateTrialMetadataConfig(id, {
          name,
          source: "json",
          label: data.label!,
          type: data.type!,
          defaultValue: data.defaultValue!,
          required: data.required!,
          min: data.min,
          max: data.max,
        });
      }
      if (result.error) {
        toast.error(result.message);
      } else {
        toast.success(`${capitalize(type)} metadata created successfully`);
        onOpenChange(false);
      }
    } catch (e) {
      toast.error(
        `There was an error creating the ${type} metadata. Please try again.`
      );
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Edit <span className="capitalize">{type}</span> Metadata
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metadata name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={metadata.source === "sql"}
                        {...field}
                        placeholder="e.g. Fertilizer amount"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger disabled={metadata.source === "sql"}>
                            <SelectValue placeholder="Select metadata type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["string", "number", "date", "boolean", "array"].map(
                            (type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="defaultValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Value</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. false" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormLabel>Required</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                      <Input {...field} placeholder="e.g. 30" />
                    </FormControl>
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
                      <Input {...field} placeholder="e.g. 400" />
                    </FormControl>
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
            </div>

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
