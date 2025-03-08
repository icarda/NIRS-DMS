"use server";

import { z } from "zod";

import {
  deleteCrop as deleteCropDb,
  insertCrop,
  updateCrop as updateCropDb,
} from "../db/crop";
import { cropSchema } from "../schemas/crop";

export async function createCrop(unsafeData: z.infer<typeof cropSchema>) {
  const { success, data } = cropSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error creating the crop" };
  }

  const { commonNames, ...cropData } = data;
  await insertCrop(cropData, commonNames);
}

export async function updateCrop(
  id: number,
  unsafeData: z.infer<typeof cropSchema>
) {
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
