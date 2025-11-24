"use server";

import { z } from "zod";

import { getCropByName } from "@/features/crops/db/crop";
import { getCurrentUser } from "@/lib/currentUser";
import { productTypeAddSchema } from "@/lib/schemas";
import { hasPermission } from "@/permissions/general";
import {
  deleteProductType as deleteProductTypeDb,
  insertProductType,
  updateProductType as updateProductTypeDb,
} from "../db/product-type";

const productTypeEditSchema = productTypeAddSchema.extend({
  id: z.number().int().positive(),
});

type DbError = Error & { code?: string };

export async function createProductType(
  unsafeData: z.infer<typeof productTypeAddSchema>
) {
  const { success, data } = productTypeAddSchema.safeParse(unsafeData);
  const user = await getCurrentUser();
  const canCreateProductType = hasPermission(user?.role, "productType:create");

  if (!success || !canCreateProductType) {
    return {
      error: true,
      message: "There was an error creating the product type",
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
    const user = await getCurrentUser();
    const canDeleteProductType = hasPermission(
      user?.role,
      "productType:delete"
    );
    if (!canDeleteProductType) {
      return {
        error: true,
        message: "You do not have permission to delete product types.",
      };
    }
    await deleteProductTypeDb({ id });
    return { error: false, message: "Successfully deleted the study" };
  } catch (error) {
    return { error: true, message: "Error deleting the study" };
  }
}

export async function updateProductType(
  unsafeData: z.infer<typeof productTypeEditSchema>
) {
  const { success, data } = productTypeEditSchema.safeParse(unsafeData);
  const user = await getCurrentUser();
  const canUpdateProductType = hasPermission(
    user?.role,
    "productType:update"
  );

  if (!success || !canUpdateProductType) {
    return {
      error: true,
      message: "There was an error updating the product type",
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
    await updateProductTypeDb(data.id, {
      name: data.type,
      cropId: crop.id,
    });
    return { error: false, message: "Successfully updated the product type" };
  } catch (error) {
    const dbError = error as DbError;
    if (dbError?.code === "23505") {
      return {
        error: true,
        message: "This product type already exists for the selected crop",
      };
    }
    console.error("Error updating product type", error);
    return {
      error: true,
      message: "There was an error updating the product type",
    };
  }
}
