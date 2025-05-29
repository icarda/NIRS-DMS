"use server";

import { z } from "zod";

import { getCropByName } from "@/features/crops/db/crop";
import { getCurrentUser } from "@/lib/currentUser";
import { physiologicalStageAddSchema } from "@/lib/schemas";
import { hasPermission } from "@/permissions/general";
import {
  deletePhysiologicalStage as deletePhysiologicalStageDb,
  insertPhysiologicalStage,
} from "../db/physiological-stage";
import { getSpeciesForSample } from "../db/species";

export async function createPhysiologicalStage(
  unsafeData: z.infer<typeof physiologicalStageAddSchema>
) {
  const species = await getSpeciesForSample(456);
  console.log("species", species);
  // const { success, data } = physiologicalStageAddSchema.safeParse(unsafeData);
  // const user = await getCurrentUser();
  // const canCreatePhysiologicalStage = hasPermission(
  //   user?.role,
  //   "physiologicalStage:create"
  // );

  // if (!success || !canCreatePhysiologicalStage) {
  //   return {
  //     error: true,
  //     message: "There was an error creating the physiological stage",
  //   };
  // }

  // const { crop: cropName } = data;

  // const crop = await getCropByName(cropName);

  // if (!crop) {
  //   return {
  //     error: true,
  //     message: "Crop not found",
  //   };
  // }

  try {
    // await insertPhysiologicalStage({
    //   name: data.stage,
    //   cropId: crop.id,
    // });
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
