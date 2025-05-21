"use server";

import { z } from "zod";

import { db } from "@/drizzle/db";
import { metadataConfigSchema } from "@/features/trials/schemas/trial";
import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";
import {
  deleteStudy as deleteStudyDb,
  deleteStudyMetadataConfig,
  getStudyMetadataByName,
  insertStudy,
  insertStudyMetadataConfig,
  removeJsonKeyFromAllStudies,
  updateStudyMetadataConfig as updateStudyMetadataConfigDb,
} from "../db/study";
import { studySchema } from "../schemas/study";

export async function createStudy(unsafeData: z.infer<typeof studySchema>) {
  const { success, data } = studySchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error creating the study" };
  }

  try {
    await insertStudy(data);
  } catch (error) {
    return { error: true, message: "There was an error creating the study" };
  }
}

export async function deleteStudy(id: number) {
  try {
    await deleteStudyDb({ id });
    return { error: false, message: "Successfully deleted the study" };
  } catch (error) {
    return { error: true, message: "Error deleting the study" };
  }
}

export async function createStudyMetadataConfig(
  unsafeData: z.infer<typeof metadataConfigSchema>
) {
  const { success, data } = metadataConfigSchema.safeParse(unsafeData);

  try {
    const user = await getCurrentUser();
    const canCreateStudyMetadata = hasPermission(
      user?.role,
      "studyMetadata:create"
    );

    if (!success || !canCreateStudyMetadata) {
      return { error: true, message: "There was an error creating the study" };
    }

    const { min, max, ...restData } = data;

    await insertStudyMetadataConfig({
      ...restData,
      min: min ? parseFloat(min) : null,
      max: max ? parseFloat(max) : null,
    });

    return { error: false, message: "Study metadata created successfully" };
  } catch (error) {
    console.error("Error creating Study metadata config:", error);
    return { error: true, message: "Error creating Study metadata" };
  }
}

export async function updateStudyMetadataConfig(
  id: number,
  unsafeData: z.infer<typeof metadataConfigSchema>
) {
  const { success, data } = metadataConfigSchema.safeParse(unsafeData);

  try {
    const user = await getCurrentUser();
    const canUpdateStudyMetadata = hasPermission(
      user?.role,
      "studyMetadata:update"
    );

    if (!success || !canUpdateStudyMetadata) {
      return { error: true, message: "There was an error updating the study" };
    }

    const { min, max, ...restData } = data;

    await updateStudyMetadataConfigDb(id, {
      ...restData,
      min: min ? parseFloat(min) : null,
      max: max ? parseFloat(max) : null,
    });

    return { error: false, message: "Study metadata updated successfully" };
  } catch (error) {
    console.error("Error updating study metadata config:", error);
    return { error: true, message: "Error updating study metadata" };
  }
}

export async function deleteStudyMetadata(name: string) {
  try {
    const user = await getCurrentUser();
    const canDeleteStudyMetadata = hasPermission(
      user?.role,
      "studyMetadata:delete"
    );
    if (!canDeleteStudyMetadata) {
      return {
        error: true,
        message: "You do not have permission to delete metadata fields.",
      };
    }
    const config = await getStudyMetadataByName(name);

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
      await deleteStudyMetadataConfig(name, tx);
      await removeJsonKeyFromAllStudies(name, tx);
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
