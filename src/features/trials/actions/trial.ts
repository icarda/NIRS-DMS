"use server";

import { z } from "zod";

import { trialEditSchema } from "@/app/(app)/explore/table/schema";
import { db } from "@/drizzle/db";
import { getCurrentUser } from "@/lib/currentUser";
import { logMetadataAction } from "@/lib/log-metadata-action";
import { hasPermission } from "@/permissions/general";
import {
  deleteTrial as deleteTrialDb,
  deleteTrialMetadataConfig,
  getTrialMetadataById,
  getTrialMetadataByName,
  insertTrial,
  insertTrialMetadataConfig,
  removeJsonKeyFromAllTrials,
  updateTrial as updateTrialDb,
  updateTrialMetadataConfig as updateTrialMetadataConfigDb,
} from "../db/trial";
import { metadataConfigSchema, trialSchema } from "../schemas/trial";

export async function createTrial(unsafeData: z.infer<typeof trialSchema>) {
  const { success, data } = trialSchema.safeParse(unsafeData);

  const user = await getCurrentUser();
  const canCreateTrial = hasPermission(user?.role, "trial:create");

  if (!success || !canCreateTrial) {
    return { error: true, message: "There was an error creating the trial" };
  }

  const { fertilizers, ...trialData } = data;
  await insertTrial(trialData, fertilizers);
}

export async function updateTrial(
  id: number,
  unsafeData: Partial<z.infer<typeof trialEditSchema>>
) {
  const { success, data, error } = trialEditSchema.safeParse(unsafeData);

  const user = await getCurrentUser();
  const canUpdateTrial = hasPermission(user?.role, "trial:update");

  console.log(success, canUpdateTrial, data, error);

  if (!success || !canUpdateTrial) {
    return { error: true, message: "There was an error updating the trial" };
  }

  const { fertilizers, latitude, longitude, ...restTrialData } = data;

  const trialData = {
    ...restTrialData,
    latitude: latitude ? parseFloat(latitude) : undefined,
    longitude: longitude ? parseFloat(longitude) : undefined,
  };

  await updateTrialDb({ id }, trialData, fertilizers);

  return { error: false, message: "Trial updated successfully" };
}

export async function deleteTrial(id: number) {
  try {
    const user = await getCurrentUser();
    const canDeleteTrial = hasPermission(user?.role, "trial:delete");

    if (!canDeleteTrial) {
      return { error: true, message: "There was an error updating the trial" };
    }
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
      "trialMetadata:delete"
    );
    if (!canDeleteTrialMetadata || !user?.id) {
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

    await logMetadataAction({
      userId: user.id,
      action: "delete",
      scope: "trial",
      target: name,
      before: config,
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
      "trialMetadata:create"
    );

    if (!success || !canCreateTrialMetadata || !user?.id) {
      return { error: true, message: "There was an error creating the trial" };
    }

    const { min, max, ...restData } = data;

    const inserted = {
      ...restData,
      min: min ? min : null,
      max: max ? max : null,
    };

    await insertTrialMetadataConfig(inserted);

    await logMetadataAction({
      userId: user.id,
      action: "add",
      scope: "trial",
      target: data.name,
      after: inserted,
    });

    return { error: false, message: "Trial metadata created successfully" };
  } catch (error) {
    console.error("Error creating trial metadata config:", error);
    return { error: true, message: "Error creating trial metadata" };
  }
}

export async function updateTrialMetadataConfig(
  id: number,
  unsafeData: z.infer<typeof metadataConfigSchema>
) {
  const { success, data } = metadataConfigSchema.safeParse(unsafeData);

  try {
    const user = await getCurrentUser();
    const canUpdateTrialMetadata = hasPermission(
      user?.role,
      "trialMetadata:update"
    );

    if (!success || !canUpdateTrialMetadata || !user?.id) {
      return { error: true, message: "There was an error updating the trial" };
    }

    const oldConfig = await getTrialMetadataById(id);
    if (!oldConfig) {
      return { error: true, message: "Metadata field not found" };
    }

    const { min, max, ...restData } = data;

    const updated = {
      ...restData,
      min: min ? min : null,
      max: max ? max : null,
    };

    await updateTrialMetadataConfigDb(id, updated);

    await logMetadataAction({
      userId: user.id,
      action: "edit",
      scope: "trial",
      target: data.name,
      before: oldConfig,
      after: updated,
    });

    return { error: false, message: "Trial metadata updated successfully" };
  } catch (error) {
    console.error("Error updating trial metadata config:", error);
    return { error: true, message: "Error updating trial metadata" };
  }
}
