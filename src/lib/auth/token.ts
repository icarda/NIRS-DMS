import { randomBytes } from "crypto";

import { jwtVerify, SignJWT } from "jose";

import { env } from "@/data/env/server";
import { db } from "@/drizzle/db";
import { refreshTokens } from "@/drizzle/schemas/auth";

const secret = new TextEncoder().encode(env.AUTH_SECRET);

export async function generateAccessToken(clientId: string, scopes: string[]) {
  return await new SignJWT({ client_id: clientId, scopes })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

export async function generateRefreshToken(clientId: string) {
  const token = randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

  await db.insert(refreshTokens).values({
    clientId,
    token,
    expiresAt,
  });

  return token;
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { client_id: string; scopes: string[] };
  } catch {
    return null;
  }
}
