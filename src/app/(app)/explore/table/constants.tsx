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
    type: "input",
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
    options: ["clay", "sandy", "loam"].map((soilType) => ({
      label: soilType,
      value: soilType,
    })),
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
      label: `${bool}`,
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
    type: "input",
  },
  {
    label: "NIR Model",
    value: "nir_model",
    type: "input",
  },
  {
    label: "Physiological Stage",
    value: "physiological_stage",
    type: "input",
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
