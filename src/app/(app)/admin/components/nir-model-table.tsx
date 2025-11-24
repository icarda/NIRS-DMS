"use client";

import { useMemo } from "react";

import { DataTable } from "@/components/ui/data-table";
import { NIRModel, getNirModelColumns } from "../columns";
import { NirModelAddDialog } from "./nir-model-add-dialog";

type NirModelTableProps = {
  data: NIRModel[];
  canUpdate: boolean;
  canDelete: boolean;
};

export function NirModelTable({
  data,
  canUpdate,
  canDelete,
}: NirModelTableProps) {
  const columns = useMemo(
    () =>
      getNirModelColumns({
        canUpdate,
        canDelete,
      }),
    [canUpdate, canDelete]
  );

  return (
    <DataTable columns={columns} data={data} filterColumn="name">
      <NirModelAddDialog />
    </DataTable>
  );
}

