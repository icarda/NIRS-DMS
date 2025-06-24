"use server";

import { z } from "zod";

import { db } from "@/drizzle/db";
import { CropTraitTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";
import {
  deleteCropTrait as deleteCropTraitDb,
  getCropTraits,
  insertCropTrait,
  updateCropTrait as updateCropTraitDb,
} from "../db/crop-trait";
import { cropTraitSchema } from "../schemas/crop-trait";

export async function getAllCropTraitUnits() {
  const units = await db
    .selectDistinct({ unit: CropTraitTable.unit })
    .from(CropTraitTable);
  return units.map((item) => item.unit);
}

export async function addCropTrait(
  unsafeData: z.infer<typeof cropTraitSchema>,
  cropId: number
) {
  try {
    const { success, data } = cropTraitSchema.safeParse({
      ...unsafeData,
      cropId,
    });
    const user = await getCurrentUser();
    const canCreateCropTrait = hasPermission(user?.role, "cropTrait:create");

    if (!success || !canCreateCropTrait) {
      return { error: true, message: "There was an error creating the trait" };
    }

    // check if the trait already exists for the crop
    const cropTraits = await getCropTraits({ cropId });

    const traitExists = cropTraits.some(
      (trait) => trait.traitVariable === data.traitVariable
    );
    if (traitExists) {
      return {
        error: true,
        message: `Trait with variable "${data.traitVariable}" already exists for this crop.`,
      };
    }

    const cropTraitData = {
      cropId,
      traitName: data.traitName,
      traitVariable: data.traitVariable,
      entity: data.entity,
      methodDescription: data.methodDescription,
      unit: data.unit,
      minimumAllowed: data.minimumAllowed,
      maximumAllowed: data.maximumAllowed,
    };

    await insertCropTrait(cropTraitData);

    return { error: false, message: "Trait added successfully." };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        error: true,
        message: error.errors.map((e) => e.message).join(", "),
      };
    } else {
      return { error: true, message: "Failed to add trait: " + error.message };
    }
  }
}

export async function deleteCropTrait(id: number) {
  try {
    await deleteCropTraitDb({ id });
    return { error: false, message: "Successfully deleted the trait" };
  } catch (error) {
    return {
      error: true,
      message:
        (error as unknown as Error).message ?? "Error deleting the trait",
    };
  }
}

export async function updateCropTrait(
  id: number,
  unsafeData: z.infer<typeof cropTraitSchema>
) {
  const { success, data } = cropTraitSchema.safeParse(unsafeData);

  try {
    const user = await getCurrentUser();
    const canUpdateTrialMetadata = hasPermission(
      user?.role,
      "cropTrait:update"
    );

    if (!success || !canUpdateTrialMetadata || !user?.id) {
      return {
        error: true,
        message: "There was an error updating the crop trait",
      };
    }

    const cropTraitData = {
      id,
      traitVariable: data.traitVariable,
      traitName: data.traitName,
      entity: data.entity,
      methodDescription: data.methodDescription,
      unit: data.unit,
      minimumAllowed: data.minimumAllowed,
      maximumAllowed: data.maximumAllowed,
    };

    await updateCropTraitDb(id, cropTraitData);

    return { error: false, message: "Crop trait updated successfully." };
  } catch (error: any) {
    return {
      error: true,
      message: "Failed to update crop trait: " + error.message,
    };
  }
}
