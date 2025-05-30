import { redirect } from "next/navigation";

import CropPageClient from "@/components/crop-page-client";
import { getCrop } from "@/features/crops/db/crop";
import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";

interface CropPageServerProps {
  params: Promise<{ id: string }>;
}

export default async function CropPageServer({ params }: CropPageServerProps) {
  const { id: cropId } = await params;
  const crop = await getCrop(parseInt(cropId, 10));
  const user = await getCurrentUser();
  const canCreateCropTrait = hasPermission(user?.role, "cropTrait:create");

  if (!crop) {
    redirect("/crop-ontology");
  }

  return <CropPageClient crop={crop} permission={canCreateCropTrait} />;
}
