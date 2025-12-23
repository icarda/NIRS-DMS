import { eq, inArray } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import {
  CenterTable,
  NirModelTable,
  QualityLabTable,
  StudyTable,
} from "@/drizzle/schema";
import {
  getNirModelGlobalTag,
  getNirModelIdTag,
  revalidateNirModelCache,
} from "./cache";

export async function getNirModelById({ id }: { id: number }) {
  "use cache";
  cacheTag(getNirModelIdTag(id));
  const nirModel = await db.query.NirModelTable.findFirst({
    where: eq(NirModelTable.id, id),
  });
  return nirModel;
}

export async function getNirModels({ limit }: { limit?: number } = {}) {
  "use cache";
  cacheTag(getNirModelGlobalTag());
  const nirModels = await db.query.NirModelTable.findMany({
    limit,
  });
  return nirModels;
}

export async function getNirModelsByCenter(centerName: string) {
  "use cache";
  cacheTag(getNirModelGlobalTag());
  
  // Subquery: find all nirModelIds from studies in the center's quality labs
  const nirModelIdsQuery = db
    .selectDistinct({ nirModelId: StudyTable.nirModelId })
    .from(StudyTable)
    .innerJoin(QualityLabTable, eq(StudyTable.qualityLabId, QualityLabTable.id))
    .innerJoin(CenterTable, eq(QualityLabTable.centerId, CenterTable.id))
    .where(eq(CenterTable.acronym, centerName));

  const nirModelIds = await nirModelIdsQuery;
  
  if (nirModelIds.length === 0) {
    return [];
  }

  // Then query NIR models
  const nirModels = await db.query.NirModelTable.findMany({
    where: inArray(
      NirModelTable.id,
      nirModelIds.map((m) => m.nirModelId)
    ),
  });
  
  return nirModels;
}

export async function insertNirModel(data: typeof NirModelTable.$inferInsert) {
  const [newNirModel] = await db
    .insert(NirModelTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [NirModelTable.id],
      set: data,
    });

  if (newNirModel == null) throw new Error("Failed to create NIR model");
  revalidateNirModelCache(newNirModel.id);

  return newNirModel;
}

export async function deleteNirModel({ id }: { id: number }) {
  const [deletedNirModel] = await db
    .delete(NirModelTable)
    .where(eq(NirModelTable.id, id))
    .returning();

  if (deletedNirModel == null) throw new Error("Failed to delete NIR model");
  revalidateNirModelCache(deletedNirModel.id);

  return deletedNirModel;
}

export async function updateNirModel(
  id: number,
  data: Partial<typeof NirModelTable.$inferInsert>
) {
  const [updatedNirModel] = await db
    .update(NirModelTable)
    .set(data)
    .where(eq(NirModelTable.id, id))
    .returning();

  if (updatedNirModel == null) {
    throw new Error("Failed to update NIR model");
  }

  revalidateNirModelCache(updatedNirModel.id);
  return updatedNirModel;
}