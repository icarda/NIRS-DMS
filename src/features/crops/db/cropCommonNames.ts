import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { CropTable } from "@/drizzle/schema";
import { getCropCommonNamesCropTag } from "./cache/cropCommonNames";

export async function getCropCommonNames(cropId: number) {
  "use cache";
  cacheTag(getCropCommonNamesCropTag(cropId));
  const cropCommonNames = await db.query.CropTable.findFirst({
    where: eq(CropTable.id, cropId),
  });
  return cropCommonNames;
}
