import { db } from "@/drizzle/db";
import { OtherIdsTable } from "@/drizzle/schema";

type OtherIdInsertData = typeof OtherIdsTable.$inferInsert;

export async function insertOtherIdsBatch(
  data: OtherIdInsertData[],
  trx: Omit<typeof db, "$client"> = db
) {
  if (!data || data.length === 0) {
    return;
  }

  await trx.insert(OtherIdsTable).values(data);
}
