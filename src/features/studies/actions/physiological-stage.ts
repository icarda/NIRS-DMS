"use server";

import { z } from "zod";

import { getCropByName } from "@/features/crops/db/crop";
import { physiologicalStageAddSchema } from "@/lib/schemas";
import {
  deletePhysiologicalStage as deletePhysiologicalStageDb,
  insertPhysiologicalStage,
} from "../db/physiological-stage";

export async function createPhysiologicalStage(
  unsafeData: z.infer<typeof physiologicalStageAddSchema>
) {
  const { success, data } = physiologicalStageAddSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error creating the physiological stage",
    };
  }

  const { crop: cropName } = data;

  const crop = await getCropByName(cropName);

  if (!crop) {
    return {
      error: true,
      message: "Crop not found",
    };
  }

  try {
    await insertPhysiologicalStage({
      name: data.stage,
      cropId: crop.id,
    });
    return {
      error: false,
      message: "Successfully created the physiological stage",
    };
  } catch (error) {
    return {
      error: true,
      message: "There was an error creating the physiological stage",
    };
  }
}

export async function deletePhysiologicalStage(id: number) {
  try {
    await deletePhysiologicalStageDb({ id });
    return { error: false, message: "Successfully deleted the study" };
  } catch (error) {
    return { error: true, message: "Error deleting the study" };
  }
}
