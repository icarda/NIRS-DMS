"use server";

import { error } from "console";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/drizzle/db";
import { CenterTable, UserTable } from "@/drizzle/schema";
import { getUserByEmail, insertUser } from "@/features/users/db/users";
import { registerSchema } from "@/lib/schemas";

export async function register(values: z.infer<typeof registerSchema>) {
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: true,
      message: "Invalid fields",
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

  const salt = await bcrypt.genSalt(11);
  const hashedPassword = await bcrypt.hash(password, salt);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return {
      error: true,
      message: "User already exists",
    };
  }

  const userCenter = await db.query.CenterTable.findFirst({
    where: eq(CenterTable.name, center),
  });

  if (!userCenter) {
    return {
      error: true,
      message: "Center does not exist",
    };
  }

  await insertUser({
    centerId: userCenter.id,
    country,
    email,
    firstName,
    lastName,
    location,
    password: hashedPassword,
    position,
  });

  redirect("/auth/signin");
}
