"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  deleteCenter as deleteCenterDb,
  insertCenter,
  updateCenter as updateCenterDb,
} from "../db/center";
import { centerSchema } from "../schemas/center";

export async function createCenter(unsafeData: z.infer<typeof centerSchema>) {
  const { success, data } = centerSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error creating the center" };
  }

  await insertCenter(data);
  redirect("/admin/centers");
}

export async function updateCenter(
  id: number,
  unsafeData: z.infer<typeof centerSchema>
) {
  const { success, data } = centerSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error updating the center" };
  }

  await updateCenterDb({ id }, data);
  redirect("/admin/centers");
}

export async function deleteCenter(id: number) {
  try {
    await deleteCenterDb({ id });
    return { error: false, message: "Successfully deleted the center" };
  } catch (error) {
    return { error: true, message: "Error deleting the center" };
  }
}
