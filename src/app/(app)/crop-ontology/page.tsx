import AddCropForm from "@/components/add-crop-form";
import ClientCropList from "@/components/client-crop-list";
import { getCrops } from "@/features/crops/db/crop";
import { getCurrentUser } from "@/lib/currentUser";
import { hasPermission } from "@/permissions/general";

const itemsPerPage = 6;

export default async function Page() {
  const crops = await getCrops();
  const user = await getCurrentUser();

  const totalPages = Math.ceil(crops.length / itemsPerPage);

  return (
    <div className="flex flex-col gap-2">
      {hasPermission(user?.role, "createCrop") && (
        <div className="flex items-center justify-end">
          <AddCropForm />
        </div>
      )}
      <ClientCropList
        crops={crops}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
      />
    </div>
  );
}
