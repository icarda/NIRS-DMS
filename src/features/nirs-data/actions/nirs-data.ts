"use server";

import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { NirsDataTable, OtherIdsTable } from "@/drizzle/schema";
import { isUniqueConstraintError } from "@/drizzle/schemaHelpers";
import { getNirModelById } from "@/features/nir-models/db/nir-model";
import { insertOtherIdsBatch } from "@/features/other_ids/db/other_ids";
import {
  getSpeciesById,
  getTrialSpecies,
  insertTrialSpecies,
} from "@/features/studies/db/species";
import {
  getStudyByCode,
  insertStudy,
  updateStudyById,
} from "@/features/studies/db/study";
import { getTrialByName, insertTrial } from "@/features/trials/db/trial";
import { getCurrentUser } from "@/lib/currentUser";
import {
  NIRSData,
  parseNirsFile,
  transformParsedNirsDataForDb,
} from "@/lib/parsing";
import {
  multiStepFormSchemaFinal,
  MultiStepFormSchemaFinal,
} from "@/lib/schemas";
import { hasPermission } from "@/permissions/general";
import { insertNirsDataBatch } from "../db/nirs-data";

function parseWavelengthRange(
  rangeString: string
): { min: number; max: number } | null {
  if (!rangeString || typeof rangeString !== "string") return null;
  const parts = rangeString.split("-");
  if (parts.length !== 2) return null;
  const min = parseFloat(parts[0].trim());
  const max = parseFloat(parts[1].trim());
  if (isNaN(min) || isNaN(max) || !isFinite(min) || !isFinite(max) || min > max)
    return null;
  return { min, max };
}

export interface OtherIdInsertData {
  sampleId: number;
  plotId: number;
  gid: number;
  studyId: number;
}

