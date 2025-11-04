import { z } from "zod";

export const dashboardFilterSchema = z.object({
  crop: z.string(),
  qualityLab: z.string(),
  year: z.string(),
  country: z.string(),
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
  location: z.string(),
  coordinates: z
    .string()
    .regex(
      /^-?\d+\.\d*,\s-?\d+\.\d*$/,
      "Invalid coordinates format. Use lat, lon (e.g., 33.2315, -8.1515)"
    )
    .or(z.literal("")),
  irrigation: z.coerce.boolean().optional(),
  fertilizers: z.array(
    z.object({
      type: z.string().min(0, "Fertilizer type is required"),
      amount: z.number().min(0, "Amount must be a positive number"),
    })
  ),
});

export const studyFormSchema = z.object({
  useExistingStudy: z.boolean(),
  study: z.string().optional(),
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
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
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
    ),
});

export const traitUploadSchemaFinal = z.object({
  studyCode: z.string().min(1, "Study code is required"),
  studyId: z
    .number({
      required_error: "Study ID is required.",
      invalid_type_error: "Study ID must be a valid number.",
    })
    .int()
    .positive({ message: "Study ID must be positive." }),
  cropId: z
    .number({
      required_error: "Crop ID is required.",
      invalid_type_error: "Crop ID must be a valid number.",
    })
    .int()
    .positive({ message: "Crop ID must be positive." }),
  year: z
    .number({
      required_error: "Year is required.",
      invalid_type_error: "Year must be a valid number.",
    })
    .int()
    .min(1900, { message: "Year seems too old." })
    .max(new Date().getFullYear() + 1, {
      message: "Year cannot be in the future.",
    }),

  traits: z
    .array(z.string().min(1, "Trait name cannot be empty string."))
    .min(1, "At least one trait must be selected."),

  file: z
    .instanceof(File, { message: "File is required" })
    .refine((file) => file.size <= 50 * 1024 * 1024, {
      message: "File size must be less than 50MB",
    })
    .refine(
      (file) =>
        [
          "text/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ].includes(file.type),
      { message: "File must be CSV or XLSX format" }
    ),
});

export const multiStepFormSchema = trialFormSchema
  .merge(studyFormSchema)
  .merge(uploadFormSchema)
  .refine(
    (data) => {
      if (!data.sampleDate || !data.trialPlantingDate) return true;
      return new Date(data.sampleDate) >= new Date(data.trialPlantingDate);
    },
    {
      message: "Sampling date must be on or after planting date",
      path: ["sampleDate"],
    }
  );

export function getExtendedSchema(metadatas: any[], type: "trial" | "study") {
  const shape: z.ZodRawShape = {};

  for (const m of metadatas) {
    let field: z.ZodTypeAny;

    switch (m.type) {
      case "string":
        field = z.string();
        if (m.required)
          field = (field as z.ZodString).min(1, `${m.label} is required`);
        else field = field.optional();
        break;
      case "number": {
        let base = z.number({
          required_error: `${m.label} is required`,
        });
        if (m.min) base = base.min(parseFloat(m.min));
        if (m.max) base = base.max(parseFloat(m.max));

        field = z.preprocess((val) => (val === "" ? undefined : val), base);

        if (!m.required) field = field.optional();
        break;
      }
      case "boolean":
        field = m.required ? z.coerce.boolean() : z.coerce.boolean().optional();
        break;
      case "date":
        field = m.required
          ? z.coerce.date({ required_error: `${m.label} is required` })
          : z.coerce.date().optional();
        break;
      case "array":
        field = z.array(z.any());
        if (!m.required) field = field.optional();
        break;
      default:
        field = z.any().optional();
    }

    shape[m.name] = field;
  }

  return type === "trial"
    ? trialFormSchema.extend(shape)
    : studyFormSchema.extend(shape);
}

export const metadataDialog = z.object({
  id: z
    .number({
      required_error: "ID is required",
      invalid_type_error: "ID must be a number",
    })
    .int()
    .positive(),
  label: z
    .string()
    .min(2, "Metadata name must be at least 2 characters")
    .optional(),
  name: z
    .string()
    .min(2, "Metadata name must be at least 2 characters")
    .optional(),
  type: z.enum(["string", "number", "boolean", "date", "array"]).optional(),
  defaultValue: z.string().optional(),
  required: z.boolean().optional(),
  min: z.string().optional(),
  max: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
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

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const centers = ["ICARDA", "CIMMYT"] as const;
export const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First Name is required" }),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  country: z.string().min(1, { message: "Select a valid country" }),
  location: z.string().min(1, { message: "Location is required" }),
  center: z.enum(centers, { message: "Select a valid center" }),
  position: z.string().min(1, { message: "Select a valid position" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: passwordSchema,
});

export const multiStepFormSchemaFinal = z.object({
  // Trial Fields
  useExistingTrial: z.boolean(),
  trial: z.string().min(1, "Trial name is required"),
  trialPlantingDate: z.date({
    required_error: "Trial planting date is required",
    invalid_type_error: "Valid Trial planting date is required",
  }),
  soilType: z.string().nullable().optional(),
  location: z.string().optional(),
  coordinates: z
    .string()
    .regex(
      /^-?\d+\.\d*,\s-?\d+\.\d*$/,
      "Invalid coordinates format. Use lat, lon (e.g., 33.2315, -8.1515)"
    )
    .or(z.literal(""))
    .optional(),
  irrigation: z.boolean().optional(),
  fertilizers: z.array(
    z.object({
      type: z.string().min(0, "Fertilizer type is required"),
      amount: z.number().min(0, "Amount must be positive"),
    })
  ),

  // Study Fields
  sampleDate: z.date({
    required_error: "Sample date is required",
  }),
  program: z.string().min(1, "Program is required"),
  requesterName: z.string().optional(),
  requesterEmail: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),

  // File Upload
  file: z
    .instanceof(File, { message: "File is required" })
    .refine((file) => file.size <= 50 * 1024 * 1024, {
      message: "File size must be less than 50MB",
    })
    .refine(
      (file) =>
        [
          "text/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ].includes(file.type),
      { message: "File must be CSV or XLSX format" }
    ),

  // IDs
  cropID: z
    .number({
      required_error: "Crop ID is required",
      invalid_type_error: "Crop ID must be a number",
    })
    .int()
    .positive(),
  speciesID: z
    .number({
      required_error: "Species ID is required",
      invalid_type_error: "Species ID must be a number",
    })
    .int()
    .positive(),
  productTypeID: z
    .number({
      required_error: "Product Type ID is required",
      invalid_type_error: "Product Type ID must be a number",
    })
    .int()
    .positive(),
  qualityLabID: z
    .number({
      required_error: "Quality Lab ID is required",
      invalid_type_error: "Quality Lab ID must be a number",
    })
    .int()
    .positive(),
  nirModelID: z
    .number({
      required_error: "NIR Model ID is required",
      invalid_type_error: "NIR Model ID must be a number",
    })
    .int()
    .positive(),
  physiologicalStageID: z
    .number({
      required_error: "Physiological Stage ID is required",
      invalid_type_error: "Physiological Stage ID must be a number",
    })
    .int()
    .positive(),

  // Study Code
  studyCode: z.string().min(1, "Study Code is required"),
});

export const productTypeAddSchema = z.object({
  type: z
    .string()
    .nonempty("Product type is required")
    .min(2, "Product type must be at least 2 characters"),
  crop: z
    .string()
    .nonempty("Crop is required")
    .min(2, "Crop must be at least 2 characters"),
});

export const physiologicalStageAddSchema = z.object({
  stage: z
    .string()
    .nonempty("Stage is required")
    .min(2, "Physiological stage must be at least 2 characters"),
  crop: z.string().nonempty("Crop is required"),
});

export type TrialFormData = z.infer<typeof trialFormSchema>;
export type StudyFormData = z.infer<typeof studyFormSchema>;
export type UploadFormData = z.infer<typeof uploadFormSchema>;
export type MultiFormData = TrialFormData & StudyFormData & UploadFormData;
export type MultiStepFormSchemaFinal = z.infer<typeof multiStepFormSchemaFinal>;
export type TraitUploadFormData = z.infer<typeof traitUploadSchema>;
export type TraitUploadFormDataFinal = z.infer<typeof traitUploadSchemaFinal>;
