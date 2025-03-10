"use server";

import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn } from "@/auth";
import { loginSchema } from "@/lib/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "../routes";

export async function login(values: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: true,
      message: "Invalid fields!",
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            error: true,
            message: "Invalid credentials!",
          };
        default:
          return {
            error: true,
            message: "Something went wrong!",
          };
      }
    }

    throw error;
  }
}
