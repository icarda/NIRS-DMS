import { z } from "zod";

export const CropsFilterSchema = z.object({
  commonName: z.string().optional().describe("Filter crops by common name"),
  species: z.string().optional().describe("Filter crops by species name"),
  productType: z.string().optional().describe("Filter crops by product type"),
  physiologicalStage: z
    .string()
    .optional()
    .describe("Filter crops by physiological stage"),
});

export const CropsResponseSchema = z.array(
  z.object({
    id: z.number().describe("Unique crop ID"),
    name: z.string().describe("Official crop name"),
    description: z.string().nullable().describe("Description of the crop"),
    cropImageUrl: z.string().nullable().describe("Image URL for the crop"),
    commonNames: z
      .array(z.string())
      .describe("Alternative/common names of the crop"),
    species: z.array(z.string()).describe("Species belonging to this crop"),
    physiologicalStages: z
      .array(z.string())
      .describe("Physiological stages defined for this crop"),
    productTypes: z.array(z.string()).describe("Product types for this crop"),
  })
);
