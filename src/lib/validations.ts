import { UseFormReturn } from "react-hook-form";

import {
  studyFormSchema,
  trialFormSchema,
  uploadFormSchema,
  type MultiFormData,
} from "./schemas";

export const validateCurrentStep = async (
  step: number,
  form: UseFormReturn<MultiFormData, any, undefined>
) => {
  let currentSchema;
  let fieldsToValidate;

  switch (step) {
    case 1:
      currentSchema = trialFormSchema;
      fieldsToValidate = Object.keys(trialFormSchema.shape);
      break;
    case 2:
      currentSchema = studyFormSchema;
      fieldsToValidate = Object.keys(studyFormSchema.shape);
      break;
    case 3:
      currentSchema = uploadFormSchema;
      fieldsToValidate = Object.keys(uploadFormSchema.shape);
      break;
    default:
      return false;
  }

  const currentStepData: Record<string, unknown> = {};
  fieldsToValidate.forEach((field) => {
    currentStepData[field] = form.getValues(field as keyof MultiFormData);
  });

  try {
    await currentSchema.parseAsync(currentStepData);
    return true;
  } catch (error) {
    return false;
  }
};
