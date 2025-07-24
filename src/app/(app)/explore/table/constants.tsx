import { type ColumnSchema } from "./schema";
import { DataTableFilterField } from "./types";

export const QUALITY_LABS = ["ICARDA-MAR", "ICARDA-LEB", "CIMMYT"] as const;

export const filterFields = [
  {
    label: "Study Code",
    value: "study_code",
    type: "input",
  },
  {
    label: "Crop",
    value: "crop",
    type: "input",
    defaultOpen: true,
  },
  {
    label: "Quality Lab",
    value: "quality_lab",
    type: "checkbox",
    options: ["ICARDA-MAR", "ICARDA-LEB", "CIMMYT"].map((lab) => ({
      label: lab,
      value: lab,
    })),
  },
  {
    label: "Sample Date Range",
    value: "sample_date",
    type: "timerange",
  },

  {
    label: "Germplasm ID",
    value: "germplasm_id",
    type: "input",
  },
  {
    label: "Physiological Stage",
    value: "physiological_stage",
    type: "input",
  },
  {
    label: "Product Type",
    value: "product_type",
    type: "input",
  },
  ...["BetaGlucan", "Fe", "Zn"].map((trait) => ({
    label: trait,
    value: trait,
    type: "slider" as const,
    min: 0,
    max: 20,
    unit: "g",
  })),
] satisfies DataTableFilterField<ColumnSchema>[];

// {
//   label: "Protein",
//   value: "protein",
//   type: "slider",
//   min: 0,
//   max: 30,
//   options: data.map(({ protein }) => ({
//     label: `${protein}`,
//     value: protein,
//   })),
//   defaultOpen: true,
//   unit: "g",
// },
// {
//   label: "Irrigation",
//   value: "irrigation",
//   type: "checkbox",
//   options: [true, false].map((bool) => ({ label: `${bool}`, value: bool })),
// },
// {
//   label: "Starch",
//   value: "starch",
//   type: "slider",
//   min: 0,
//   max: 100,
//   options: data.map(({ starch }) => ({ label: `${starch}`, value: starch })),
//   unit: "%",
// },
