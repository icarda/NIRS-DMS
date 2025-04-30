import AddCropForm from "@/components/add-crop-form";
import ClientCropList from "@/components/client-crop-list";
import { getCrops } from "@/features/crops/db/crop";

const itemsPerPage = 6;

export default async function Page() {
  const crops = await getCrops();
  console.log("Crops: ", crops);
  const totalPages = Math.ceil(crops.length / itemsPerPage);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end">
        <AddCropForm />
      </div>
      <ClientCropList
        crops={crops}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
      />
    </div>
  );
}
