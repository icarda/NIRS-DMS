import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { apiClients, PasswordResetTokens, UserTable } from "@/drizzle/schema";
import { getAuthGlobalTag } from "@/features/auth/db/cache";
import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";
import { getUserGlobalTag, getUserIdTag, revalidateUserCache } from "./cache";

export async function getUserByEmail(email: string) {
  const user = await db.query.UserTable.findFirst({
    where: eq(UserTable.email, email),
    with: {
      center: true,
    },
  });
  return user;
}

export async function getUser(id: number) {
  "use cache";
  cacheTag(getUserIdTag(id));
  const user = await db.query.UserTable.findFirst({
    columns: {
      password: false,
    },
    where: eq(UserTable.id, id),
  });
  return user;
}

export async function getUsers({ limit }: { limit?: number } = {}) {
  "use cache";
  cacheTag(getUserGlobalTag());

  const users = await db.query.UserTable.findMany({
    columns: {
      password: false,
    },
    with: {
      center: true,
      studyAccesses: {
        with: {
          study: true,
        },
      },
    },
    limit,
  });
  return users;
}

export async function insertUser(data: typeof UserTable.$inferInsert) {
  const [newUser] = await db
    .insert(UserTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [UserTable.id],
      set: data,
    });

  if (newUser == null) throw new Error("Failed to create user");
  revalidateUserCache(newUser.id);

  return newUser;
}

export async function updateUser(
  { id }: { id: number },
  data: Partial<typeof UserTable.$inferInsert>
) {
  const [updatedUser] = await db
    .update(UserTable)
    .set(data)
    .where(eq(UserTable.id, id))
    .returning();

  if (updatedUser == null) throw new Error("Failed to update user");
  revalidateUserCache(updatedUser.id);

  return updatedUser;
}

export async function deleteUser({ id }: { id: number }) {
  const [deletedUser] = await db
    .delete(UserTable)
    .where(eq(UserTable.id, id))
    .returning();

  if (deletedUser == null) throw new Error("Failed to delete user");
  revalidateUserCache(deletedUser.id);

  return deletedUser;
}

export async function getPasswordResetTokenByEmail(email: string) {
  try {
    const passwordToken = await db.query.PasswordResetTokens.findFirst({
      where: eq(PasswordResetTokens.email, email),
    });
    return passwordToken;
  } catch (error) {
    return null;
  }
}
export async function getPasswordResetTokenByToken(token: string) {
  try {
    const passwordToken = await db.query.PasswordResetTokens.findFirst({
      where: eq(PasswordResetTokens.token, token),
    });
    return passwordToken;
  } catch (error) {
    return null;
  }
}

export async function getApiClients() {
  "use cache";
  cacheTag(getAuthGlobalTag());

  const clients = await db
    .select({
      id: apiClients.id,
      clientId: apiClients.clientId,
      clientType: apiClients.clientType,
      status: apiClients.status,
      scopes: apiClients.scopes,
      name: apiClients.name,
      description: apiClients.description,
      createdAt: apiClients.createdAt,
    })
    .from(apiClients);
  return clients;
}
