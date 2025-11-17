import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { db } from "@/drizzle/db";
import { apiClients, ClientStatus, ClientType } from "@/drizzle/schemas/auth";
import { requireAdminToken } from "@/lib/auth/require-auth";
import { AuthClientRequestSchema, AuthClientResponseSchema } from "./schema";

/**
 * Create a new API client
 * @description Creates a new API client with the provided details.
 * @body AuthClientRequestSchema
 * @response AuthClientResponseSchema
 * @openapi
 */
export async function POST(req: Request) {
  if (!requireAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, scopes, name, description } = await req.json();

  if (!["public", "confidential"].includes(type)) {
    return NextResponse.json({ error: "Invalid client type" }, { status: 400 });
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Client name is required" },
      { status: 400 }
    );
  }

  const clientId = randomUUID();
  let clientSecret: string | null = null;
  let clientSecretHash: string | null = null;

  if (type === "confidential") {
    clientSecret = randomUUID();
    clientSecretHash = await bcrypt.hash(clientSecret, 10);
  }

  try {
    await db.insert(apiClients).values({
      clientId,
      clientSecretHash,
      clientType: type as ClientType,
      status: "active" as ClientStatus,
      scopes: (scopes && scopes.length > 0 ? scopes : ["read:data"]).join(" "),
      name,
      description: description || null,
    });

    return NextResponse.json({
      client_id: clientId,
      ...(clientSecret ? { client_secret: clientSecret } : {}),
    });
  } catch (err: any) {
    if (err.code === "23505") {
      return NextResponse.json(
        { error: "Client name already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
