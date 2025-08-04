import { NextResponse } from "next/server";

import {
  deleteCropTrait,
  getCropTraits,
  insertCropTrait,
} from "@/features/traits/db/crop-trait";
import { cropTraitSchema } from "@/features/traits/schemas/crop-trait";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cropIdParam = searchParams.get("cropId");
    if (!cropIdParam) {
      return NextResponse.json(
        { error: true, message: "Missing cropId query parameter" },
        { status: 400 }
      );
    }
    const cropId = Number(cropIdParam);
    const cropTraits = await getCropTraits({ cropId });
    return NextResponse.json({ error: false, cropTraits }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error fetching crop traits" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = cropTraitSchema.safeParse(data);
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
    // TODO: fix ts error
    // @ts-ignore
    const newCropTrait = await insertCropTrait(parsed.data);
    return NextResponse.json(
      {
        error: false,
        message: "Crop trait created successfully",
        cropTrait: newCropTrait,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error creating crop trait" },
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
        { error: true, message: "Missing id query parameter" },
        { status: 400 }
      );
    }
    const id = Number(idParam);
    const deletedCropTrait = await deleteCropTrait({ id });
    return NextResponse.json(
      {
        error: false,
        message: "Crop trait deleted successfully",
        cropTrait: deletedCropTrait,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error deleting crop trait" },
      { status: 500 }
    );
  }
}
