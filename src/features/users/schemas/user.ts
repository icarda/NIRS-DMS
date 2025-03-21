import { z } from "zod";

export const userSchema = z.object({
  id: z.number().int(),
  email: z.string().email(),
  password: z.string(),
  location: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  country: z.string(),
  centerId: z.number().int(),
  position: z.string(),
  emailVerified: z.date().nullable().optional(),
});
