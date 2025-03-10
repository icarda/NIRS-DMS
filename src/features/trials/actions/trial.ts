"use server";

import { z } from "zod";

import {
  deleteTrial as deleteTrialDb,
  insertTrial,
  updateTrial as updateTrialDb,
} from "../db/trial";
import { trialSchema } from "../schemas/trial";

export async function createTrial(unsafeData: z.infer<typeof trialSchema>) {
  const { success, data } = trialSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error creating the trial" };
  }

  const { fertilizers, ...trialData } = data;
  await insertTrial(trialData, fertilizers);
}

export async function updateTrial(
  id: number,
  unsafeData: z.infer<typeof trialSchema>
) {
  const { success, data } = trialSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error updating the trial" };
  }

  const { fertilizers, ...trialData } = data;
  await updateTrialDb({ id }, trialData);
}

export async function deleteTrial(id: number) {
  try {
    await deleteTrialDb({ id });
    return { error: false, message: "Successfully deleted the trial" };
  } catch (error) {
    return { error: true, message: "Error deleting the trial" };
  }
}
