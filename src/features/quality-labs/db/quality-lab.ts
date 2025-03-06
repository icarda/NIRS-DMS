import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { QualityLabTable } from "@/drizzle/schema";
import {
  getQualityLabGlobalTag,
  getQualityLabIdTag,
  revalidateQualityLabCache,
} from "./cache";

export async function getQualityLab(id: number) {
  "use cache";
  cacheTag(getQualityLabIdTag(id));
  const qualityLab = await db.query.QualityLabTable.findFirst({
    where: eq(QualityLabTable.id, id),
  });
  return qualityLab;
}

export async function getQualityLabs({ limit }: { limit?: number } = {}) {
  "use cache";
  cacheTag(getQualityLabGlobalTag());
  const qualityLabs = await db.query.QualityLabTable.findMany({
    limit,
  });
  return qualityLabs;
}

export async function insertQualityLab(
  data: typeof QualityLabTable.$inferInsert
) {
  const [newQualityLab] = await db
    .insert(QualityLabTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [QualityLabTable.id],
      set: data,
    });

  if (newQualityLab == null) throw new Error("Failed to create quality lab");
  revalidateQualityLabCache(newQualityLab.id);

  return newQualityLab;
}

export async function updateQualityLab(
  { id }: { id: number },
  data: Partial<typeof QualityLabTable.$inferInsert>
) {
  const [updatedQualityLab] = await db
    .update(QualityLabTable)
    .set(data)
    .where(eq(QualityLabTable.id, id))
    .returning();

  if (updatedQualityLab == null)
    throw new Error("Failed to update quality lab");
  revalidateQualityLabCache(updatedQualityLab.id);

  return updatedQualityLab;
}

export async function deleteQualityLab({ id }: { id: number }) {
  const [deletedQualityLab] = await db
    .delete(QualityLabTable)
    .where(eq(QualityLabTable.id, id))
    .returning();

  if (deletedQualityLab == null)
    throw new Error("Failed to delete quality lab");
  revalidateQualityLabCache(deletedQualityLab.id);

  return deletedQualityLab;
}
