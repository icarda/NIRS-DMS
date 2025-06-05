"use server";

import { eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import {
  CropTable,
  NirsDataTable,
  StudyTable,
  TrialTable,
} from "@/drizzle/schema";
import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";
import {
  deleteCrop as deleteCropDb,
  getCrop as getCropDb,
  insertCrop,
  updateCrop as updateCropDb,
} from "../db/crop";
import { CropSchema, cropSchema } from "../schemas/crop";

export async function getCrop({ cropId }: { cropId: number }) {
  "use cache";
  const crop = await getCropDb(cropId);
  if (!crop) {
    return null;
  }

  return crop;
}

export async function createCrop(unsafeData: CropSchema) {
  const { success, data } = cropSchema.safeParse(unsafeData);
  const user = await getCurrentUser();
  const canCreateCrop = hasPermission(user?.role, "crop:create");

  if (!success || !canCreateCrop) {
    return { error: true, message: "There was an error creating the crop" };
  }

  const cropData = data;

  const existingCrop = await db.query.CropTable.findFirst({
    where: eq(CropTable.name, cropData.name),
  });

  if (existingCrop) {
    return { error: true, message: "Crop name already exists" };
  }

  await insertCrop(cropData);
  return {
    error: false,
    message: "Successfully created the crop",
  };
}

export async function updateCrop(id: number, unsafeData: CropSchema) {
  const { success, data, error } = cropSchema.safeParse(unsafeData);

  const user = await getCurrentUser();
  const canUpdateCrop = hasPermission(user?.role, "crop:update");

  console.log(success, canUpdateCrop, error);

  if (!success || !canUpdateCrop) {
    return { error: true, message: "There was an error updating the crop" };
  }

  const cropData = data;
  await updateCropDb({ id }, cropData);

  return {
    error: false,
    message: "Successfully updated the crop",
  };
}

export async function deleteCrop(id: number) {
  const user = await getCurrentUser();
  const canDeleteCrop = hasPermission(user?.role, "crop:delete");
  if (!canDeleteCrop) {
    return {
      error: true,
      message: "You do not have permission to delete crops",
    };
  }

  try {
    const hasNirsData = await checkNirsDataForCrop(id);

    if (hasNirsData) {
      return {
        error: true,
        message:
          "Cannot delete crop: NIRS data is associated with it. Please delete NIRS data first.",
      };
    }

    await deleteCropDb({ id });
    return { error: false, message: "Successfully deleted the crop" };
  } catch (error) {
    return { error: true, message: "Error deleting the crop" };
  }
}

export async function checkNirsDataForCrop(cropId: number): Promise<boolean> {
  try {
    const result = await db
      .select({
        nirsDataId: NirsDataTable.id,
      })
      .from(NirsDataTable)
      .innerJoin(StudyTable, eq(NirsDataTable.studyId, StudyTable.id))
      .leftJoin(TrialTable, eq(StudyTable.trialId, TrialTable.id))
      .where(eq(TrialTable.cropId, cropId))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error(
      `Drizzle error checking NIRS data for crop ID ${cropId}:`,
      error
    );

    throw new Error("Database error while checking for associated NIRS data.");
  }
}
