import { z } from "zod";

import { QUALITY_LABS } from "./constants";

export const columnSchema = z.object({
  sample_id: z.number().int().positive(), // ID should be a positive integer
  crop_name: z.string().min(1), // Crop name is a non-empty string
  trait_name: z.string().min(1), // Trait name is a non-empty string
  measured_value: z.number().nullable(), // Measured value can be a number or null
  predicted_value: z.number().nullable(), // Predicted value can be a number or null
  study_code: z.string().min(1), // Study code is a non-empty string
  species: z.string().min(1), // Species is a non-empty string
  sample_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }), // Validates if sample_date is a valid date string
  program: z.string().min(1), // Program is a non-empty string
  requester_name: z.string().nullable(), // Requester name can be a string or null
  requester_email: z.string().email().nullable(), // Email is a valid email or null
  germplasm_id: z.number().int().positive(), // Germplasm ID should be a positive integer
  product_type: z.string().min(1), // Product type is a non-empty string
  trial_name: z.string().min(1), // Trial name is a non-empty string
  trial_planting_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }), // Validates if trial_planting_date is a valid date string
  trial_soil_type: z.string().min(1), // Trial soil type is a non-empty string
  trial_location: z.string().min(1), // Trial location is a non-empty string
  trial_latitude: z.number().min(-90).max(90), // Latitude should be within valid range
  trial_longitude: z.number().min(-180).max(180), // Longitude should be within valid range
  quality_lab_name: z.string().min(1), // Quality lab name is a non-empty string
});

export type ColumnSchema = z.infer<typeof columnSchema> & Record<string, any>;
