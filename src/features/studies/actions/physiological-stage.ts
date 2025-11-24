"use server";

import { z } from "zod";

import { getCropByName } from "@/features/crops/db/crop";
import { getCurrentUser } from "@/lib/currentUser";
import { physiologicalStageAddSchema } from "@/lib/schemas";
import { hasPermission } from "@/permissions/general";
import {
  deletePhysiologicalStage as deletePhysiologicalStageDb,
  insertPhysiologicalStage,
  updatePhysiologicalStage as updatePhysiologicalStageDb,
} from "../db/physiological-stage";

const physiologicalStageEditSchema = physiologicalStageAddSchema.extend({
  id: z.number().int().positive(),
});

export async function createPhysiologicalStage(
  unsafeData: z.infer<typeof physiologicalStageAddSchema>
) {
  const { success, data } = physiologicalStageAddSchema.safeParse(unsafeData);
  const user = await getCurrentUser();
  const canCreatePhysiologicalStage = hasPermission(
    user?.role,
    "physiologicalStage:create"
  );

  if (!success || !canCreatePhysiologicalStage) {
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
    const user = await getCurrentUser();
    const canDeletePhysiologicalStage = hasPermission(
      user?.role,
      "physiologicalStage:delete"
    );

    if (!canDeletePhysiologicalStage) {
      return {
        error: true,
        message: "You do not have permission to delete physiological stages.",
      };
    }
    await deletePhysiologicalStageDb({ id });
    return { error: false, message: "Successfully deleted the study" };
  } catch (error) {
    return { error: true, message: "Error deleting the study" };
  }
}

export async function updatePhysiologicalStage(
  unsafeData: z.infer<typeof physiologicalStageEditSchema>
) {
  const { success, data } = physiologicalStageEditSchema.safeParse(unsafeData);
  const user = await getCurrentUser();
  const canUpdatePhysiologicalStage = hasPermission(
    user?.role,
    "physiologicalStage:update"
  );

  if (!success || !canUpdatePhysiologicalStage) {
    return {
      error: true,
      message: "There was an error updating the physiological stage",
    };
  }

  const crop = await getCropByName(data.crop);

  if (!crop) {
    return {
      error: true,
      message: "Crop not found",
    };
  }

  try {
    await updatePhysiologicalStageDb(data.id, {
      name: data.stage,
      cropId: crop.id,
    });
    return {
      error: false,
      message: "Successfully updated the physiological stage",
    };
  } catch (error) {
    console.error("Error updating physiological stage", error);
    return {
      error: true,
      message: "There was an error updating the physiological stage",
    };
  }
}
