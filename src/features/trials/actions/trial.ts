"use server";

import { z } from "zod";

import { db } from "@/drizzle/db";
import { TrialMetadataConfig } from "@/drizzle/schema";
import {
  deleteTrial as deleteTrialDb,
  deleteTrialMetadataConfig,
  getTrialMetadataByName,
  insertTrial,
  removeJsonKeyFromAllTrials,
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

export async function deleteTrialMetadata(name: string) {
  try {
    const config = await getTrialMetadataByName(name);

    if (!config) {
      return {
        error: true,
        message: "Metadata field not found.",
      };
    }

    if (config.source === "sql") {
      return {
        error: true,
        message: "Cannot delete SQL-based metadata fields.",
      };
    }

    await db.transaction(async (tx) => {
      await deleteTrialMetadataConfig(name, tx);
      await removeJsonKeyFromAllTrials(name, tx);
    });

    return {
      error: false,
      message: "Metadata deleted successfully.",
    };
  } catch (err) {
    console.error("Delete metadata error:", err);
    return {
      error: true,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
