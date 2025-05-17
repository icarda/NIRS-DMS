"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/drizzle/db";
import { TrialMetadataConfig } from "@/drizzle/schema";
import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";
import {
  deleteTrial as deleteTrialDb,
  deleteTrialMetadataConfig,
  getTrialMetadataByName,
  insertTrial,
  insertTrialMetadataConfig,
  removeJsonKeyFromAllTrials,
  updateTrial as updateTrialDb,
} from "../db/trial";
import { metadataConfigSchema, trialSchema } from "../schemas/trial";

export async function createTrial(unsafeData: z.infer<typeof trialSchema>) {
  const { success, data } = trialSchema.safeParse(unsafeData);

  const user = await getCurrentUser();
  const canCreateTrial = hasPermission(user?.role, "createTrialConfigMetadata");

  if (!success || !canCreateTrial) {
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

  const user = await getCurrentUser();
  const canUpdateTrial = hasPermission(user?.role, "updateTrialConfigMetadata");

  if (!success || !canUpdateTrial) {
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
    const user = await getCurrentUser();
    const canDeleteTrialMetadata = hasPermission(
      user?.role,
      "deleteTrialConfigMetadata"
    );
    if (!canDeleteTrialMetadata) {
      return {
        error: true,
        message: "You do not have permission to delete metadata fields.",
      };
    }
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

export async function createTrialMetadataConfig(
  unsafeData: z.infer<typeof metadataConfigSchema>
) {
  const { success, data } = metadataConfigSchema.safeParse(unsafeData);

  try {
    const user = await getCurrentUser();
    const canCreateTrialMetadata = hasPermission(
      user?.role,
      "createTrialConfigMetadata"
    );

    if (!success || !canCreateTrialMetadata) {
      return { error: true, message: "There was an error creating the trial" };
    }

    const { min, max, ...restData } = data;

    await insertTrialMetadataConfig({
      ...restData,
      min: min ? parseFloat(min) : null,
      max: max ? parseFloat(max) : null,
    });

    return { error: false, message: "Trial metadata created successfully" };
  } catch (error) {
    console.error("Error creating trial metadata config:", error);
    return { error: true, message: "Error creating trial metadata" };
  }
}

export async function updateTrialMetadataConfig(
  name: string,
  unsafeData: z.infer<typeof metadataConfigSchema>
) {
  const { success, data } = metadataConfigSchema.safeParse(unsafeData);

  try {
    const user = await getCurrentUser();
    const canUpdateTrialMetadata = hasPermission(
      user?.role,
      "updateTrialConfigMetadata"
    );

    if (!success || !canUpdateTrialMetadata) {
      return { error: true, message: "There was an error updating the trial" };
    }

    await updateTrialMetadataConfig(name, data);

    return { error: false, message: "Trial metadata updated successfully" };
  } catch (error) {
    console.error("Error updating trial metadata config:", error);
    return { error: true, message: "Error updating trial metadata" };
  }
}
