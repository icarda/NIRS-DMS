"use client";

import { useEffect, useRef } from "react";

import { format, formatDate } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { cn } from "@/lib/utils";

const StudyStep = ({
  form,
  crops,
  qualityLabs,
  nirModels,
  studies,
}: {
  form: UseFormReturn<any>;
  crops: Record<string, any>[];
  qualityLabs: Record<string, any>[];
  nirModels: Record<string, any>[];
  studies: Record<string, any>[];
}) => {
  const selectedCrop = form.getValues("crop");
  const useExistingStudy = form.watch("useExistingStudy");
  const initialStudyValues = useRef<any>(null);

  useEffect(() => {
    const selectedStudy = studies.find(
      (s) => s.studyCode === form.watch("study")
    );
    if (selectedStudy) {
      form.setValue("productType", selectedStudy.productType.name);
      initialStudyValues.current = {
        productType: selectedStudy.productType.name,
        qualityLab: selectedStudy.qualityLab.name,
        nirModel: selectedStudy.nirModel.name,
        physiologicalStage: selectedStudy.physiologicalStage.name,
        sampleDate: new Date(selectedStudy.sampleDate),
        program: selectedStudy.program,
        requesterName: selectedStudy.requesterName ?? "",
        requesterEmail: selectedStudy.requesterEmail ?? "",
      };
    }
  }, [form.watch("study")]);
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Study Metadata</h1>
        <p className="text-base text-muted-foreground">
          Provide essential details such as product type, quality lab, and
          additional metadata to describe your dataset.
        </p>
      </div>
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="useExistingStudy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Choose an option:</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) =>
                      field.onChange(value === "existing")
                    }
                    defaultValue={field.value ? "existing" : "new"}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value="existing"
                          disabled={
                            studies.filter(
                              (s) => s.trial.name === form.getValues("trial")
                            ).length === 0
                          }
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Select Existing study
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="new" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Add new study
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3">
            {useExistingStudy && (
              <FormField
                control={form.control}
                name="study"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Study</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const study = studies.find(
                          (s) => s.studyCode === value
                        )!;
                        console.log(study);
                        form.setValue("study", study.studyCode);
                        form.setValue("productType", study.productType.name);
                        form.setValue("qualityLab", study.qualityLab.name);
                        form.setValue("nirModel", study.nirModel.name);
                        form.setValue(
                          "physiologicalStage",
                          study.physiologicalStage.name
                        );
                        form.setValue("sampleDate", new Date(study.sampleDate));
                        form.setValue("program", study.program);
                        form.setValue(
                          "requesterName",
                          study.requesterName ?? ""
                        );
                        form.setValue(
                          "requesterEmail",
                          study.requesterEmail ?? ""
                        );
                      }}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="grid-span-1">
                          <SelectValue placeholder="Select study" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {studies
                          .filter(
                            (s) => s.trial.name === form.getValues("trial")
                          )
                          .map((study) => (
                            <SelectItem key={study.id} value={study.studyCode}>
                              {study.studyCode}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="productType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Product Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {crops
                        .find((c) => c.name == selectedCrop)
                        ?.productTypes.map(
                          (type: { id: number; name: string }) => (
                            <SelectItem key={type.id} value={type.name}>
                              {type.name}
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

          <div className="grid grid-cols-3 gap-6">
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
                      {crops
                        .find((c) => c.name == selectedCrop)
                        ?.physiologicalStages.map(
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
              name="sampleDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Sample date</FormLabel>
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
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
        </div>
      </Form>
    </div>
  );
};

export default StudyStep;
