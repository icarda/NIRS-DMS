"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileUp as FileUpload, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { uploadTraitDataAction } from "@/features/traits/actions/trait";
import { TraitUploadFormData, traitUploadSchema } from "@/lib/schemas";
import { fileSize } from "@/lib/utils";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 8 }, (_, i) => (currentYear - i).toString());

interface TraitUploadProps {
  data: {
    crops: Record<string, any>[];
    studies: Record<string, any>[];
  };
}

const TraitUpload = ({ data: { crops, studies } }: TraitUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [existingSampleIds, setExistingSampleIds] = useState<number[]>([]);
  const [overwriteDialogOpen, setOverwriteDialogOpen] = useState(false);

  const form = useForm<TraitUploadFormData>({
    resolver: zodResolver(traitUploadSchema),
    defaultValues: {
      crop: "",
      year: "",
      study: "",
      traits: [],
      file: undefined,
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
    // @ts-ignore
    form.setValue("file", null);
    setPreview(null);
  };

  async function onSubmit(data: TraitUploadFormData) {
    const cropId = crops.find((c) => c.name === data.crop)?.id as number;
    const studyId = studies.find((s) => s.studyCode === data.study)
      ?.id as number;

    const dataForFormData = {
      cropId: cropId,
      studyId: studyId,
      studyCode: data.study,
      year: data.year,
      traits: data.traits,
      file: data.file,
    };

    const formData = new FormData();
    Object.entries(dataForFormData).forEach(([key, value]) => {
      if (key === "file" && value instanceof File) {
        formData.append(key, value);
      } else if (key === "traits" && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    });

    const result = await uploadTraitDataAction(formData);

    if (result.error) {
      if (result.existingSampleIds) {
        setExistingSampleIds(result.existingSampleIds);
        setOverwriteDialogOpen(true);

        return;
      }
      toast.error(result.message);
    } else {
      toast.success(result.message);
      setPreview(null);
      form.reset();
    }
  }

  async function handleOverwrite() {
    const data = form.getValues();
    const cropId = crops.find((c) => c.name === data.crop)?.id as number;
    const studyId = studies.find((s) => s.studyCode === data.study)
      ?.id as number;

    const dataForFormData = {
      cropId: cropId,
      studyId: studyId,
      studyCode: data.study,
      year: data.year,
      traits: data.traits,
      file: data.file,
    };

    const formData = new FormData();
    Object.entries(dataForFormData).forEach(([key, value]) => {
      if (key === "file" && value instanceof File) {
        formData.append(key, value);
      } else if (key === "traits" && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    });

    const result = await uploadTraitDataAction(formData, true);

    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      setPreview(null);
      form.reset();
    }
  }

  const cropName = form.watch("crop");
  const year = form.watch("year");

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight md:text-3xl">
          Upload Trait Data
        </h1>
        <p className="text-base text-muted-foreground">
          Select the crop, study, and trait, then upload the file containing
          measured values for the selected trait.
        </p>
      </div>
      <Form {...form} key={form.formState.submitCount}>
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
                      {crops.map((crop) => (
                        <SelectItem key={crop.id} value={crop.name}>
                          {crop.name}
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
                      <SelectTrigger disabled={!cropName || !year}>
                        <SelectValue placeholder="Select study" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {studies
                        .filter(
                          (study) =>
                            study.trial.crop.name === cropName &&
                            study.studyCode.split("+")[2].split("/")[2] === year
                        )
                        .map((study) => (
                          <SelectItem
                            key={study.studyCode}
                            value={study.studyCode}
                          >
                            {study.studyCode}
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
              name="traits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Traits</FormLabel>
                  <FormControl>
                    <MultiSelect
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                      }}
                      data={
                        crops
                          .find((crop) => crop.name === cropName)
                          ?.cropTraits.filter(
                            (cT: { entity: string }) =>
                              cT.entity ===
                              studies.find(
                                (study) =>
                                  study.studyCode === form.getValues("study")
                              )?.productType.name
                          )
                          .map((cropTrait: { traitVariable: string }) => ({
                            label: cropTrait.traitVariable,
                            value: cropTrait.traitVariable,
                          })) || []
                      }
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
                  <FormLabel>
                    <div className="flex items-center justify-between">
                      Upload Data File
                      <p className="font-light">
                        File example:{" "}
                        <Link
                          href="/examples/traits.xlsx"
                          target="_blank"
                          className="font-semibold"
                        >
                          trait.xslx
                        </Link>
                      </p>
                    </div>
                  </FormLabel>
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
                              CSV or XLSX files only - 50MB max
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
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="ml-auto"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Submitting...
                </>
              ) : (
                "Upload Data"
              )}
            </Button>
          </div>
        </form>
      </Form>
      <AlertDialog
        open={overwriteDialogOpen}
        onOpenChange={setOverwriteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overwrite existing Trait data?</AlertDialogTitle>
            <AlertDialogDescription>
              The following sample IDs already exist:{" "}
              {existingSampleIds.slice(0, 5).join(", ")}
              {existingSampleIds.length > 5 ? "..." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleOverwrite}>
              Overwrite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TraitUpload;
