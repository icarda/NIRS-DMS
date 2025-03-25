"use server";

import { z } from "zod";

import { db } from "@/drizzle/db";
import {
  MultiFormData,
  multiStepFormSchema,
  studyFormSchema,
  trialFormSchema,
  uploadFormSchema,
} from "@/lib/schemas";

export async function uploadNirsData(formData: FormData) {
  const rawData: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    rawData[key] = value;
  }

  const dataToValidate: MultiFormData = {
    // Trial Fields
    useExistingTrial: rawData.useExistingTrial === "true",
    trial: rawData.trial,
    trialPlantingDate: new Date(rawData.trialPlantingDate),
    crop: rawData.crop,
    species: rawData.species,
    soilType: rawData.soilType,
    location: rawData.location,
    coordinates: rawData.coordinates,
    irrigation: rawData.irrigation === "true",
    fertilizers: rawData.fertilizers ? JSON.parse(rawData.fertilizers) : [],
    // Study Fields
    productType: rawData.productType,
    qualityLab: rawData.qualityLab,
    nirModel: rawData.nirModel,
    physiologicalStage: rawData.physiologicalStage,
    sampleDate: new Date(rawData.sampleDate),
    program: rawData.program,
    requesterName: rawData.requesterName || undefined,
    requesterEmail: rawData.requesterEmail || undefined,

    // Upload Field
    file: rawData.file,
  };

  const validationResult = multiStepFormSchema.safeParse(dataToValidate);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    return { error: true, message: `Invalid data: ${errorMessages}` };
  }

  const validatedData = validationResult.data as MultiFormData;

  try {
    return {
      error: false,
      message: `Data submitted and processed successfully.`,
    };
  } catch (error: any) {
    console.error("Error during NIRS data processing:", error);
    return {
      error: true,
      message: error.message || "An unexpected server error occurred.",
    };
  }
}
