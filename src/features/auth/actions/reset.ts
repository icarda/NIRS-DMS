"use server";

import * as z from "zod";

import { generatePasswordResetToken } from "@/features/users/actions/user";
import { getUserByEmail } from "@/features/users/db/users";
import { sendPasswordResetEmail } from "@/lib/mail";
import { resetPasswordSchema } from "@/lib/schemas";

export const reset = async (values: z.infer<typeof resetPasswordSchema>) => {
  const validatedFields = resetPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid emaiL!" };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    // return a message that does not reveal whether the email exists
    return { success: "Reset email sent!" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: "Reset email sent!" };
};
