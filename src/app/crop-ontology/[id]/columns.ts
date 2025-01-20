import { ColumnDef } from "@tanstack/react-table";

import { Trait } from "@/data/crops";

export const traitColumns: ColumnDef<Trait>[] = [
  {
    header: "Trait variable",
    accessorKey: "variable",
  },
  {
    header: "Trait name",
    accessorKey: "name",
  },
  {
    header: "Entity",
    accessorKey: "entity",
  },
  {
    header: "Method",
    accessorKey: "method",
  },
  {
    header: "Unit",
    accessorKey: "unit",
  },
];
