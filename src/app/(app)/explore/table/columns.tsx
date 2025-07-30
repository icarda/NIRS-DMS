"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, isSameDay } from "date-fns";
import { Check, Minus, X } from "lucide-react";

import { isArrayOfDates } from "@/lib/utils";
import { DataTableColumnHeader } from "./data-table-column-header";
import {
  StudyColumnSchema,
  TrialColumnSchema,
  WetChemistryColumnSchema,
} from "./schema";

export const wetChemistryColumns: ColumnDef<WetChemistryColumnSchema>[] = [
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
        cell: ({ row }) => {
          const value = row.getValue("trialPlantingDate");
          return (
            <div suppressHydrationWarning>
              {format(new Date(`${value}`), "LLL dd, y")}
            </div>
          );
        },
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
        cell: ({ row }) => {
          const value = row.getValue("sample_date");
          return (
            <div suppressHydrationWarning>
              {format(new Date(`${value}`), "LLL dd, y")}
            </div>
          );
        },
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

export const trialColumns: ColumnDef<TrialColumnSchema>[] = [
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trial Name" />
    ),
    accessorKey: "name",
    id: "trial_name",
    meta: {
      label: "Trial Name",
    },
  },
  {
    header: "Crop",
    accessorFn: (row) => row.crop.name,
    id: "crop",
    meta: {
      label: "Crop",
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Planting Date" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("trial_planting_date");
      return (
        <div suppressHydrationWarning>
          {format(new Date(`${value}`), "LLL dd, y")}
        </div>
      );
    },
    accessorKey: "plantingDate",
    id: "trial_planting_date",
    meta: {
      label: "Planting Date",
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Soil Type" />
    ),
    accessorKey: "soilType",
    id: "trial_soil_type",
    filterFn: (row, id, value) => {
      const array = row.getValue(id) as string[];
      if (typeof value === "string") return array.includes(value);
      if (Array.isArray(value)) return value.some((i) => array.includes(i));
      return false;
    },
    meta: {
      label: "Soil Type",
    },
  },
  {
    header: "Location",
    accessorKey: "location",
    id: "trial_location",
    meta: {
      label: "Location",
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Latitude" />
    ),
    accessorKey: "latitude",
    id: "trial_latitude",
    meta: {
      label: "Latitude",
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Longitude" />
    ),
    accessorKey: "longitude",
    id: "trial_longitude",
    meta: {
      label: "Longitude",
    },
  },
  {
    accessorKey: "irrigation",
    id: "irrigation",
    header: "Irrigation",
    cell: ({ row }) => {
      const value = row.getValue("irrigation");
      if (typeof value === "undefined") {
        return <Minus className="h-4 w-4 text-muted-foreground/50" />;
      }
      if (value) return <Check className="h-4 w-4" />;
      return <X className="h-4 w-4 text-muted-foreground/50" />;
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);
      return value.includes(rowValue);
    },
    meta: {
      label: "Irrigation",
    },
  },
];

export const studyColumns: ColumnDef<StudyColumnSchema>[] = [
  {
    header: "Study Code",
    accessorKey: "studyCode",
    id: "study_code",
    meta: {
      label: "Study Code",
    },
  },
  {
    header: "Program",
    accessorKey: "program",
    id: "program",
    meta: {
      label: "Program",
    },
  },
  {
    header: "Product Type",
    accessorFn: (row) => row.productType.name,
    id: "product_type",
    meta: {
      label: "Product Type",
    },
  },
  {
    header: "NIR Model",
    accessorFn: (row) => row.nirModel.name,
    id: "nir_model",
    meta: {
      label: "NIR Model",
    },
  },
  {
    header: "Physiological Stage",
    accessorFn: (row) => row.physiologicalStage.name,
    id: "physiological_stage",
    meta: {
      label: "Physiological Stage",
    },
  },
  {
    header: "Quality Lab",
    accessorFn: (row) => row.qualityLab.name,
    id: "quality_lab",
    meta: {
      label: "Quality Lab",
    },
  },
  {
    header: "Sample Date",
    accessorKey: "sampleDate",
    id: "sample_date",
    cell: ({ row }) => {
      const value = row.getValue("sample_date");
      return (
        <div suppressHydrationWarning>
          {format(new Date(`${value}`), "LLL dd, y")}
        </div>
      );
    },
    meta: {
      label: "Sample Date",
    },
  },
  {
    header: "Requester Name",
    accessorKey: "requesterName",
    id: "requester_name",
    cell: ({ row }) => {
      const value = row.getValue("requester_name");
      if (!value) {
        return <Minus className="h-4 w-4 text-muted-foreground/50" />;
      }
      return <div>{`${value}`}</div>;
    },
    meta: {
      label: "Requester Name",
    },
  },
  {
    header: "Requester Email",
    accessorKey: "requesterEmail",
    id: "requester_email",
    cell: ({ row }) => {
      const value = row.getValue("requester_email");
      if (!value) {
        return <Minus className="h-4 w-4 text-muted-foreground/50" />;
      }
      return <div>{`${value}`}</div>;
    },
    meta: {
      label: "Requester Email",
    },
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
