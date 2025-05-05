"use server";

import { z } from "zod";

import { getCropByName } from "@/features/crops/db/crop";
import { productTypeAddSchema } from "@/lib/schemas";
import {
  deleteProductType as deleteProductTypeDb,
  insertProductType,
} from "../db/product-type";

export async function createProductType(
  unsafeData: z.infer<typeof productTypeAddSchema>
) {
  console.log("Creating product type", unsafeData);
  const { success, data } = productTypeAddSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error creating the product type - invalid data",
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
    await insertProductType({
      name: data.type,
      cropId: crop.id,
    });
    return { error: false, message: "Successfully created the product type" };
  } catch (error) {
    console.error("Error creating product type", error);
    return {
      error: true,
      message: "There was an error creating the product type",
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
