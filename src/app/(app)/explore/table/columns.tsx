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
    filterFn: (row, id, value) => {
      if (value == null) return true;
      const rowValue = String(row.getValue(id) ?? "")
        .trim()
        .toLowerCase();

      const tokens = Array.isArray(value)
        ? value
        : typeof value === "string"
          ? [value]
          : [];

      if (tokens.length === 0) return true;

      return tokens.some(
        (token) => rowValue === String(token).trim().toLowerCase()
      );
    },
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
        meta: {
          label: "Trial Name",
        },
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
          const raw = row.getValue(id);

          const rowDate =
            raw instanceof Date
              ? raw
              : typeof raw === "string"
                ? new Date(`${raw}T00:00:00`)
                : null;

          if (!rowDate || isNaN(rowDate.getTime())) return false;

          if (Array.isArray(value)) {
            const [from, to] = value;

            if (!from && !to) return true;
            if (from && !to) return isSameDay(from, rowDate);
            if (from && to) {
              const toInclusive = new Date(to);
              toInclusive.setHours(23, 59, 59, 999);

              return (
                rowDate.getTime() >= from.getTime() &&
                rowDate.getTime() <= toInclusive.getTime()
              );
            }
          }

          return false;
        },
        meta: {
          label: "Planting Date",
        },
      },
      {
        header: "Crop",
        accessorKey: "crop_name",
        id: "crop",
        meta: {
          label: "Crop",
        },
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
        meta: {
          label: "Study Code",
        },
      },
      {
        header: "Product Type",
        accessorKey: "product_type",
        id: "product_type",
        meta: {
          label: "Product Type",
        },
      },
      {
        header: "Physiological Stage",
        accessorKey: "physiological_stage",
        id: "physiological_stage",
        meta: {
          label: "Physiological Stage",
        },
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
          const raw = row.getValue(id);

          const rowDate =
            raw instanceof Date
              ? raw
              : typeof raw === "string"
                ? new Date(`${raw}T00:00:00`)
                : null;

          if (!rowDate || isNaN(rowDate.getTime())) return false;

          if (Array.isArray(value)) {
            const [from, to] = value;

            if (!from && !to) return true;
            if (from && !to) return isSameDay(from, rowDate);
            if (from && to) {
              const toInclusive = new Date(to);
              toInclusive.setHours(23, 59, 59, 999);

              return (
                rowDate.getTime() >= from.getTime() &&
                rowDate.getTime() <= toInclusive.getTime()
              );
            }
          }

          return false;
        },
        meta: {
          label: "Sample Date",
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
    filterFn: (row, id, value) => {
      const raw = row.getValue(id);

      const rowDate =
        raw instanceof Date
          ? raw
          : typeof raw === "string"
            ? new Date(`${raw}T00:00:00`)
            : null;

      if (!rowDate || isNaN(rowDate.getTime())) return false;

      if (Array.isArray(value)) {
        const [from, to] = value;

        if (!from && !to) return true;
        if (from && !to) return isSameDay(from, rowDate);
        if (from && to) {
          const toInclusive = new Date(to);
          toInclusive.setHours(23, 59, 59, 999);

          return (
            rowDate.getTime() >= from.getTime() &&
            rowDate.getTime() <= toInclusive.getTime()
          );
        }
      }

      return false;
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
        return (
          <Minus className="text-muted-foreground/50 h-4 w-4 text-center" />
        );
      }
      if (value) return <Check className="h-4 w-4" />;
      return <X className="text-muted-foreground/50 h-4 w-4" />;
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);
      return value.includes(`${rowValue}`);
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
    filterFn: (row, id, value) => {
      const raw = row.getValue(id);

      const rowDate =
        raw instanceof Date
          ? raw
          : typeof raw === "string"
            ? new Date(`${raw}T00:00:00`)
            : null;

      if (!rowDate || isNaN(rowDate.getTime())) return false;

      if (Array.isArray(value)) {
        const [from, to] = value;

        if (!from && !to) return true;
        if (from && !to) return isSameDay(from, rowDate);
        if (from && to) {
          const toInclusive = new Date(to);
          toInclusive.setHours(23, 59, 59, 999);

          return (
            rowDate.getTime() >= from.getTime() &&
            rowDate.getTime() <= toInclusive.getTime()
          );
        }
      }

      return false;
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
        return (
          <Minus className="text-muted-foreground/50 h-4 w-4 text-center" />
        );
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
        return (
          <Minus className="text-muted-foreground/50 h-4 w-4 text-center" />
        );
      }
      return <div>{`${value}`}</div>;
    },
    meta: {
      label: "Requester Email",
    },
  },
];
