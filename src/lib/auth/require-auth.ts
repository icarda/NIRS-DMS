// lib/auth/requireAuth.ts
import { NextResponse } from "next/server";

import { verifyAccessToken } from "./token";

export async function requireAuth(req: Request, requiredScopes?: string[]) {
  const auth = req.headers.get("authorization");

  if (!auth || !auth.startsWith("Bearer ")) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const token = auth.split(" ")[1];
  const payload = await verifyAccessToken(token);

  if (!payload) {
    return {
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }

  if (
    requiredScopes &&
    !requiredScopes.every((s) => payload.scopes.includes(s))
  ) {
    return {
      error: NextResponse.json(
        { error: "Forbidden: insufficient scope" },
        { status: 403 }
      ),
    };
  }

  return { clientId: payload.client_id, scopes: payload.scopes };
}
