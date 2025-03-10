"use server";

import { z } from "zod";

import {
  deleteNirModel as deleteNirModelDb,
  insertNirModel,
} from "../db/nir-model";
import { nirModelSchema } from "../schemas/nir-model";

export async function createNirModel(
  unsafeData: z.infer<typeof nirModelSchema>
) {
  const { success, data } = nirModelSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error creating the NIR model",
    };
  }

  try {
    await insertNirModel(data);
  } catch (error) {
    return {
      error: true,
      message: "There was an error creating the NIR model",
    };
  }
}

export async function deleteNirModel(id: number) {
  try {
    await deleteNirModelDb({ id });
    return { error: false, message: "Successfully deleted the NIR model" };
  } catch (error) {
    return { error: true, message: "Error deleting the NIR model" };
  }
}
