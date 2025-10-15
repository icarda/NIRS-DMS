import { db } from "@/drizzle/db";
import { OtherIdsTable } from "@/drizzle/schema";

type OtherIdInsertData = typeof OtherIdsTable.$inferInsert;

export async function insertOtherIdsBatch(
  data: OtherIdInsertData[],
  trx: Omit<typeof db, "$client"> = db,
  batchSize = 5
) {
  if (!data?.length) return;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await trx.insert(OtherIdsTable).values(batch);
  }
}