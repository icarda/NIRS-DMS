"use server";

import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { CropTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";
import { getCropIdTag } from "../db/cache/crop";
import {
  deleteCrop as deleteCropDb,
  getCrop as getCropDb,
  insertCrop,
  updateCrop as updateCropDb,
} from "../db/crop";
import { CropSchema, cropSchema } from "../schemas/crop";

export async function getCrop({ cropId }: { cropId: number }) {
  "use cache";
  cacheTag(getCropIdTag(cropId));
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
  const { success, data } = cropSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error updating the crop" };
  }

  const cropData = data;
  await updateCropDb({ id }, cropData);
}

export async function deleteCrop(id: number) {
  try {
    await deleteCropDb({ id });
    return { error: false, message: "Successfully deleted the crop" };
  } catch (error) {
    return { error: true, message: "Error deleting the crop" };
  }
}
