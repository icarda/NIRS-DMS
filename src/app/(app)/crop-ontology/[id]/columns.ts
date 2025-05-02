import { ColumnDef } from "@tanstack/react-table";

import { Crop } from "@/components/crop-page-client";

type CropTrait = Exclude<Crop, undefined>["cropTraits"][number];

export const traitColumns: ColumnDef<CropTrait>[] = [
  {
    header: "Trait variable",
    accessorKey: "traitVariable",
  },
  {
    header: "Trait name",
    accessorKey: "traitName",
  },
  {
    header: "Entity",
    accessorKey: "entity",
  },
  {
    header: "Method",
    accessorKey: "methodDescription",
  },
  {
    header: "Unit",
    accessorKey: "unit",
  },
];
