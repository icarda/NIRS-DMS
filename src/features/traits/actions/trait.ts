"use server";

import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/drizzle/db";
import { TraitTable } from "@/drizzle/schema";
import { isUniqueConstraintError } from "@/drizzle/schemaHelpers";
import { getDistinctSampleIdsForStudy } from "@/features/nirs-data/db/nirs-data";
import { getCurrentUser } from "@/lib/currentUser";
import { parseTraitFile, transformTraitDataForDb } from "@/lib/parsing";
import { traitUploadSchemaFinal } from "@/lib/schemas";
import { hasPermission } from "@/permissions/general";
import { revalidateTraitCache } from "../db/cache/trait";
import {
  deleteTrait as deleteTraitDb,
  insertTrait,
  insertTraitBatch,
} from "../db/trait";
import { traitSchema } from "../schemas/trait";

export async function uploadTraitDataAction(formData: FormData, force = false) {
  const dataToValidate = {
    studyId: parseInt(formData.get("studyId") as string, 10),
    studyCode: formData.get("studyCode") as string,
    cropId: parseInt(formData.get("cropId") as string, 10),
    year: parseInt(formData.get("year") as string, 10),
    traits: JSON.parse(formData.get("traits") as string),
    file: formData.get("file"),
  };
  const validationResult = traitUploadSchemaFinal.safeParse(dataToValidate);

  const user = await getCurrentUser();
  const canUploadTrait = hasPermission(user?.role, "trait:upload");
  if (!canUploadTrait) {
    return {
      error: true,
      message: "You do not have permission to upload trait data.",
    };
  }

  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    return { error: true, message: `Invalid input: ${errorMessages}` };
  }

  const { studyId, studyCode, cropId, year, traits, file } =
    validationResult.data;

  try {
    const parsedFileData = await parseTraitFile(file, traits);

    if (parsedFileData.length === 0) {
      return {
        error: false,
        message:
          "File parsed, but contained 0 data rows matching selected traits.",
      };
    }

    const traitSampleIds = [
      ...new Set(parsedFileData.map((row) => row.sampleId)),
    ];

    if (traitSampleIds.length > 0) {
      const existingNirsSampleIds = await getDistinctSampleIdsForStudy(studyId);
      const existingNirsSampleIdSet = new Set(existingNirsSampleIds);

      const missingSampleIds = traitSampleIds.filter(
        (id) => !existingNirsSampleIdSet.has(id)
      );

      if (missingSampleIds.length > 0) {
        throw new Error(
          `Data Quality Error: Sample ID consistency check failed. The following sample IDs from the trait file were not found in the NIRS data for study ${studyId}: ${missingSampleIds.slice(0, 6).join(", ")}${missingSampleIds.length > 6 ? "..." : ""}. Please ensure sample IDs match existing NIRS data.`
        );
      }
    } else {
      throw new Error(
        "Could not extract valid Sample IDs from the Trait file."
      );
    }

    const traitDataToInsert = await transformTraitDataForDb(
      parsedFileData,
      studyId,
      year,
      cropId
    );

    if (traitDataToInsert.length === 0) {
      return {
        error: false,
        message: `File parsed, but no data matched valid traits defined for crop ${cropId}. No traits inserted.`,
      };
    }

    // Handling the conflict resolution: overwrite if `force` is true
    if (!force) {
      // Check for existing sample IDs in the database before inserting
      const existingSamples = await db
        .selectDistinct({ sampleId: TraitTable.sampleId })
        .from(TraitTable)
        .where(
          and(
            eq(TraitTable.studyId, studyId),
            inArray(TraitTable.sampleId, traitSampleIds)
          )
        );

      if (existingSamples.length > 0) {
        return {
          error: true,
          type: "CONFLICT",
          existingSampleIds: existingSamples.map((e) => e.sampleId),
          message:
            "Some sample IDs already exist. Please choose to overwrite or cancel.",
        };
      }
    }

    // If force is true, or if no conflicts, insert the trait data into the database
    if (force) {
      await db.transaction(async (tx) => {
        // Delete the existing data for the conflicting sample IDs
        await tx
          .delete(TraitTable)
          .where(
            and(
              eq(TraitTable.studyId, studyId),
              inArray(TraitTable.sampleId, traitSampleIds)
            )
          );

        // Insert new trait data
        await insertTraitBatch(traitDataToInsert, tx);
      });
    } else {
      await db.transaction(async (tx) => {
        // Insert trait data if no conflicts
        await insertTraitBatch(traitDataToInsert, tx);
      });
    }

    revalidateTraitCache();

    return {
      error: false,
      message: `Trait data uploaded successfully. ${traitDataToInsert.length} trait records inserted for study ${studyCode}.`,
    };
  } catch (error: any) {
    if (isUniqueConstraintError(error)) {
      return {
        error: true,
        message: "Some values already exist and cannot be duplicated.",
      };
    }
    return {
      error: true,
      message:
        error.message ||
        "An unexpected server error occurred during trait processing.",
    };
  }
}

export async function createTrait(unsafeData: z.infer<typeof traitSchema>) {
  const { success, data } = traitSchema.safeParse(unsafeData);
  const user = await getCurrentUser();
  const canCreateTrait = hasPermission(user?.role, "trait:create");

  if (!success || !canCreateTrait) {
    return { error: true, message: "There was an error creating the trait" };
  }

  await insertTrait(data);
}

export async function deleteTrait(id: number) {
  try {
    await deleteTraitDb({ id });
    return { error: false, message: "Successfully deleted the trait" };
  } catch (error) {
    return { error: true, message: "Error deleting the trait" };
  }
}
