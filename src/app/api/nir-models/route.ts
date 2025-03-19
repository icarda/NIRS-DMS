import { NextResponse } from "next/server";

import {
  deleteNirModel,
  getNirModels,
  insertNirModel,
} from "@/features/nir-models/db/nir-model";
import { nirModelSchema } from "@/features/nir-models/schemas/nir-model";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : undefined;
    const nirModels = await getNirModels({ limit });
    return NextResponse.json({ error: false, nirModels }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error fetching NIR models" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = nirModelSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: true,
          message: "Validation error",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }
    const newNirModel = await insertNirModel(parsed.data);
    return NextResponse.json(
      {
        error: false,
        message: "NIR model created successfully",
        nirModel: newNirModel,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error creating NIR model" },
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
    const deletedNirModel = await deleteNirModel({ id });
    return NextResponse.json(
      {
        error: false,
        message: "NIR model deleted successfully",
        nirModel: deletedNirModel,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error deleting NIR model" },
      { status: 500 }
    );
  }
}
