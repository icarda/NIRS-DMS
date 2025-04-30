import { use } from "react";

import { notFound } from "next/navigation";

import CropPageClient from "@/components/crop-page-client";
import { getCrop } from "@/features/crops/db/crop";

interface CropPageServerProps {
  params: Promise<{ id: string }>;
}

export default async function CropPageServer({ params }: CropPageServerProps) {
  const { id: cropId } = await params;
  const crop = await getCrop(parseInt(cropId, 10));

  if (!crop) {
    notFound();
  }

  return <CropPageClient crop={crop} />;
}
