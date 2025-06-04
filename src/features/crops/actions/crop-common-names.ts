"use server";

import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";
import { revalidateCropCommonNamesCache } from "../db/cache/cropCommonNames";
import {
  deleteCropCommonName as deleteCropCommonNameDb,
  insertCropCommonNames,
  updateCropCommonName as updateCropCommonNameDb,
} from "../db/cropCommonNames";
import {
  cropCommonNameSchema,
  type CropCommonNameSchema,
} from "../schemas/crop";

export async function createCropCommonName(
  unsafeData: CropCommonNameSchema,
  cropId: number
) {
  const { success, data } = cropCommonNameSchema.safeParse(unsafeData);
  const user = await getCurrentUser();
  const canCreateCropCommonName = hasPermission(
    user?.role,
    "commonName:create"
  );

  if (!success || !canCreateCropCommonName) {
    return {
      error: true,
      message: "There was an error creating the crop common name",
    };
  }

  const commonNames = data;

  await insertCropCommonNames(cropId, commonNames.commonName);

  return {
    error: false,
    message: "Successfully created the crop common names",
  };
}

export async function updateCropCommonName(
  id: number,
  unsafeData: CropCommonNameSchema
) {
  const { success, data } = cropCommonNameSchema.safeParse(unsafeData);
  const user = await getCurrentUser();
  const canUpdateCropCommonName = hasPermission(
    user?.role,
    "commonName:update"
  );

  if (!success || !canUpdateCropCommonName) {
    return {
      error: true,
      message: "There was an error updating the crop common name",
    };
  }

  const updatedCommonName = await updateCropCommonNameDb(id, data);

  if (updatedCommonName == null) {
    return { error: true, message: "Failed to update crop common name" };
  }

  return {
    error: false,
    message: "Successfully updated the crop common name",
  };
}

export async function deleteCropCommonName(id: number) {
  const user = await getCurrentUser();
  const canDeleteCropCommonName = hasPermission(
    user?.role,
    "commonName:delete"
  );

  if (!canDeleteCropCommonName) {
    return { error: true, message: "You do not have permission to delete" };
  }

  const deletedCommonName = await deleteCropCommonNameDb(id);

  if (deletedCommonName == null) {
    return { error: true, message: "Failed to delete crop common name" };
  }

  return {
    error: false,
    message: "Successfully deleted the crop common name",
  };
}
