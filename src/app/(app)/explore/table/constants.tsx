import { capitalize } from "@/lib/utils";
import {
  StudyColumnSchema,
  TrialColumnSchema,
  type WetChemistryColumnSchema,
} from "./schema";
import { DataTableFilterField } from "./types";

export const QUALITY_LABS = ["ICARDA-MAR", "ICARDA-LEB", "CIMMYT"] as const;

export const wetChemistryFilterFields = [
  {
    label: "Study Code",
    value: "study_code",
    type: "input",
  },
  {
    label: "Crop",
    value: "crop",
    type: "checkbox",
    defaultOpen: true,
  },
  {
    label: "Quality Lab",
    value: "quality_lab",
    type: "checkbox",
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
    type: "checkbox",
  },
  {
    label: "Product Type",
    value: "product_type",
    type: "checkbox",
  },
] satisfies DataTableFilterField<WetChemistryColumnSchema>[];

export const trialFilterFields = [
  {
    label: "Trial Name",
    value: "trial_name",
    type: "input",
  },
  {
    label: "Crop",
    value: "crop",
    type: "checkbox",
    defaultOpen: true,
  },
  {
    label: "Planting Date",
    value: "trial_planting_date",
    type: "timerange",
  },
  {
    label: "Soil Type",
    value: "trial_soil_type",
    type: "checkbox",
  },
  {
    label: "Location",
    value: "trial_location",
    type: "input",
  },
  {
    label: "Latitude",
    value: "trial_latitude",
    type: "slider",
    min: -90,
    max: 90,
    unit: "°",
  },
  {
    label: "Longitude",
    value: "trial_longitude",
    type: "slider",
    min: -180,
    max: 180,
    unit: "°",
  },
  {
    label: "Irrigation",
    value: "irrigation",
    type: "checkbox",
    options: ["true", "false"].map((bool) => ({
      label: bool === "true" ? "Irrigated" : "Non Irrigated",
      value: bool,
    })),
  },
] satisfies DataTableFilterField<TrialColumnSchema>[];

export const studyFilterFields = [
  {
    label: "Study Code",
    value: "study_code",
    type: "input",
  },
  {
    label: "Program",
    value: "program",
    type: "input",
    defaultOpen: true,
  },
  {
    label: "Product Type",
    value: "product_type",
    type: "checkbox",
  },
  {
    label: "NIR Model",
    value: "nir_model",
    type: "checkbox",
  },
  {
    label: "Physiological Stage",
    value: "physiological_stage",
    type: "checkbox",
  },
  {
    label: "Quality Lab",
    value: "quality_lab",
    type: "checkbox",
  },
  {
    label: "Sample Date Range",
    value: "sample_date",
    type: "timerange",
  },
  {
    label: "Requester Name",
    value: "requester_name",
    type: "input",
  },
  {
    label: "Requester Email",
    value: "requester_email",
    type: "input",
  },
] satisfies DataTableFilterField<StudyColumnSchema>[];

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
