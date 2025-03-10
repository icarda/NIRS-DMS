"use server";

import { z } from "zod";

import { deleteTrait as deleteTraitDb, insertTrait } from "../db/trait";
import { traitSchema } from "../schemas/trait";

export async function createTrait(unsafeData: z.infer<typeof traitSchema>) {
  const { success, data } = traitSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error creating the trait" };
  }

  await insertTrait(data);
}

export async function deleteTrait(id: number) {
  try {
    await deleteTraitDb({ id });
    return { error: false, message: "Successfully deleted the trait" };
  } catch (error) {
    return { error: true, message: "Error deleting the trait" };
  }
}
