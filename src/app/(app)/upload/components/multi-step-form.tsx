"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { uploadNirsData } from "@/features/nirs-data/actions/nirs-data";
import {
  MultiFormData,
  multiStepFormSchema,
  studyFormSchema,
  trialFormSchema,
} from "@/lib/schemas";
import StudyStep from "./steps/study-step";
import TrialStep from "./steps/trial-step";
import UploadStep from "./steps/upload-step";

interface MultiStepFormProps {
  data: {
    trials: Record<string, any>[];
    crops: Record<string, any>[];
    qualityLabs: Record<string, any>[];
    nirModels: Record<string, any>[];
    studies: Record<string, any>[];
  };
}

const MultiStepForm = ({ data }: MultiStepFormProps) => {
  const [step, setStep] = useState(1);
  const [overwriteDialogOpen, setOverwriteDialogOpen] = useState(false);
  const [existingSampleIds, setExistingSampleIds] = useState<number[]>([]);
  const [openStudyOverwriteDialog, setOpenStudyOverwriteDialog] =
    useState(false);

  const form = useForm<MultiFormData>({
    mode: "onTouched",
    resolver: zodResolver(multiStepFormSchema),
    defaultValues: {
      useExistingStudy: false,
      useExistingTrial: false,
      trial: "",
      crop: "",
      species: "",
      soilType: "",
      location: "",
      coordinates: "",
      irrigation: false,
      fertilizers: [{ type: "", amount: 0 }],
      productType: "",
      qualityLab: "",
      nirModel: "",
      physiologicalStage: "",
      program: "",
      sampleDate: undefined,
      trialPlantingDate: undefined,
      requesterName: "",
      requesterEmail: "",
      overwriteStudy: false,
    },
  });

  const onSubmit = async (multiFormData: MultiFormData) => {
    const selectedCrop = data.crops.find(
      (crop) => crop.name === multiFormData.crop
    )!;

    const cropID = selectedCrop?.id as number;
    const speciesID = selectedCrop.species.find(
      (species: { name: string }) => species.name === multiFormData.species
    )?.id as number;
    const productTypeID = selectedCrop.productTypes.find(
      (productType: { name: string }) =>
        productType.name === multiFormData.productType
    )?.id as number;
    const physiologicalStageID = selectedCrop.physiologicalStages.find(
      (physiologicalStage: { name: string }) =>
        physiologicalStage.name === multiFormData.physiologicalStage
    )?.id as number;
    const qualityLabID = data.qualityLabs.find(
      (qualityLab) => qualityLab.name === multiFormData.qualityLab
    )?.id as number;
    const nirModelID = data.nirModels.find(
      (nirModel) => nirModel.name === multiFormData.nirModel
    )?.id as number;

    const multiFormDataWithIDs = {
      ...multiFormData,

      cropID,
      speciesID,
      productTypeID,
      physiologicalStageID,
      qualityLabID,
      nirModelID,
      overwriteStudy: multiFormData.overwriteStudy ?? false,
      studyCode: [
        multiFormData.trial,
        multiFormData.productType,
        new Date(multiFormData.sampleDate).toLocaleDateString("fr-FR"),
      ].join("+"),
    };

    if (
      !multiFormDataWithIDs.overwriteStudy &&
      multiFormDataWithIDs.useExistingStudy
    ) {
      multiFormDataWithIDs.studyCode += `+${Date.now()}`;
    }

    const formData = new FormData();
    Object.entries(multiFormDataWithIDs).forEach(([key, value]) => {
      if (key === "file" && value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (typeof value === "boolean") {
        formData.append(key, String(value));
      } else if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    });

    const result = await uploadNirsData(formData);

    if (result.error) {
      if (result.existingSampleIds) {
        setExistingSampleIds(result.existingSampleIds);
        setOverwriteDialogOpen(true);

        return;
      }
      toast.error(result.message);
    } else {
      toast.success(result.message);
      setTimeout(() => {
        setStep(1);
        form.reset();
      }, 300);
    }
  };

  const nextStep = async () => {
    const currentSchema = step === 1 ? trialFormSchema : studyFormSchema;

    // validate sampleDate logic for step 2
    if (step === 2) {
      const sampleDate = form.getValues("sampleDate");
      const trialPlantingDate = form.getValues("trialPlantingDate");
      if (sampleDate && trialPlantingDate) {
        const sampleDateObj = new Date(sampleDate);
        const trialPlantingDateObj = new Date(trialPlantingDate);
        if (sampleDateObj < trialPlantingDateObj) {
          form.setError(
            "sampleDate",
            {
              type: "manual",
              message: "Sample date must be after trial planting date",
            },
            { shouldFocus: true }
          );
          return;
        }
      }
    }

    const isValid = await form.trigger(Object.keys(currentSchema.shape) as any);
    if (!isValid) return;

    // 🧠 Extra check for study modifications at step 2
    if (step === 2 && form.getValues("useExistingStudy")) {
      const selectedStudy = data.studies.find(
        (s) => s.studyCode === form.getValues("study")
      );

      const current = {
        productType: form.getValues("productType"),
        qualityLab: form.getValues("qualityLab"),
        nirModel: form.getValues("nirModel"),
        physiologicalStage: form.getValues("physiologicalStage"),
        sampleDate: new Date(form.getValues("sampleDate")),
        program: form.getValues("program"),
        requesterName: form.getValues("requesterName") || "",
        requesterEmail: form.getValues("requesterEmail") || "",
      };

      const original = {
        productType: selectedStudy?.productType?.name,
        qualityLab: selectedStudy?.qualityLab?.name,
        nirModel: selectedStudy?.nirModel?.name,
        physiologicalStage: selectedStudy?.physiologicalStage?.name,
        sampleDate: new Date(selectedStudy?.sampleDate),
        program: selectedStudy?.program,
        requesterName: selectedStudy?.requesterName || "",
        requesterEmail: selectedStudy?.requesterEmail || "",
      };

      const isModified = JSON.stringify(current) !== JSON.stringify(original);
      if (isModified) {
        setOpenStudyOverwriteDialog(true);
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleOverwrite = async () => {
    const multiFormData = form.getValues();
    const selectedCrop = data.crops.find(
      (crop) => crop.name === multiFormData.crop
    )!;

    const cropID = selectedCrop?.id as number;
    const speciesID = selectedCrop.species.find(
      (species: { name: string }) => species.name === multiFormData.species
    )?.id as number;
    const productTypeID = selectedCrop.productTypes.find(
      (productType: { name: string }) =>
        productType.name === multiFormData.productType
    )?.id as number;
    const physiologicalStageID = selectedCrop.physiologicalStages.find(
      (physiologicalStage: { name: string }) =>
        physiologicalStage.name === multiFormData.physiologicalStage
    )?.id as number;
    const qualityLabID = data.qualityLabs.find(
      (qualityLab) => qualityLab.name === multiFormData.qualityLab
    )?.id as number;
    const nirModelID = data.nirModels.find(
      (nirModel) => nirModel.name === multiFormData.nirModel
    )?.id as number;

    const multiFormDataWithIDs = {
      ...multiFormData,

      cropID,
      speciesID,
      productTypeID,
      physiologicalStageID,
      qualityLabID,
      nirModelID,
      studyCode: [
        multiFormData.trial,
        multiFormData.productType,
        new Date(multiFormData.sampleDate).toLocaleDateString("fr-FR"),
      ].join("+"),
    };

    const formData = new FormData();
    Object.entries(multiFormDataWithIDs).forEach(([key, value]) => {
      if (key === "file" && value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (typeof value === "boolean") {
        formData.append(key, String(value));
      } else if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    });

    const result = await uploadNirsData(formData, true);
    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      setTimeout(() => {
        setStep(1);
        form.reset();
      }, 300);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-8 flex items-center justify-center">
        <div className="flex items-center text-primary">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-current md:h-8 md:w-8">
            1
          </div>
          <span className="ml-2 text-sm md:text-base">Trial</span>
        </div>
        <div className="mx-4 h-px w-10 bg-border md:w-16" />
        <div
          className={`flex items-center ${step >= 2 ? "text-primary" : "text-primary/30"}`}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-current md:h-8 md:w-8">
            2
          </div>
          <span className="ml-2 text-sm md:text-base">Study</span>
        </div>
        <div className="mx-4 h-px w-10 bg-border md:w-16" />
        <div
          className={`flex items-center ${step === 3 ? "text-primary" : "text-primary/30"}`}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-current md:h-8 md:w-8">
            3
          </div>
          <span className="ml-2 text-sm md:text-base">Upload</span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {step === 1 && (
          <TrialStep form={form} trials={data.trials} crops={data.crops} />
        )}
        {step === 2 && (
          <StudyStep
            form={form}
            crops={data.crops}
            qualityLabs={data.qualityLabs}
            nirModels={data.nirModels}
            studies={data.studies}
          />
        )}
        {step === 3 && <UploadStep form={form} />}

        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <Button
              type="button"
              disabled={form.formState.isSubmitting}
              variant="outline"
              onClick={prevStep}
            >
              Previous
            </Button>
          )}
          {step < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="ml-auto"
              key="next"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              key="submit"
              disabled={form.formState.isSubmitting}
              className="ml-auto"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          )}
          <AlertDialog
            open={overwriteDialogOpen}
            onOpenChange={setOverwriteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Overwrite existing NIRS data?
                </AlertDialogTitle>
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
          <AlertDialog
            open={openStudyOverwriteDialog}
            onOpenChange={setOpenStudyOverwriteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Overwrite or create a new study?
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div>
                    You have modified the metadata of an existing study. Would
                    you like to:
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      <li>
                        <strong>Overwrite:</strong> Save changes to the
                        currently selected study.
                      </li>
                      <li>
                        <strong>Create new:</strong> Create a new study using
                        the updated information.
                      </li>
                    </ul>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    form.setValue("overwriteStudy", false);
                    setOpenStudyOverwriteDialog(false);
                    setStep((prev) => prev + 1);
                  }}
                >
                  Create New
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    form.setValue("overwriteStudy", true);
                    setOpenStudyOverwriteDialog(false);
                    setStep((prev) => prev + 1);
                  }}
                >
                  Overwrite
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
    </div>
  );
};

export default MultiStepForm;
