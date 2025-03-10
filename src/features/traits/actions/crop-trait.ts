"use server";

import { z } from "zod";

import {
  deleteCropTrait as deleteCropTraitDb,
  insertCropTrait,
} from "../db/crop-trait";
import { cropTraitSchema } from "../schemas/crop-trait";

export async function createCropTrait(
  unsafeData: z.infer<typeof cropTraitSchema>
) {
  const { success, data } = cropTraitSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error creating the trait" };
  }

  await insertCropTrait(data);
}

export async function deleteCropTrait(id: number) {
  try {
    await deleteCropTraitDb({ id });
    return { error: false, message: "Successfully deleted the trait" };
  } catch (error) {
    return { error: true, message: "Error deleting the trait" };
  }
}
