"use client";

import { useMemo } from "react";

import { DataTable } from "@/components/ui/data-table";
import { getCrops } from "@/features/crops/db/crop";
import { ProductType, getProductTypeColumns } from "../columns";
import { ProductTypeAddDialog } from "./product-type-add-dialog";

type ProductTypeTableProps = {
  data: ProductType[];
  crops: Awaited<ReturnType<typeof getCrops>>;
  canUpdate: boolean;
  canDelete: boolean;
};

export function ProductTypeTable({
  data,
  crops,
  canUpdate,
  canDelete,
}: ProductTypeTableProps) {
  const columns = useMemo(
    () =>
      getProductTypeColumns({
        crops,
        canUpdate,
        canDelete,
      }),
    [crops, canUpdate, canDelete]
  );

  return (
    <DataTable columns={columns} data={data} filterColumn="type" selectCrop>
      <ProductTypeAddDialog crops={crops} />
    </DataTable>
  );
}

