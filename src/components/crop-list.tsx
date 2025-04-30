import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCrops } from "@/features/crops/db/crop";

type Crops = Awaited<ReturnType<typeof getCrops>>;

interface CropListProps {
  crops: Crops;
}

export default function CropList({ crops }: CropListProps) {
  console.log("Crops: ", crops);
  return (
    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {crops.map((crop) => (
        <Link
          key={crop.id}
          href={`/crop-ontology/${crop.id}`}
          className="group"
        >
          <Card
            key={crop.id}
            className="flex flex-col overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[16/9]">
              <Image
                src={crop.cropImageUrl || "/placeholder.svg"}
                alt={crop.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="flex flex-grow flex-col">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-lg font-semibold">
                  {crop.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-3 pt-2">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {crop.description}
                </p>
              </CardContent>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
