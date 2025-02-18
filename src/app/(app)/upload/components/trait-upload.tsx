"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileUp as FileUpload, X } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TraitUploadFormData, traitUploadSchema } from "@/lib/schemas";
import { fileSize } from "@/lib/utils";

const traits = [
  { value: "protein", label: "Protein" },
  { value: "starch", label: "Starch" },
  { value: "height", label: "Height" },
  { value: "yield", label: "Yield" },
  { value: "moisture", label: "Moisture" },
  { value: "oil", label: "Oil Content" },
  { value: "fiber", label: "Fiber" },
  { value: "weight", label: "Weight" },
];

const TraitUpload = () => {
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<TraitUploadFormData>({
    resolver: zodResolver(traitUploadSchema),
    defaultValues: {
      crop: "",
      year: "",
      study: "",
      traits: [],
    },
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (file: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      setPreview(file.name);
    }
  };

  const handleRemoveFile = () => {
    form.setValue("file", null);
    setPreview(null);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) =>
    (currentYear - i).toString()
  );

  function onSubmit(data: TraitUploadFormData) {
    console.log(data);
    setPreview(null);
    form.reset();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight md:text-3xl">
          Upload Trait Data
        </h1>
        <p className="text-base text-muted-foreground">
          Select the crop, trial, and trait, then upload the file containing
          measured values for the selected trait.
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="crop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crop</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select crop" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="wheat">Wheat</SelectItem>
                      <SelectItem value="corn">Corn</SelectItem>
                      <SelectItem value="soybean">Soybean</SelectItem>
                      <SelectItem value="rice">Rice</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
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
              name="study"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select study" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="trial3+barley+02/02/2025">
                        trial3+barley+02/02/2025
                      </SelectItem>
                      <SelectItem value="trial2+wheat+05/02/2025">
                        trial2+wheat+05/02/2025
                      </SelectItem>
                      <SelectItem value="trial2+barley+16/01/2025">
                        trial2+barley+16/01/2025
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="traits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Traits</FormLabel>
                  <FormControl>
                    <MultiSelect
                      value={field.value}
                      onChange={field.onChange}
                      data={traits}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Upload Data File</FormLabel>
                  <FormControl>
                    <div className="flex w-full flex-col items-center justify-center">
                      {!preview ? (
                        <label
                          htmlFor="dropzone-file"
                          className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 hover:bg-muted"
                        >
                          <div className="flex flex-col items-center justify-center pb-6 pt-5">
                            <FileUpload className="mb-3 h-10 w-10 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              CSV or XLSX files only - 5MB max
                            </p>
                          </div>
                          <Input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                            accept=".csv,.xlsx"
                            onChange={(e) => handleFileChange(e, onChange)}
                            {...field}
                          />
                        </label>
                      ) : (
                        <div className="w-full rounded-lg border bg-muted/50 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileUpload className="h-8 w-8 text-primary" />
                              <div>
                                <p className="text-sm font-medium">{preview}</p>
                                <p className="text-xs text-muted-foreground">
                                  Ready to upload -{" "}
                                  {fileSize((value as File).size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={handleRemoveFile}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-8 flex justify-between">
            <Button type="submit" className="ml-auto">
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TraitUpload;
