import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { TraitTable } from "@/drizzle/schema";
import { getTraitTag, revalidateTraitCache } from "./cache/trait";

export async function getTraits({ cropTraitId }: { cropTraitId: number }) {
  "use cache";
  cacheTag(getTraitTag(cropTraitId));
  const traits = await db.query.TraitTable.findMany({
    where: eq(TraitTable.cropTraitId, cropTraitId),
  });
  return traits;
}

export async function insertTraitBatch(
  data: (typeof TraitTable.$inferInsert)[],
  trx: Omit<typeof db, "$client"> = db
) {
  if (!data || data.length === 0) {
    return;
  }

  await trx.insert(TraitTable).values(data);

  if (data.length > 0) revalidateTraitCache(data[0].cropTraitId);
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
  revalidateTraitCache(newTrait.cropTraitId);

  return newTrait;
}

export async function deleteTrait({ id }: { id: number }) {
  const [deletedTrait] = await db
    .delete(TraitTable)
    .where(eq(TraitTable.id, id))
    .returning();

  if (deletedTrait == null) throw new Error("Failed to delete trait");
  revalidateTraitCache(deletedTrait.cropTraitId);

  return deletedTrait;
}
