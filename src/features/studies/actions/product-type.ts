"use server";

import { z } from "zod";

import {
  deleteProductType as deleteProductTypeDb,
  insertProductType,
} from "../db/product-type";
import { productTypeSchema } from "../schemas/product-type";

export async function createProductType(
  unsafeData: z.infer<typeof productTypeSchema>
) {
  const { success, data } = productTypeSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error creating the physiological stage",
    };
  }

  try {
    await insertProductType(data);
  } catch (error) {
    return {
      error: true,
      message: "There was an error creating the physiological stage",
    };
  }
}

export async function deleteProductType(id: number) {
  try {
    await deleteProductTypeDb({ id });
    return { error: false, message: "Successfully deleted the study" };
  } catch (error) {
    return { error: true, message: "Error deleting the study" };
  }
}
