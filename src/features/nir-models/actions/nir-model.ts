"use server";

import { z } from "zod";

import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";
import {
  deleteNirModel as deleteNirModelDb,
  insertNirModel,
} from "../db/nir-model";
import { nirModelSchema } from "../schemas/nir-model";

export async function createNirModel(
  unsafeData: z.infer<typeof nirModelSchema>
) {
  const { success, data } = nirModelSchema.safeParse(unsafeData);

  const user = await getCurrentUser();
  const canCreateNirModel = hasPermission(user?.role, "nirModel:create");

  if (!success || !canCreateNirModel) {
    return {
      error: true,
      message: "There was an error creating the NIR model",
    };
  }

  try {
    await insertNirModel(data);
    return { error: false, message: "Successfully created the NIR model" };
  } catch (error) {
    return {
      error: true,
      message: "There was an error creating the NIR model",
    };
  }
}

export async function deleteNirModel(id: number) {
  try {
    const user = await getCurrentUser();
    const canDeleteNirModel = hasPermission(user?.role, "nirModel:delete");

    if (!canDeleteNirModel) {
      return {
        error: true,
        message: "You do not have permission to delete NIR models.",
      };
    }
    await deleteNirModelDb({ id });
    return { error: false, message: "Successfully deleted the NIR model" };
  } catch (error) {
    return { error: true, message: "Error deleting the NIR model" };
  }
}
