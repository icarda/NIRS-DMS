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
    invalid_type_error: "Trial planting date is required",
  }),
  crop: z.string().min(1, "Crop is required"),
  species: z.string().min(1, "Species is required"),
  soilType: z.string(),
  location: z.string().min(1, "Location is required"),
  coordinates: z
    .string()
    .regex(
      /^-?\d+\.\d*,\s-?\d+\.\d*$/,
      "Invalid coordinates format. Use lat, lon (e.g., 33.2315, -8.1515)"
    ),
  irrigation: z.boolean().optional(),
  fertilizers: z.array(
    z.object({
      type: z.string().min(0, "Fertilizer type is required"),
      amount: z.number().min(0, "Amount must be a positive number"),
    })
  ),
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
  requesterName: z.string().optional(),
  requesterEmail: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().email("Invalid email address").optional()),
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
        const MAX_SIZE_50MB = 50 * 1024 * 1024;
        return file.size <= MAX_SIZE_50MB;
      },
      { message: "File size must be less than 50MB" }
    ),
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
        const MAX_SIZE_50MB = 50 * 1024 * 1024;
        return file.size <= MAX_SIZE_50MB;
      },
      { message: "File size must be less than 50MB" }
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

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(128, { message: "Password must not exceed 128 characters" })
  .regex(/[a-z]/, {
    message: "Password must include at least one lowercase letter",
  })
  .regex(/[A-Z]/, {
    message: "Password must include at least one uppercase letter",
  })
  .regex(/[0-9]/, { message: "Password must include at least one digit" })
  .regex(/[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]/, {
    message: "Password must include at least one special character",
  });

const countries = ["Morocco", "Lebanon", "Mexico"] as const;
const centers = ["ICARDA", "CIMMYT"] as const;
const positions = ["Engineer", "Researcher", "Associate"] as const;
export const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First Name is required" }),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  country: z.enum(countries, { message: "Select a valid country" }),
  location: z.string().min(1, { message: "Location is required" }),
  center: z.enum(centers, { message: "Select a valid center" }),
  position: z.enum(positions, { message: "Select a valid position" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: passwordSchema,
});

export type TrialFormData = z.infer<typeof trialFormSchema>;
export type StudyFormData = z.infer<typeof studyFormSchema>;
export type UploadFormData = z.infer<typeof uploadFormSchema>;
export type MultiFormData = TrialFormData & StudyFormData & UploadFormData;
export type TraitUploadFormData = z.infer<typeof traitUploadSchema>;
