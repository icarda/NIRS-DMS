"use server";

import { eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { CropTable } from "@/drizzle/schema";
import {
  deleteCrop as deleteCropDb,
  insertCrop,
  updateCrop as updateCropDb,
} from "../db/crop";
import { CropSchema, cropSchema } from "../schemas/crop";

export async function createCrop(unsafeData: CropSchema) {
  const { success, data } = cropSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error creating the crop" };
  }

  const { commonNames, ...cropData } = data;

  const existingCrop = await db.query.CropTable.findFirst({
    where: eq(CropTable.name, cropData.name),
  });

  if (existingCrop) {
    return { error: true, message: "Crop name already exists" };
  }

  await insertCrop(cropData, commonNames);
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

  const { commonNames, ...cropData } = data;
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
