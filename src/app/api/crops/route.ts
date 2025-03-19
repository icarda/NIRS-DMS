import { NextResponse } from "next/server";

import {
  deleteCrop,
  getCrops,
  insertCrop,
  updateCrop,
} from "@/features/crops/db/crop";
import { cropSchema } from "@/features/crops/schemas/crop";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : undefined;
    const crops = await getCrops({ limit });
    return NextResponse.json({ error: false, crops }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error fetching crops" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = cropSchema.safeParse(data);
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
    const newCrop = await insertCrop(parsed.data);
    return NextResponse.json(
      {
        error: false,
        message: "Crop created successfully",
        crop: newCrop,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error creating crop" },
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

    const parsed = cropSchema.safeParse(data);
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
    const updatedCrop = await updateCrop({ id }, parsed.data);
    return NextResponse.json(
      {
        error: false,
        message: "Crop updated successfully",
        crop: updatedCrop,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error updating crop" },
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
    const deletedCrop = await deleteCrop({ id });
    return NextResponse.json(
      {
        error: false,
        message: "Crop deleted successfully",
        crop: deletedCrop,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error deleting crop" },
      { status: 500 }
    );
  }
}
