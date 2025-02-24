"use server";

import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/drizzle/db";
import { centers, users } from "@/drizzle/schema";
import { registerSchema } from "@/lib/schemas";

export async function register(values: z.infer<typeof registerSchema>) {
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    };
  }

  const {
    center,
    country,
    email,
    firstName,
    lastName,
    location,
    password,
    position,
  } = validatedFields.data;

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return {
      error: "User already exists",
    };
  }

  const userCenter = await db.query.centers.findFirst({
    where: eq(centers.name, center),
  });

  if (!userCenter) {
    return {
      error: "Center does not exist",
    };
  }

  await db.insert(users).values({
    centerId: userCenter.centerId!,
    country,
    email,
    firstName,
    lastName,
    location,
    password: hashedPassword,
    position,
  });

  return {
    success: "User Created!",
  };
}
