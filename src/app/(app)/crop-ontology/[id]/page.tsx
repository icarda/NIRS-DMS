import { redirect } from "next/navigation";

import CropPageClient from "@/components/crop-page-client";
import PageWrapper from "@/components/page-wrapper";
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
  const canCreateCropCommonName = hasPermission(
    user?.role,
    "commonName:create"
  );
  const canEditCropCommonName = hasPermission(user?.role, "commonName:update");
  const canDeleteCropCommonName = hasPermission(
    user?.role,
    "commonName:delete"
  );

  const crop = await getCrop(parseInt(cropId, 10));
  const units = (
    await db.selectDistinct({ unit: CropTraitTable.unit }).from(CropTraitTable)
  ).map((item) => item.unit);

  if (!crop) {
    redirect("/crop-ontology");
  }

  return (
    <PageWrapper title="Crop Ontology">
      <CropPageClient
        crop={crop}
        units={units}
        permissions={{
          canCreateCropTrait,
          canCreateCropCommonName,
          canDeleteCropCommonName,
          canEditCropCommonName,
        }}
      />
    </PageWrapper>
  );
}
