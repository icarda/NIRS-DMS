"use server";

import nodemailer from "nodemailer";

import { env } from "@/data/env/server";

export async function sendPasswordResetEmail(email: string, token: string) {
  try {
    const resetLink = `http://localhost:3000/auth/new-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.GOOGLE_EMAIL,
        pass: env.GOOGLE_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"NIRS_DMS" <${env.GOOGLE_EMAIL}>`,
      to: email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send email." };
  }
}
