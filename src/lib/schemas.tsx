import { z } from "zod";

export const dashboardFilterSchema = z.object({
  crop: z.string().min(1, "Please select a crop"),
  qualityLab: z.string().min(1, "Please select a quality lab"),
  year: z.string().min(1, "Please select a year"),
  country: z.string().min(1, "Please select a country"),
  nirModel: z.string().min(1, "Please select a NIR model"),
});
export const trialFormSchema = z.object({
  useExistingTrial: z.boolean(),
  trial: z.string().min(1, "Trial is required"),
  trialPlantingDate: z.date({
    required_error: "Trial planting date is required",
  }),
  crop: z.string().min(1, "Crop is required"),
  species: z.string().min(1, "Species is required"),
  soilType: z.string().min(1, "Soil type is required"),
  location: z.string().min(1, "Location is required"),
  coordinates: z
    .string()
    .min(1, "Coordinates are required")
    .regex(
      /^-?\d+\.?\d*,\s-?\d+\.?\d*$/,
      "Invalid coordinates format. Use lat, lon (e.g., 33.2315, -8.1515)"
    ),
  irrigation: z.boolean(),
  fertilizers: z
    .array(
      z.object({
        type: z.string().min(1, "Fertilizer type is required"),
        amount: z.number().min(0, "Amount must be a positive number"),
      })
    )
    .min(1, "At least one fertilizer entry is required"),
});

export const studyFormSchema = z.object({
  productType: z.string().min(1, "Product type is required"),
  qualityLab: z.string().min(1, "Quality lab is required"),
  nirModel: z.string().min(1, "NIR model is required"),
  physiologicalStage: z.string().min(1, "Physiological stage is required"),
  sampleDate: z.date({
    required_error: "Sample date is required",
  }),
  program: z.string().min(1, "Program is required"),
  requesterName: z.string().min(1, "Requester name is required"),
  requesterEmail: z.string().email("Invalid email address"),
});

export const uploadFormSchema = z.object({
  file: z
    .instanceof(File, { message: "File is required" })
    .refine(
      (file) => {
        const validTypes = [
          "text/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];
        return validTypes.includes(file.type);
      },
      {
        message: "File must be CSV or XLSX format",
      }
    )
    .refine(
      (file) => {
        const MAX_SIZE_5MB = 5 * 1024 * 1024;
        return file.size <= MAX_SIZE_5MB;
      },
      { message: "File size must be less than 5MB" }
    )
    .nullable(),
});

export const traitUploadSchema = z.object({
  crop: z.string().min(1, "Please select a crop"),
  year: z.string().min(1, "Please select a year"),
  study: z.string().min(1, "Please select a study"),
  traits: z.array(z.string()).min(1, "Please select at least one trait"),
  file: z
    .instanceof(File, { message: "File is required" })
    .refine(
      (file) => {
        const validTypes = [
          "text/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];
        return validTypes.includes(file.type);
      },
      {
        message: "File must be CSV or XLSX format",
      }
    )
    .refine(
      (file) => {
        const MAX_SIZE_5MB = 5 * 1024 * 1024;
        return file.size <= MAX_SIZE_5MB;
      },
      { message: "File size must be less than 5MB" }
    )
    .nullable(),
});

export const metadataDialog = z.object({
  id: z.number(),
  name: z.string().min(2, "Metadata name must be at least 2 characters"),
  type: z.enum(["String", "Number", "Boolean", "Date", "Array"]),
  defaultValue: z.string(),
  required: z.boolean(),
  minValue: z.string(),
  maxValue: z.string(),
});

export type TrialFormData = z.infer<typeof trialFormSchema>;
export type StudyFormData = z.infer<typeof studyFormSchema>;
export type UploadFormData = z.infer<typeof uploadFormSchema>;
export type TraitUploadFormData = z.infer<typeof traitUploadSchema>;
