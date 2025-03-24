"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  MultiFormData,
  studyFormSchema,
  trialFormSchema,
  uploadFormSchema,
} from "@/lib/schemas";
import StudyStep from "./steps/study-step";
import TrialStep from "./steps/trial-step";
import UploadStep from "./steps/upload-step";

const formSchema = trialFormSchema
  .merge(studyFormSchema)
  .merge(uploadFormSchema);

const MultiStepForm = () => {
  const [step, setStep] = useState(1);

  const form = useForm<MultiFormData>({
    mode: "onTouched",
    resolver: zodResolver(formSchema),
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
      productType: "",
      qualityLab: "",
      nirModel: "",
      physiologicalStage: "",
      program: "",
      sampleDate: undefined,
      trialPlantingDate: undefined,
      requesterName: "",
      requesterEmail: "",
    },
  });

  const onSubmit = async (data: MultiFormData) => {
    console.log(data);
    setStep(1);
    form.reset();
  };

  const nextStep = async () => {
    const currentSchema = step === 1 ? trialFormSchema : studyFormSchema;
    const isValid = await form.trigger(Object.keys(currentSchema.shape) as any);
    if (isValid) setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
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
        {step === 1 && <TrialStep form={form} />}
        {step === 2 && <StudyStep form={form} />}
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
