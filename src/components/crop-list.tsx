import { getCrops } from "@/features/crops/db/crop";
import { CropCard } from "./crop-card";

export type Crops = Awaited<ReturnType<typeof getCrops>>;

interface CropListProps {
  crops: Crops;
  canUpdateCrop: boolean;
  canDeleteCrop: boolean;
}
export default function CropList({
  crops,
  canUpdateCrop,
  canDeleteCrop,
}: CropListProps) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {crops.map((crop) => (
        <CropCard
          key={crop.id}
          crop={crop}
          canUpdateCrop={canUpdateCrop}
          canDeleteCrop={canDeleteCrop}
        />
      ))}
    </div>
  );
}
