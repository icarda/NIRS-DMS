import { NextResponse } from "next/server";

import {
  deleteTrait,
  getTraits,
  insertTrait,
} from "@/features/traits/db/trait";
import { traitSchema } from "@/features/traits/schemas/trait";

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
    const traits = await getTraits({ cropId });
    return NextResponse.json({ error: false, traits }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error fetching traits" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = traitSchema.safeParse(data);
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
    const newTrait = await insertTrait(parsed.data);
    return NextResponse.json(
      {
        error: false,
        message: "Trait created successfully",
        trait: newTrait,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error creating trait" },
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
    const deletedTrait = await deleteTrait({ id });
    return NextResponse.json(
      {
        error: false,
        message: "Trait deleted successfully",
        trait: deletedTrait,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error deleting trait" },
      { status: 500 }
    );
  }
}
