"use server";

import { z } from "zod";

import { loginSchema } from "@/lib/schemas";

export async function login(values: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    };
  }

  return {
    success: "Logged in",
  };
}
