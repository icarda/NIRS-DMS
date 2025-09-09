import { eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { apiClients } from "@/drizzle/schema";
import { revalidateAuthCache } from "./cache";

export async function createApiClient(data: typeof apiClients.$inferInsert) {
  const newApiClient = await db.insert(apiClients).values(data).returning();

  if (newApiClient.length > 0) {
    revalidateAuthCache(newApiClient[0].id);
  }

  return newApiClient[0];
}

export async function deleteApiClient(name: string) {
  const deletedClient = await db
    .delete(apiClients)
    .where(eq(apiClients.name, name))
    .returning();
  if (deletedClient.length > 0) {
    revalidateAuthCache(deletedClient[0].id);
  }
  return deletedClient[0];
}
