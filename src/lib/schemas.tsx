import { z } from "zod";

export const dashboardFilterSchema = z.object({
  crop: z.string().min(1, "Please select a crop"),
  qualityLab: z.string().min(1, "Please select a quality lab"),
  year: z.string().min(1, "Please select a year"),
  country: z.string().min(1, "Please select a country"),
  nirModel: z.string().min(1, "Please select a NIR model"),
});

export const trialFormStepSchema = z.object({
  isExisting: z.boolean(),
  name: z.string().min(1, "Trial name is required"),
  plantingDate: z.date({
    required_error: "Planting date is required",
  }),
  crop: z.string({
    required_error: "Please select a crop",
  }),
  species: z.string({
    required_error: "Please select a species",
  }),
  soilType: z.string({
    required_error: "Please select a soil type",
  }),
  location: z.string().min(1, "Location is required"),
  coordinates: z
    .string()
    .regex(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/, "Invalid coordinates format"),
  irrigation: z.boolean(),
  fertilizers: z
    .array(
      z.object({
        type: z.string({
          required_error: "Please select a fertilizer type",
        }),
        amount: z.number().min(0, "Amount must be positive"),
      })
    )
    .min(1, "At least one fertilizer is required"),
});

export type TrialStepFormValues = z.infer<typeof trialFormStepSchema>;
