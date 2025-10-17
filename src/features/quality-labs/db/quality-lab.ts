import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { CenterTable, QualityLabTable } from "@/drizzle/schema";
import { createdAt } from "@/drizzle/schemaHelpers";
import {
  getQualityLabGlobalTag,
  getQualityLabIdTag,
  getQualityLabsByCenterTag,
  revalidateQualityLabCache,
} from "./cache";

export async function getQualityLabs({
  limit,
  center,
}: { limit?: number; center?: string } = {}) {
  if (center) {
    const qualityLabsByCenter = await db
      .select({
        id: QualityLabTable.id,
        name: QualityLabTable.name,
        location: QualityLabTable.location,
        country: QualityLabTable.country,
        centerId: QualityLabTable.centerId,
        createdAt: QualityLabTable.createdAt,
        updatedAt: QualityLabTable.updatedAt,
      })
      .from(QualityLabTable)
      .innerJoin(CenterTable, eq(QualityLabTable.centerId, CenterTable.id))
      .where(eq(CenterTable.acronym, center));
    return qualityLabsByCenter;
  }

  const qualityLabs = await db.query.QualityLabTable.findMany({
    limit,
  });

  return qualityLabs;
}

export async function getQualityLab(id: number) {
  "use cache";
  cacheTag(getQualityLabIdTag(id));
  const qualityLab = await db.query.QualityLabTable.findFirst({
    where: eq(QualityLabTable.id, id),
  });
  return qualityLab;
}

export async function getQualityLabsByCenter({
  limit,
  center,
}: {
  limit?: number;
  center: string;
}) {
  "use cache";
  cacheTag(getQualityLabsByCenterTag(center));
  const qualityLabs = await db
    .select({
      id: QualityLabTable.id,
      name: QualityLabTable.name,
      location: QualityLabTable.location,
      country: QualityLabTable.country,
    })
    .from(QualityLabTable)
    .innerJoin(CenterTable, eq(QualityLabTable.centerId, CenterTable.id))
    .where(eq(CenterTable.acronym, center));

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
