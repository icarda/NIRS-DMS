import { NextRequest, NextResponse } from "next/server";

import {
  deleteTrait,
  getTraitsFiltered,
  insertTrait,
  TraitFilters,
} from "@/features/traits/db/trait";
import { traitSchema } from "@/features/traits/schemas/trait";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const filters: TraitFilters = {};
  try {
    const parseIntParam = (paramName: string): number | undefined => {
      const value = searchParams.get(paramName);
      if (value === null) return undefined;
      const parsed = parseInt(value, 10);

      if (isNaN(parsed)) {
        throw new Error(
          `Invalid '${paramName}' parameter: Must be a whole number.`
        );
      }
      return parsed;
    };

    filters.sampleId = parseIntParam("sampleId");
    filters.year = parseIntParam("year");
    filters.limit = parseIntParam("limit");
    filters.offset = parseIntParam("offset");

    if (filters.limit !== undefined && filters.limit <= 0) {
      throw new Error("Invalid 'limit' parameter: Must be positive.");
    }
    if (filters.offset !== undefined && filters.offset < 0) {
      throw new Error("Invalid 'offset' parameter: Must be non-negative.");
    }

    filters.studyCode = searchParams.get("studyCode") ?? undefined;
    filters.trial = searchParams.get("trial") ?? undefined;
    filters.crop = searchParams.get("crop") ?? undefined;
    filters.trait = searchParams.get("trait") ?? undefined;
    filters.location = searchParams.get("location") ?? undefined;
    filters.qualityLab = searchParams.get("qualityLab") ?? undefined;
    filters.nirModel = searchParams.get("nirModel") ?? undefined;
  } catch (error: any) {
    return NextResponse.json(
      { message: "Invalid query parameter format", error: error.message },
      { status: 400 }
    );
  }

  try {
    const traitData = await getTraitsFiltered(filters);

    return NextResponse.json(traitData, { status: 200 });
  } catch (error: any) {
    console.error("API Error fetching Trait data:", error);

    return NextResponse.json(
      { message: "Failed to fetch Trait data", error: "Internal Server Error" },
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
