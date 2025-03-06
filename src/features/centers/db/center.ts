import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { CenterTable } from "@/drizzle/schema";
import {
  getCenterGlobalTag,
  getCenterIdTag,
  revalidateCenterCache,
} from "./cache";

export async function getCenter(id: number) {
  "use cache";
  cacheTag(getCenterIdTag(id));
  const center = await db.query.CenterTable.findFirst({
    where: eq(CenterTable.id, id),
    with: {
      qualityLabs: true,
    },
  });
  return center;
}

export async function getCenters({ limit }: { limit?: number } = {}) {
  "use cache";
  cacheTag(getCenterGlobalTag());
  const centers = await db.query.CenterTable.findMany({
    limit,
    with: {
      qualityLabs: true,
    },
  });
  return centers;
}

export async function insertCenter(data: typeof CenterTable.$inferInsert) {
  const [newCenter] = await db
    .insert(CenterTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [CenterTable.id],
      set: data,
    });

  if (newCenter == null) throw new Error("Failed to create center");
  revalidateCenterCache(newCenter.id);

  return newCenter;
}

export async function updateCenter(
  { id }: { id: number },
  data: Partial<typeof CenterTable.$inferInsert>
) {
  const [updatedCenter] = await db
    .update(CenterTable)
    .set(data)
    .where(eq(CenterTable.id, id))
    .returning();

  if (updatedCenter == null) throw new Error("Failed to update center");
  revalidateCenterCache(updatedCenter.id);

  return updatedCenter;
}

export async function deleteCenter({ id }: { id: number }) {
  const [deletedCenter] = await db
    .delete(CenterTable)
    .where(eq(CenterTable.id, id))
    .returning();

  if (deletedCenter == null) throw new Error("Failed to delete center");
  revalidateCenterCache(deletedCenter.id);

  return deletedCenter;
}
