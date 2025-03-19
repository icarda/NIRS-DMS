import { NextResponse } from "next/server";

import {
  deleteCenter,
  getCenters,
  insertCenter,
  updateCenter,
} from "@/features/centers/db/center";
import { centerSchema } from "@/features/centers/schemas/center";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : undefined;
    const centers = await getCenters({ limit });
    return NextResponse.json({ error: false, centers }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error fetching centers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parseResult = centerSchema.safeParse(data);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: true,
          message: "Validation error",
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const result = await insertCenter(parseResult.data);
    if (!result) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(
      { error: false, message: "Center created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error creating center" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json(
        { error: true, message: "Missing id for update" },
        { status: 400 }
      );
    }
    const id = Number(idParam);
    const data = await request.json();

    const parseResult = centerSchema.safeParse(data);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: true,
          message: "Validation error",
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const result = await updateCenter({ id }, parseResult.data);
    if (!result) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(
      { error: false, message: "Center updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error updating center" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json(
        { error: true, message: "Missing id for deletion" },
        { status: 400 }
      );
    }
    const id = Number(idParam);
    const result = await deleteCenter({ id });
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error deleting center" },
      { status: 500 }
    );
  }
}
