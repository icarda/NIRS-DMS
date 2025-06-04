"use server";

import { z } from "zod";

import {
  deleteSpecies as deleteSpeciesDb,
  insertSpecies,
  updateSpecies as updateSpeciesDb,
} from "../db/species";
import { speciesSchema } from "../schemas/species";

export async function createSpecies(
  unsafeData: z.infer<typeof speciesSchema>,
  cropId: number
) {
  const { success, data } = speciesSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error creating the species" };
  }

  try {
    await insertSpecies({ ...data, cropId });
    return { error: false, message: "Species created successfully" };
  } catch (error) {
    return { error: true, message: "There was an error creating the species" };
  }
}

export async function updateSpecies(
  id: number,
  unsafeData: z.infer<typeof speciesSchema>
) {
  const { success, data } = speciesSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error updating the species" };
  }

  try {
    await updateSpeciesDb(id, data.name);
    return { error: false, message: "Species updated successfully" };
  } catch (error) {
    return { error: true, message: "There was an error updating the species" };
  }
}

export async function deleteSpecies(id: number) {
  try {
    await deleteSpeciesDb(id);
    return { error: false, message: "Species deleted successfully" };
  } catch (error) {
    return { error: true, message: "There was an error deleting the species" };
  }
}
