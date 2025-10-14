"use server";

import {
  deleteCenter as deleteCenterDb,
  getCenters,
  insertCenter,
  updateCenter as updateCenterDb,
} from "../db/center";
import { CenterSchema, centerSchema } from "../schemas/center";


export async function getCentersAction() {
  const centers = await getCenters();
  return centers;
}


export async function createCenter(unsafeData: CenterSchema) {
  const { success, data } = centerSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error creating the center" };
  }

  await insertCenter(data);
}

export async function updateCenter(id: number, unsafeData: CenterSchema) {
  const { success, data } = centerSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error updating the center" };
  }

  await updateCenterDb({ id }, data);
}

export async function deleteCenter(id: number) {
  try {
    await deleteCenterDb({ id });
    return { error: false, message: "Successfully deleted the center" };
  } catch (error) {
    return { error: true, message: "Error deleting the center" };
  }
}
