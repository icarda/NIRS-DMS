"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, isSameDay } from "date-fns";
import { Check, Minus, X } from "lucide-react";

import { isArrayOfDates } from "@/lib/utils";
import { DataTableColumnHeader } from "./data-table-column-header";
import { ColumnSchema } from "./schema";

export const columns: ColumnDef<ColumnSchema>[] = [
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sample ID" />
    ),
    accessorKey: "sample_id",
    id: "sample_id",

    meta: {
      label: "Sample ID",
    },
  },
  {
    header: "Quality Lab",
    accessorKey: "quality_lab_name",
    id: "quality_lab",
    meta: {
      label: "Quality Lab",
    },
    filterFn: (row, id, value) => {
      const array = row.getValue(id) as string[];
      if (typeof value === "string") return array.includes(value);
      if (Array.isArray(value)) return value.some((i) => array.includes(i));
      return false;
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Germplasm ID" />
    ),
    accessorKey: "germplasm_id",
    id: "germplasm_id",
    meta: {
      label: "Germplasm ID",
    },
  },
  {
    header: "Trial Metadatas",
    columns: [
      {
        header: "Name",
        accessorKey: "trial_name",
        id: "trialName",
      },
      {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Planting Date" />
        ),

        accessorKey: "trial_planting_date",
        id: "trialPlantingDate",

        filterFn: (row, id, value) => {
          const rowValue = row.getValue(id);
          if (isArrayOfDates(value) && rowValue instanceof Date) {
            if (value.length === 1) {
              return isSameDay(value[0], rowValue);
            }
            const sorted = value.sort((a, b) => a.getTime() - b.getTime());
            return (
              sorted[0]?.getTime() <= rowValue.getTime() &&
              rowValue.getTime() <= sorted[1]?.getTime()
            );
          }
          return false;
        },
      },
      {
        header: "Crop",
        accessorKey: "crop_name",
        id: "crop",
      },
    ],
  },
  {
    header: "Study Metadatas",
    columns: [
      {
        header: "Study Code",
        accessorKey: "study_code",
        id: "study_code",
      },
      {
        header: "Product Type",
        accessorKey: "product_type",
        id: "product_type",
      },
      {
        header: "Physiological Stage",
        accessorKey: "physiological_stage",
        id: "physiological_stage",
      },
      {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Sample Date" />
        ),
        accessorKey: "sample_date",
        id: "sample_date",
        filterFn: (row, id, value) => {
          const rowValue = row.getValue(id);
          if (isArrayOfDates(value) && rowValue instanceof Date) {
            if (value.length === 1) {
              return isSameDay(value[0], rowValue);
            }
            const sorted = value.sort((a, b) => a.getTime() - b.getTime());
            return (
              sorted[0]?.getTime() <= rowValue.getTime() &&
              rowValue.getTime() <= sorted[1]?.getTime()
            );
          }
          return false;
        },
      },
    ],
  },
];

// {
//   header: ({ column }) => (
//     <DataTableColumnHeader column={column} title="Year" />
//   ),
//   accessorKey: "year",
//   meta: {
//     label: "Year",
//   },
// },
// {
//   accessorKey: "starch",
//   header: ({ column }) => (
//     <DataTableColumnHeader column={column} title="Starch" />
//   ),
//   cell: ({ row }) => {
//     const value = row.getValue("starch");
//     if (typeof value === "undefined") {
//       return <Minus className="h-4 w-4 text-muted-foreground/50" />;
//     }
//     return <div>{`${value}`} %</div>;
//   },
//   meta: {
//     label: "Starch",
//   },
// },
// {
//   header: ({ column }) => (
//     <DataTableColumnHeader column={column} title="Protein" />
//   ),
//   accessorKey: "protein",
//   cell: ({ row }) => {
//     const value = row.getValue("protein");
//     if (typeof value === "undefined") {
//       return <Minus className="h-4 w-4 text-muted-foreground/50" />;
//     }
//     return <div>{`${value}`} g</div>;
//   },
//   meta: {
//     label: "Protein",
//   },
// },
// {
//   header: ({ column }) => (
//     <DataTableColumnHeader column={column} title="Hardness" />
//   ),
//   cell: ({ row }) => {
//     const value = row.getValue("hrd");
//     if (typeof value === "undefined") {
//       return <Minus className="h-4 w-4 text-muted-foreground/50" />;
//     }
//     return <div>{`${value}`} %</div>;
//   },
//   accessorKey: "hrd",
//   meta: {
//     label: "Hardness",
//   },
// },
// {
//   accessorKey: "irrigation",
//   header: "Irrigation",
//   cell: ({ row }) => {
//     const value = row.getValue("irrigation");
//     if (typeof value === "undefined") {
//       return <Minus className="h-4 w-4 text-muted-foreground/50" />;
//     }
//     if (value) return <Check className="h-4 w-4" />;
//     return <X className="h-4 w-4 text-muted-foreground/50" />;
//   },
//   filterFn: (row, id, value) => {
//     const rowValue = row.getValue(id);
//     return value.includes(rowValue);
//   },
// },
// {
//   accessorKey: "date",
//   header: ({ column }) => (
//     <DataTableColumnHeader column={column} title="Date" />
//   ),
//   cell: ({ row }) => {
//     const value = row.getValue("date");
//     return (
//       <div className="text-xs text-muted-foreground" suppressHydrationWarning>
//         {format(new Date(`${value}`), "LLL dd, y")}
//       </div>
//     );
//   },
// filterFn: (row, id, value) => {
//   const rowValue = row.getValue(id);
//   if (isArrayOfDates(value) && rowValue instanceof Date) {
//     if (value.length === 1) {
//       return isSameDay(value[0], rowValue);
//     }
//     const sorted = value.sort((a, b) => a.getTime() - b.getTime());
//     return (
//       sorted[0]?.getTime() <= rowValue.getTime() &&
//       rowValue.getTime() <= sorted[1]?.getTime()
//     );
//   }
//   return false;
// },
// },
