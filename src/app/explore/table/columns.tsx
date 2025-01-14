"use client";

import { ColumnDef } from "@tanstack/react-table";

export type WetChemistry = {
  id: string;
  qualityLab: "ICARDA-MAR" | "ICARDA-LEB" | "CIMMYT";
  germplasmId: number;
  year: number;
  starch: number;
  protein: number;
  hrd: number;
};

export const columns: ColumnDef<WetChemistry>[] = [
  {
    header: "Quality Lab",
    accessorKey: "qualityLab",
  },
  {
    header: "Germplasm ID",
    accessorKey: "germplasmId",
  },
  {
    header: "Year",
    accessorKey: "year",
  },
  {
    header: "Starch",
    accessorKey: "starch",
  },
  {
    header: "Protein",
    accessorKey: "protein",
  },
  {
    header: "Hardness",
    accessorKey: "hrd",
  },
];