export async function uploadNirsData(
  formData: FormData,
  force = false
): Promise<{
  error: boolean;
  message: string;
  existingSampleIds?: number[];
}> {
  const user = await getCurrentUser();
  const canUploadNirsData = hasPermission(user?.role, "nirs:upload");

  if (!canUploadNirsData) {
    return {
      error: true,
      message: "You do not have permission to upload NIRS data.",
    };
  }

  const rawData: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    rawData[key] = value;
  }
  const overwriteStudy = rawData.overwriteStudy === "true";

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
            type: f.type,
            amount: f.amount,
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
    const nirModel = await getNirModelById({ id: validatedData.nirModelID });
    if (!nirModel) throw new Error("NIR model not found in the database.");
    const wavelengthRange = parseWavelengthRange(nirModel.wavelengthRange);
    if (!wavelengthRange) {
      throw new Error(
        `Invalid wavelength range for NIR model ID ${validatedData.nirModelID}.`
      );
    }
    let result:
      | {
          studyCode: string;
          insertedNirsCount: number;
        }
      | {
          type: "CONFLICT";
          existingSampleIds: number[];
        };
    try {
      result = await db.transaction(async (tx) => {
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

          // Check if the species ID is valid
          const existingSpecies = await getSpeciesById(validatedData.speciesID);

          if (!existingSpecies) {
            throw new Error(
              `Existing species ID ${validatedData.speciesID} was selected but not found in the database.`
            );
          }

          const trialSpecies = await getTrialSpecies(
            trialId,
            validatedData.speciesID
          );

          if (!trialSpecies) {
            const trialSpeciesData = {
              trialId,
              speciesId: validatedData.speciesID,
            };
            await insertTrialSpecies(trialSpeciesData, tx);
          }
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

          const species = await getSpeciesById(validatedData.speciesID);

          if (!species) {
            throw new Error(
              `Species ID ${validatedData.speciesID} was selected but not found in the database.`
            );
          }

          const trialSpeciesData = {
            trialId,
            speciesId: validatedData.speciesID,
          };
          await insertTrialSpecies(trialSpeciesData, tx);
        }

        let studyId;
        let newStudy;
        const existingStudy = await getStudyByCode(validatedData.studyCode);

        if (existingStudy) {
          if (overwriteStudy) {
            // Overwrite the study (update it)
            const updatedStudy = await updateStudyById(
              existingStudy.id,
              {
                productTypeId: validatedData.productTypeID,
                nirModelId: validatedData.nirModelID,
                requesterName: validatedData.requesterName,
                requesterEmail: validatedData.requesterEmail,
                sampleDate: validatedData.sampleDate.toISOString(),
                physiologicalStageId: validatedData.physiologicalStageID,
                qualityLabId: validatedData.qualityLabID,
                program: validatedData.program,
              },
              tx
            );

            if (!updatedStudy) {
              console.error("updatedStudy:", updatedStudy);
              throw new Error("Failed to overwrite existing study.");
            }

            studyId = existingStudy.id;
          } else {
            const newStudyCode = `${validatedData.studyCode}+${Date.now()}`;
            const studyData = {
              trialId,
              studyCode: newStudyCode,
              productTypeId: validatedData.productTypeID,
              nirModelId: validatedData.nirModelID,
              requesterName: validatedData.requesterName,
              requesterEmail: validatedData.requesterEmail,
              sampleDate: validatedData.sampleDate.toISOString(),
              physiologicalStageId: validatedData.physiologicalStageID,
              qualityLabId: validatedData.qualityLabID,
              program: validatedData.program,
            };
            newStudy = await insertStudy(studyData, tx);
            if (!newStudy?.id) throw new Error("Failed to create new study.");
            studyId = newStudy.id;
          }
        } else {
          // Create new study if code doesn't exist
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
          };
          newStudy = await insertStudy(studyData, tx);
          if (!newStudy?.id) throw new Error("Failed to create study.");
          studyId = newStudy.id;
        }

        // Parse file
        const file = validatedData.file as File;

        const parsedFileData = await parseNirsFile(file);

        if (!parsedFileData) {
          throw new Error("File parsing failed or returned no result.");
        }

        // handle if a user uploads data having already registered sample_ids
        const sampleIds = parsedFileData.map((row) => row.sampleId);
        if (!force) {
          const existingSamples = await tx
            .selectDistinct({ sampleId: NirsDataTable.sampleId })
            .from(NirsDataTable)
            .where(
              and(
                eq(NirsDataTable.studyId, studyId),
                inArray(NirsDataTable.sampleId, sampleIds)
              )
            );

          if (existingSamples.length > 0) {
            throw {
              type: "CONFLICT",
              existingSampleIds: existingSamples.map((e) => e.sampleId),
            };
          }
        } else {
          await tx
            .delete(NirsDataTable)
            .where(
              and(
                eq(NirsDataTable.studyId, studyId),
                inArray(NirsDataTable.sampleId, sampleIds)
              )
            );

          await tx
            .delete(OtherIdsTable)
            .where(
              and(
                eq(OtherIdsTable.studyId, studyId),
                inArray(OtherIdsTable.sampleId, sampleIds)
              )
            );
        }

        let otherIdsToInsert: OtherIdInsertData[] = [];
        if (parsedFileData.length > 0) {
          const uniqueIdsMap = new Map<string, OtherIdInsertData>();
          for (const row of parsedFileData) {
            const key = `${studyId}-${row.sampleId}-${row.plotId}-${row.gid}`;

            if (!uniqueIdsMap.has(key)) {
              uniqueIdsMap.set(key, {
                sampleId: row.sampleId,
                plotId: row.plotId,
                gid: row.gid,
                studyId,
              });
            }
          }

          otherIdsToInsert = Array.from(uniqueIdsMap.values());

          if (otherIdsToInsert.length > 0) {
            await insertOtherIdsBatch(otherIdsToInsert, tx);
          }
        }

        let nirsDataToInsert: NIRSData[] = [];
        if (parsedFileData.length > 0) {
          nirsDataToInsert = transformParsedNirsDataForDb(
            parsedFileData,
            studyId,
            wavelengthRange
          );
        }

        if (nirsDataToInsert.length > 0) {
          await insertNirsDataBatch(nirsDataToInsert, tx);
        }

        return {
          studyCode: newStudy ? newStudy.studyCode : validatedData.studyCode,
          insertedNirsCount: nirsDataToInsert.length,
        };
      });
    } catch (error: any) {
      if (error?.type === "CONFLICT") {
        return {
          error: true,
          message: "Some sample IDs already exist.",
          existingSampleIds: error.existingSampleIds,
        };
      }

      // any other unexpected error
      console.error("Unexpected error:", error);
      return {
        error: true,
        message: "An unexpected error occurred.",
      };
    }

    return {
      error: false,
      message: `Study processed (Code: ${result?.studyCode}). File processed. ${result?.insertedNirsCount} NIRS data rows inserted successfully.`,
    };
  } catch (error: any) {
    console.error("Error during NIRS data processing:", error);
    if (isUniqueConstraintError(error)) {
      return {
        error: true,
        message: "Some values already exist and cannot be duplicated.",
      };
    }
    return {
      error: true,
      message: error.message || "An unexpected server error occurred.",
    };
  }
}
