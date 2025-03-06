import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { TraitTable } from "@/drizzle/schema";
import { getCropTraitTag, revalidateTraitCache } from "./cache/trait";

export async function getTraits({ cropId }: { cropId: number }) {
  "use cache";
  cacheTag(getCropTraitTag(cropId));
  const traits = await db.query.TraitTable.findMany({
    where: eq(TraitTable.cropId, cropId),
  });
  return traits;
}

export async function insertTrait(data: typeof TraitTable.$inferInsert) {
  const [newTrait] = await db
    .insert(TraitTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [TraitTable.id],
      set: data,
    });

  if (newTrait == null) throw new Error("Failed to create trait");
  revalidateTraitCache(newTrait.cropId);

  return newTrait;
}

export async function deleteTrait({ id }: { id: number }) {
  const [deletedTrait] = await db
    .delete(TraitTable)
    .where(eq(TraitTable.id, id))
    .returning();

  if (deletedTrait == null) throw new Error("Failed to delete trait");
  revalidateTraitCache(deletedTrait.cropId);

  return deletedTrait;
}
