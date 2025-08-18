import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import {
  NirsDataTable,
  SpeciesTable,
  TrialSpeciesTable,
} from "@/drizzle/schema";
import { getSpeciesIdTag, revalidateSpeciesCache } from "./cache/species";

export async function getSpeciesById(id: number) {
  "use cache";
  cacheTag(getSpeciesIdTag(id));
  const species = await db.query.SpeciesTable.findFirst({
    where: (species) => eq(species.id, id),
    columns: {
      id: true,
      name: true,
    },
  });
  return species;
}

export async function getTrialSpecies(trialId: number, speciesId: number) {
  "use cache";
  cacheTag(getSpeciesIdTag(speciesId));
  const trialSpecies = await db.query.TrialSpeciesTable.findFirst({
    where: (trialSpecies) =>
      and(
        eq(trialSpecies.trialId, trialId),
        eq(trialSpecies.speciesId, speciesId)
      ),
    columns: {
      trialId: true,
      speciesId: true,
    },
  });
  return trialSpecies;
}

export async function insertSpecies(
  data: typeof SpeciesTable.$inferInsert,
  trx: Omit<typeof db, "$client"> = db
) {
  const [newSpecies] = await trx.insert(SpeciesTable).values(data).returning();

  if (newSpecies == null) throw new Error("Failed to create species");
  revalidateSpeciesCache(newSpecies.id, { cropId: newSpecies.cropId });

  return newSpecies;
}

export async function updateSpecies(
  id: number,
  name: string,
  trx: Omit<typeof db, "$client"> = db
) {
  const [updatedSpecies] = await trx
    .update(SpeciesTable)
    .set({ name })
    .where(eq(SpeciesTable.id, id))
    .returning();

  if (updatedSpecies == null) throw new Error("Failed to update species");
  revalidateSpeciesCache(updatedSpecies.id, { cropId: updatedSpecies.cropId });

  return updatedSpecies;
}

export async function deleteSpecies(
  id: number,
  trx: Omit<typeof db, "$client"> = db
) {
  const [deletedSpecies] = await trx
    .delete(SpeciesTable)
    .where(eq(SpeciesTable.id, id))
    .returning();

  if (!deletedSpecies) throw new Error("Failed to delete species");
  revalidateSpeciesCache(deletedSpecies.id, { cropId: deletedSpecies.cropId });

  return deletedSpecies;
}

export async function insertTrialSpecies(
  data: typeof TrialSpeciesTable.$inferInsert,
  trx: Omit<typeof db, "$client"> = db
) {
  const [newTrialSpecies] = await trx
    .insert(TrialSpeciesTable)
    .values(data)
    .returning();

  if (newTrialSpecies == null)
    throw new Error("Failed to create trial species");
  revalidateSpeciesCache(newTrialSpecies.speciesId, { trialId: data.trialId });

  return newTrialSpecies;
}

export async function getSpeciesForSample(sampleId: number) {
  "use cache";
  cacheTag(getSpeciesIdTag(sampleId));
  const species = await db
    .selectDistinct({
      species: SpeciesTable.name,
    })
    .from(NirsDataTable)
    .innerJoin(SpeciesTable, eq(NirsDataTable.speciesId, SpeciesTable.id))
    .where(eq(NirsDataTable.sampleId, sampleId))
    .limit(1);

  return species[0];
}
