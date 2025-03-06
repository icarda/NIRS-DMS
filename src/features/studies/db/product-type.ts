import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { ProductTypeTable } from "@/drizzle/schema";
import { getCropProductTypesTag } from "./cache/product-type";

export async function getProductTypes(cropId: number) {
  "use cache";
  cacheTag(getCropProductTypesTag(cropId));
  return db.query.ProductTypeTable.findMany({
    where: eq(ProductTypeTable.cropId, cropId),
    with: {
      crop: true,
    },
    orderBy: (productTypes, { asc }) => [asc(productTypes.name)],
  });
}
