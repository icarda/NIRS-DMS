"use server";

import { z } from "zod";

import { traitSchema } from "@/components/crop-page-client";
import {
  deleteCropTrait as deleteCropTraitDb,
  insertCropTrait,
} from "../db/crop-trait";
import { cropTraitSchema } from "../schemas/crop-trait";

export async function addCropTrait(
  unsafeData: z.infer<typeof cropTraitSchema>,
  cropId: number
) {
  try {
    const { success, data, error } = cropTraitSchema.safeParse({
      ...unsafeData,
      cropId,
    });

    if (!success) {
      console.log("Validation failed", error);
      return { error: true, message: "There was an error creating the trait" };
    }

    const cropTraitData = {
      cropId: data.cropId,
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
    return { error: true, message: "Error deleting the trait" };
  }
}
