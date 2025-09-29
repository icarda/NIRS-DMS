"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import * as z from "zod";

import { db } from "@/drizzle/db";
import { PasswordResetTokens, UserTable } from "@/drizzle/schema";
import {
  getPasswordResetTokenByToken,
  getUserByEmail,
} from "@/features/users/db/users";
import { newPasswordSchema } from "@/lib/schemas";

export const newPassword = async (
  values: z.infer<typeof newPasswordSchema>,
  token?: string | null
) => {
  if (!token) {
    return { error: "Missing token!" };
  }

  const validatedFields = newPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { password } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  console.log("Existing token:", existingToken);

  if (!existingToken) {
    return { error: "Invalid token!" };
  }

  const hasExpired = new Date(existingToken.expiresAt) < new Date();

  console.log("Has token expired?", hasExpired);

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.transaction(async (tx) => {
    await tx
      .update(UserTable)
      .set({ password: hashedPassword })
      .where(eq(UserTable.id, existingUser.id));

    await tx
      .delete(PasswordResetTokens)
      .where(eq(PasswordResetTokens.id, existingToken.id));
  });

  return { success: "Password updated!" };
};
