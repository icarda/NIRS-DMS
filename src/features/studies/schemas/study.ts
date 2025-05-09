import { z } from "zod";

export const studySchema = z.object({
  trialId: z.number().min(1, "Trial is required"),
  studyCode: z.string().min(1, "Study code is required"),
  productTypeId: z.number().min(1, "Product type is required"),
  nirModelId: z.number().min(1, "NIR model is required"),
  requesterName: z.string({ required_error: "Requester name is required" }),
  requesterEmail: z.string().email(),
  sampleDate: z.string().date(),
  program: z.string().min(1, "Program is required"),
  physiologicalStageId: z.number().min(1, "Physiological stage is required"),
  additionalMetadata: z.record(z.any()).optional(),
  qualityLabId: z.number().min(1, "Quality lab is required"),
});

export type StudySchema = z.infer<typeof studySchema>;
