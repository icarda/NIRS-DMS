"use server";

import {
  deleteQualityLab as deleteQualityLabDb,
  insertQualityLab,
  updateQualityLab as updateQualityLabDb,
} from "../db/quality-lab";
import { QualityLabSchema, qualityLabSchema } from "../schemas/quality-lab";

export async function createQualityLab(unsafeData: QualityLabSchema) {
  const { success, data } = qualityLabSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error creating the quality lab",
    };
  }

  await insertQualityLab(data);
}

export async function updateQualityLab(
  id: number,
  unsafeData: QualityLabSchema
) {
  const { success, data } = qualityLabSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error updating the quality lab",
    };
  }

  await updateQualityLabDb({ id }, data);
}

export async function deleteQualityLab(id: number) {
  try {
    await deleteQualityLabDb({ id });
    return { error: false, message: "Successfully deleted the quality lab" };
  } catch (error) {
    return { error: true, message: "Error deleting the quality lab" };
  }
}
