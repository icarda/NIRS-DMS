import { redirect } from "next/navigation";

import CropPageClient from "@/components/crop-page-client";
import { db } from "@/drizzle/db";
import { CropTraitTable } from "@/drizzle/schema";
import { getCrop } from "@/features/crops/db/crop";
import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";

interface CropPageServerProps {
  params: Promise<{ id: string }>;
}

export default async function CropPageServer({ params }: CropPageServerProps) {
  const { id: cropId } = await params;

  const user = await getCurrentUser();
  const canCreateCropTrait = hasPermission(user?.role, "cropTrait:create");

  const crop = await getCrop(parseInt(cropId, 10));
  const units = (
    await db.selectDistinct({ unit: CropTraitTable.unit }).from(CropTraitTable)
  ).map((item) => item.unit);

  if (!crop) {
    redirect("/crop-ontology");
  }

  return (
    <CropPageClient crop={crop} units={units} permission={canCreateCropTrait} />
  );
}
