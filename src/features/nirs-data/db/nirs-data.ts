import { db } from "@/drizzle/db";
import { NirsDataTable } from "@/drizzle/schema";
import { revalidateNIRSDataCache } from "./cache";

export async function insertNirsDataBatch(
  data: (typeof NirsDataTable.$inferInsert)[],
  trx: Omit<typeof db, "$client"> = db
) {
  if (!data || data.length === 0) {
    return;
  }

  await trx.insert(NirsDataTable).values(data).onConflictDoNothing();

  if (data.length > 0) revalidateNIRSDataCache(data[0].studyId);
}
