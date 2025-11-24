import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

import { db } from "@/drizzle/db";
import { ProductTypeTable } from "@/drizzle/schema";
import { revalidateCropCache } from "@/features/crops/db/cache/crop";
import {
  getCropProductTypesTag,
  revalidateProductTypeCache,
} from "./cache/product-type";

export async function getProductTypes(cropId?: number) {
  "use cache";

  if (cropId == null) {
    cacheTag(getCropProductTypesTag());
    return db.query.ProductTypeTable.findMany({
      with: {
        crop: true,
      },
      orderBy: (productTypes, { asc }) => [asc(productTypes.name)],
    });
  }
  cacheTag(getCropProductTypesTag(cropId));
  return db.query.ProductTypeTable.findMany({
    where: eq(ProductTypeTable.cropId, cropId),
    with: {
      crop: true,
    },
    orderBy: (productTypes, { asc }) => [asc(productTypes.name)],
  });
}

export async function insertProductType(
  data: typeof ProductTypeTable.$inferInsert
) {
  const [newProductType] = await db
    .insert(ProductTypeTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [ProductTypeTable.id],
      set: data,
    });

  if (newProductType == null) throw new Error("Failed to create Product Type");
  revalidateProductTypeCache(newProductType.id);
  revalidateCropCache(newProductType.cropId);

  return newProductType;
}

export async function deleteProductType({ id }: { id: number }) {
  const [deletedProductType] = await db
    .delete(ProductTypeTable)
    .where(eq(ProductTypeTable.id, id))
    .returning();

  if (deletedProductType == null) throw new Error("Failed to delete study");
  revalidateProductTypeCache(deletedProductType.id);

  return deletedProductType;
}

export async function updateProductType(
  id: number,
  data: Partial<typeof ProductTypeTable.$inferInsert>
) {
  const [updatedProductType] = await db
    .update(ProductTypeTable)
    .set(data)
    .where(eq(ProductTypeTable.id, id))
    .returning();

  if (updatedProductType == null) {
    throw new Error("Failed to update Product Type");
  }

  revalidateProductTypeCache(updatedProductType.id);
  revalidateCropCache(updatedProductType.cropId);

  return updatedProductType;
}