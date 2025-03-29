"use server";

import { z } from "zod";

import { db } from "@/drizzle/db";
import { insertStudy } from "@/features/studies/db/study";
import { getTrialByName, insertTrial } from "@/features/trials/db/trial";
import {
  MultiFormData,
  multiStepFormSchemaFinal,
  MultiStepFormSchemaFinal,
  studyFormSchema,
  trialFormSchema,
  uploadFormSchema,
} from "@/lib/schemas";

export async function uploadNirsData(formData: FormData) {
  const rawData: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    rawData[key] = value;
  }

  const dataToValidate: MultiStepFormSchemaFinal = {
    // Trial Fields
    useExistingTrial: rawData.useExistingTrial === "true",
    trial: rawData.trial,
    trialPlantingDate: new Date(rawData.trialPlantingDate),
    cropID: parseInt(rawData.cropID, 10),
    speciesID: parseInt(rawData.speciesID, 10),
    soilType: rawData.soilType,
    location: rawData.location,
    coordinates: rawData.coordinates,
    irrigation: rawData.irrigation === "true",
    fertilizers: rawData.fertilizers
      ? JSON.parse(rawData.fertilizers).map(
          (f: { type: string; amount: number }) => ({
            fertilizerType: f.type,
            fertilizerAmount: f.amount,
          })
        )
      : [],

    // Study Fields
    productTypeID: parseInt(rawData.productTypeID, 10),
    qualityLabID: parseInt(rawData.qualityLabID, 10),
    nirModelID: parseInt(rawData.nirModelID, 10),
    physiologicalStageID: parseInt(rawData.physiologicalStageID, 10),
    studyCode: rawData.studyCode, // Use studyCode from FormData
    sampleDate: new Date(rawData.sampleDate),
    program: rawData.program,
    requesterName: rawData.requesterName || undefined,
    requesterEmail: rawData.requesterEmail || undefined,

    // Upload Field
    file: rawData.file,
  };

  const validationResult = multiStepFormSchemaFinal.safeParse(dataToValidate);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    return { error: true, message: `Invalid data: ${errorMessages}` };
  }

  const validatedData = validationResult.data;

  try {
    const result = await db.transaction(async (tx) => {
      // Create or use existing trial
      let trialId: number;
      // get trial ID
      if (validatedData.useExistingTrial) {
        const existingTrial = await getTrialByName(validatedData.trial);
        if (!existingTrial) {
          throw new Error(
            `Existing trial named "${validatedData.trial}" was selected but not found in the database.`
          );
        }
        trialId = existingTrial.id;
      } else {
        // Create new trial
        let latitude: number | null = null;
        let longitude: number | null = null;
        if (validatedData.coordinates) {
          const coords = validatedData.coordinates
            .split(",")
            .map((s) => parseFloat(s.trim()));
          if (coords.length !== 2 || coords.some(isNaN)) {
            throw new Error(
              `Invalid coordinates format: "${validatedData.coordinates}". Expected "lat, lon".`
            );
          }
          latitude = coords[0];
          longitude = coords[1];
        }

        const newTrialData = {
          name: validatedData.trial,
          plantingDate: validatedData.trialPlantingDate.toISOString(),
          soilType: validatedData.soilType,
          irrigation: validatedData.irrigation ?? false,
          location: validatedData.location,
          latitude: latitude,
          longitude: longitude,
          cropId: validatedData.cropID,
          speciesId: validatedData.speciesID,
          // additionalMetadata: {}
        };

        const newTrial = await insertTrial(
          newTrialData,
          validatedData.fertilizers,
          tx
        );
        if (!newTrial || !newTrial.id) {
          throw new Error("Failed to create new trial record.");
        }
        trialId = newTrial.id;
      }

      // Create new study
      const studyData = {
        trialId,
        studyCode: validatedData.studyCode,
        productTypeId: validatedData.productTypeID,
        nirModelId: validatedData.nirModelID,
        requesterName: validatedData.requesterName,
        requesterEmail: validatedData.requesterEmail,
        sampleDate: validatedData.sampleDate.toISOString(),
        physiologicalStageId: validatedData.physiologicalStageID,
        qualityLabId: validatedData.qualityLabID,
        program: validatedData.program,
        // additionalMetadata: {}
      };

      const newStudy = await insertStudy(studyData, tx);
      if (!newStudy || !newStudy.id) {
        throw new Error("Failed to create new study record.");
      }
      const studyId = newStudy.id;
    });

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
