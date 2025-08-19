"use server";

import { z } from "zod";

import { db } from "@/drizzle/db";
import { getStudies as getStudiesDb } from "@/features/studies/db/study";
import { metadataConfigSchema } from "@/features/trials/schemas/trial";
import { getCurrentUser } from "@/lib/currentUser";
import { logMetadataAction } from "@/lib/log-metadata-action";
import { hasPermission } from "@/permissions/general";
import {
  deleteStudy as deleteStudyDb,
  deleteStudyMetadataConfig,
  getStudyMetadataById,
  getStudyMetadataByName,
  insertStudy,
  insertStudyMetadataConfig,
  removeJsonKeyFromAllStudies,
  updateStudyById,
  updateStudyMetadataConfig as updateStudyMetadataConfigDb,
} from "../db/study";
import { studySchema, studySchemaOptional } from "../schemas/study";

export async function getStudies() {
  const studies = await getStudiesDb();
  return studies ?? [];
}

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

export async function updateStudy(
  id: number,
  unsafeData: Partial<z.infer<typeof studySchema>>
) {
  const { success, data, error } = studySchemaOptional.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "There was an error updating the study" };
  }

  try {
    const user = await getCurrentUser();
    const canUpdateStudy = hasPermission(user?.role, "study:update");

    if (!canUpdateStudy || !user?.id) {
      return {
        error: true,
        message: "You do not have permission to update this study",
      };
    }

    await updateStudyById(id, data);

    return { error: false, message: "Study updated successfully" };
  } catch (error) {
    console.error("Error updating study:", error);
    return { error: true, message: "Error updating the study" };
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

    if (!success || !canCreateStudyMetadata || !user?.id) {
      return { error: true, message: "There was an error creating the study" };
    }

    const { min, max, ...restData } = data;

    const inserted = {
      ...restData,
      min: min ? min : null,
      max: max ? max : null,
    };

    await insertStudyMetadataConfig(inserted);

    await logMetadataAction({
      userId: user.id,
      action: "add",
      scope: "study",
      target: data.name,
      after: inserted,
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

    if (!success || !canUpdateStudyMetadata || !user?.id) {
      return { error: true, message: "There was an error updating the study" };
    }

    const oldConfig = await getStudyMetadataById(id);
    if (!oldConfig) {
      return { error: true, message: "Metadata field not found" };
    }

    const { min, max, ...restData } = data;

    const updated = {
      ...restData,
      min: min ? min : null,
      max: max ? max : null,
    };

    await updateStudyMetadataConfigDb(id, updated);

    await logMetadataAction({
      userId: user.id,
      action: "edit",
      scope: "trial",
      target: data.name,
      before: oldConfig,
      after: updated,
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
    if (!canDeleteStudyMetadata || !user?.id) {
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

    await logMetadataAction({
      userId: user.id,
      action: "delete",
      scope: "study",
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
