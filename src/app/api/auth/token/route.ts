import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/drizzle/db";
import { apiClients, refreshTokens } from "@/drizzle/schemas/auth";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/token";
import { TokenRequestSchema, TokenResponseSchema } from "./schema";

/**
 * Obtain OAuth2 tokens
 * @description Issues access tokens using client credentials or refresh tokens.
 * @body TokenRequestSchema
 * @response TokenResponseSchema
 * @openapi
 */
export async function POST(req: Request) {
  const { grant_type, client_id, client_secret, refresh_token } =
    await req.json();

  // Client credentials flow
  if (grant_type === "client_credentials") {
    const client = await db.query.apiClients.findFirst({
      where: eq(apiClients.clientId, client_id),
    });

    if (!client || client.status !== "active") {
      return NextResponse.json({ error: "Invalid client" }, { status: 401 });
    }

    if (client.clientType === "confidential") {
      if (!client_secret)
        return NextResponse.json(
          { error: "Missing client_secret" },
          { status: 401 }
        );
      const valid = await bcrypt.compare(
        client_secret,
        client.clientSecretHash ?? ""
      );
      if (!valid)
        return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    const scopes = client.scopes.split(" ");
    const accessToken = await generateAccessToken(client_id, scopes);
    const newRefreshToken = await generateRefreshToken(client_id);

    return NextResponse.json({
      access_token: accessToken,
      refresh_token: newRefreshToken,
      token_type: "Bearer",
      expires_in: 3600,
    });
  }

  // Refresh token flow
  if (grant_type === "refresh_token") {
    const record = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, refresh_token),
    });

    if (!record || record.revoked || record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid refresh_token" },
        { status: 401 }
      );
    }

    const client = await db.query.apiClients.findFirst({
      where: eq(apiClients.clientId, record.clientId),
    });

    if (!client) {
      return NextResponse.json({ error: "Invalid client" }, { status: 401 });
    }

    const scopes = client.scopes.split(" ");
    const accessToken = await generateAccessToken(record.clientId, scopes);

    return NextResponse.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
    });
  }

  return NextResponse.json(
    { error: "Unsupported grant_type" },
    { status: 400 }
  );
}
