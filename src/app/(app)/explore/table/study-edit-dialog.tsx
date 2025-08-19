import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crops } from "@/data/crops";
import { cn } from "@/lib/utils";
import { studyEditFormSchema, StudyEditFormSchema } from "./schema";
import { NirModel, PhysiologicalStage, QualityLab, Study } from "./types";

interface StudyEditDialogProps {
  study: Study;
  qualityLabs: QualityLab[];
  nirModels: NirModel[];
  physiologicalStages: PhysiologicalStage[];
  studyMetadatas: {
    name: string;
    label: string;
    type: "string" | "number" | "date" | "boolean";
    required?: boolean;
    min: number | null;
    max: number | null;
    source: "sql" | "json";
  }[];
  open: boolean;
  onOpenChange(open: boolean): void;
  onSave(data: z.infer<typeof studyEditFormSchema>): void;
  isLoading: boolean;
}

export default function StudyEditDialog({
  study,
  qualityLabs,
  nirModels,
  physiologicalStages,
  studyMetadatas,
  open,
  onOpenChange,
  onSave,
  isLoading,
}: StudyEditDialogProps) {
  const form = useForm<StudyEditFormSchema>({
    resolver: zodResolver(studyEditFormSchema),
    defaultValues: {
      qualityLab: study.qualityLab?.name || "",
      nirModel: study.nirModel?.name || "",
      physiologicalStage: study.physiologicalStage?.name || "",
      program: study.program || "",
      requesterName: study.requesterName || "",
      requesterEmail: study.requesterEmail || "",
      ...study.additionalMetadata,
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Study Data</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="qualityLab"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Quality Lab</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select quality lab" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {qualityLabs.map((type) => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
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
                name="nirModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>NIR Model</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select NIR model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {nirModels.map((model) => (
                          <SelectItem key={model.id} value={model.name}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="physiologicalStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Physiological Stage</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {physiologicalStages.map(
                          (stage: { id: number; name: string }) => (
                            <SelectItem key={stage.id} value={stage.name}>
                              {stage.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="program"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Program</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter program name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {studyMetadatas
                .filter((metadata) => metadata.source === "json")
                .map((metadata) => {
                  switch (metadata.type) {
                    case "string":
                      return (
                        <FormField
                          key={metadata.name}
                          control={form.control}
                          name={`additionalMetadata.${metadata.name}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel required={metadata.required}>
                                {metadata.label}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={`Enter ${metadata.label.toLowerCase()}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    case "number":
                      return (
                        <FormField
                          key={metadata.name}
                          control={form.control}
                          name={`additionalMetadata.${metadata.name}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel required={metadata.required}>
                                {metadata.label}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder={`Enter ${metadata.label.toLowerCase()}`}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? undefined
                                        : parseFloat(e.target.value)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    case "date":
                      return (
                        <FormField
                          key={metadata.name}
                          control={form.control}
                          name={`additionalMetadata.${metadata.name}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel required={metadata.required}>
                                {metadata.label}
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() ||
                                      date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    case "boolean":
                      return (
                        <FormField
                          key={metadata.name}
                          control={form.control}
                          name={`additionalMetadata.${metadata.name}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel required={metadata.required}>
                                {metadata.label}
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={(value) =>
                                    field.onChange(value === "true")
                                  }
                                  defaultValue={field.value ? "true" : "false"}
                                  className="flex h-10 items-center gap-2"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="true" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Yes
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="false" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      No
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                  }
                })}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="requesterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requester Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter requester name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requesterEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requester Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter requester email" {...field} />
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
                    Editing study...
                  </>
                ) : (
                  "Edit study"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
