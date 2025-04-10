import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { SpeciesTable } from "@/drizzle/schema";
import { getSpeciesIdTag, revalidateSpeciesCache } from "./cache/species";

export async function getSpeciesById(id: number) {
  "use cache";
  cacheTag(getSpeciesIdTag(id));
  const species = await db.query.SpeciesTable.findFirst({
    where: (species) => eq(species.id, id),
    columns: {
      id: true,
      name: true,
      trialId: true,
    },
  });
  return species;
}

export async function insertSpecies(
  data: typeof SpeciesTable.$inferInsert,
  trx: Omit<typeof db, "$client"> = db
) {
  const [newSpecies] = await trx.insert(SpeciesTable).values(data).returning();

  if (newSpecies == null) throw new Error("Failed to create species");
  revalidateSpeciesCache(newSpecies.id, data.trialId);

  return newSpecies;
}
