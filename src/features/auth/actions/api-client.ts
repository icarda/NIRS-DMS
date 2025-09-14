"use server";

import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { ClientStatus, ClientType } from "@/drizzle/schema";
import {
  createApiClient as createApiClientDb,
  deleteApiClient as deleteApiClientDb,
} from "@/features/auth/db/auth";
import { apiClientSchema } from "@/features/auth/schemas/api-client";
import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";

export async function createApiClient(data: z.infer<typeof apiClientSchema>) {
  const user = await getCurrentUser();
  const canDeleteStudyMetadata = hasPermission(user?.role, "apiClient:create");
  if (!canDeleteStudyMetadata || !user?.id) {
    return {
      error: true,
      message: "You do not have permission to create an API client.",
    };
  }

  const validatedFields = apiClientSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: true, message: "Invalid input!" };
  }

  const { name, type, scopes, description } = validatedFields.data;

  const clientId = randomUUID();
  let clientSecret: string | null = null;
  let dbClientSecretHash: string | null = null;

  if (type === "confidential") {
    clientSecret = randomUUID();
    dbClientSecretHash = await bcrypt.hash(clientSecret, 10);
  }

  try {
    const apiClient = await createApiClientDb({
      clientId,
      clientSecretHash: dbClientSecretHash,
      clientType: type as ClientType,
      status: "active" as ClientStatus,
      scopes,
      name,
      description: description || null,
    });

    const { clientSecretHash, ...client } = apiClient;

    return {
      ...client,
      clientSecret,
    };
  } catch (err: any) {
    if (err.code === "23505") {
      return {
        error: true,
        message: "Client name already exists",
      };
    }

    return {
      error: true,
      message: "Server error",
    };
  }
}

export async function deleteApiClient(name: string) {
  const user = await getCurrentUser();
  const canDeleteStudyMetadata = hasPermission(user?.role, "apiClient:delete");
  if (!canDeleteStudyMetadata || !user?.id) {
    return {
      error: true,
      message: "You do not have permission to delete an API client.",
    };
  }

  if (!name || name.trim() === "") {
    return { error: true, message: "Invalid client name." };
  }

  try {
    const deletedClient = await deleteApiClientDb(name);

    if (!deletedClient) {
      return { error: true, message: "API client not found." };
    }

    return { error: false, message: "API client deleted successfully." };
  } catch (err) {
    return {
      error: true,
      message: "Server error",
    };
  }
}
