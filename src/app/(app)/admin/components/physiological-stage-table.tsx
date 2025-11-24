"use client";

import { useMemo } from "react";

import { DataTable } from "@/components/ui/data-table";
import { getCrops } from "@/features/crops/db/crop";
import {
  PhysiologicalStage,
  getPhysiologicalStageColumns,
} from "../columns";
import { PhysiologicalStageAddDialog } from "./physiological-stage-add-dialog";

type PhysiologicalStageTableProps = {
  data: PhysiologicalStage[];
  crops: Awaited<ReturnType<typeof getCrops>>;
  canUpdate: boolean;
  canDelete: boolean;
};

export function PhysiologicalStageTable({
  data,
  crops,
  canUpdate,
  canDelete,
}: PhysiologicalStageTableProps) {
  const columns = useMemo(
    () =>
      getPhysiologicalStageColumns({
        crops,
        canUpdate,
        canDelete,
      }),
    [crops, canUpdate, canDelete]
  );

  return (
    <DataTable columns={columns} data={data} filterColumn="stage" selectCrop>
      <PhysiologicalStageAddDialog crops={crops} />
    </DataTable>
  );
}

