"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  MetadataFormData,
  metadataFormSchema,
  TrialFormData,
  trialFormSchema,
  UploadFormData,
  uploadFormSchema,
} from "@/lib/schemas";
import TrialStep from "./steps/trial-step";
// import TrialStep from "./steps/trial-step";
// import MetadataStep from "./steps/metadata-step";
import UploadStep from "./steps/upload-step";

// import { useToast } from "@/hooks/use-toast";

type FormData = TrialFormData & MetadataFormData & UploadFormData;

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  // const { toast } = useToast();

  const form = useForm<FormData>({
    mode: "onTouched",
    resolver: zodResolver(
      step === 1
        ? trialFormSchema
        : step === 2
          ? metadataFormSchema
          : uploadFormSchema
    ),
    defaultValues: {
      useExistingTrial: false,
      trial: "",
      crop: "",
      species: "",
      soilType: "",
      location: "",
      coordinates: "",
      irrigation: false,
      fertilizers: [{ type: "", amount: 0 }],
    },
  });

  const onSubmit = async (data: FormData) => {
    // Generate study code
    const date = new Date(data.trialPlantingDate);
    const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    const studyCode = `${data.trial}-${data.crop}-${formattedDate}`;

    // toast({
    //   title: "Success!",
    //   description: `Your study has been created with code: ${studyCode}`,
    // });
  };

  const nextStep = async () => {
    // Trigger validation for current step
    const isValid = await form.trigger();

    if (!isValid) return;

    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-8 flex items-center justify-center">
        <div
          className={`flex items-center ${step >= 1 ? "text-primary" : "text-muted"}`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current">
            1
          </div>
          <span className="ml-2">Trial</span>
        </div>
        <div className="mx-4 h-px w-16 bg-border" />
        <div
          className={`flex items-center ${step >= 2 ? "text-primary" : "text-muted"}`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current">
            2
          </div>
          <span className="ml-2">Metadata</span>
        </div>
        <div className="mx-4 h-px w-16 bg-border" />
        <div
          className={`flex items-center ${step === 3 ? "text-primary" : "text-muted"}`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current">
            3
          </div>
          <span className="ml-2">Upload</span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {step === 1 && <TrialStep form={form} />}
        {/* {step === 2 && <MetadataStep form={form} />} */}
        {step === 3 && <UploadStep form={form} />}

        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              Previous
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" onClick={nextStep} className="ml-auto">
              Next
            </Button>
          ) : (
            <Button type="submit" className="ml-auto">
              Submit
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MultiStepForm;
