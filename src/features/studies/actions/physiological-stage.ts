"use server";

import { z } from "zod";

import {
  deletePhysiologicalStage as deletePhysiologicalStageDb,
  insertPhysiologicalStage,
} from "../db/physiological-stage";
import { physiologicalStageSchema } from "../schemas/physiological-stage";

export async function createPhysiologicalStage(
  unsafeData: z.infer<typeof physiologicalStageSchema>
) {
  const { success, data } = physiologicalStageSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error creating the physiological stage",
    };
  }

  try {
    await insertPhysiologicalStage(data);
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
