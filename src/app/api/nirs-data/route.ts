import { NextResponse, type NextRequest } from "next/server";

import {
  getNirsDataFiltered,
  NirsDataFilters,
} from "@/features/nirs-data/db/nirs-data";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const filters: NirsDataFilters = {};
  try {
    const parseIntParam = (paramName: string): number | undefined => {
      const value = searchParams.get(paramName);
      if (value === null) return undefined;
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) {
        throw new Error(`Invalid '${paramName}' parameter: Must be a number.`);
      }
      return parsed;
    };

    filters.studyCode =
      searchParams.get("studyCode")?.replaceAll(" ", "+") ?? undefined;
    filters.trial = searchParams.get("trial") ?? undefined;
    filters.crop = searchParams.get("crop") ?? undefined;
    filters.species = searchParams.get("species") ?? undefined;
    filters.sampleId = parseIntParam("sampleId");
    filters.gid = parseIntParam("gid");
    filters.plotId = parseIntParam("plotId");
    filters.year = parseIntParam("year");
    filters.qualityLab = searchParams.get("qualityLab") ?? undefined;
    filters.nirModel = searchParams.get("nirModel") ?? undefined;
    filters.minWavelength = parseIntParam("minWavelength");
    filters.maxWavelength = parseIntParam("maxWavelength");
    filters.limit = parseIntParam("limit");
    filters.offset = parseIntParam("offset");

    if (filters.limit !== undefined && filters.limit <= 0)
      throw new Error("Invalid 'limit': Must be positive.");
    if (filters.offset !== undefined && filters.offset < 0)
      throw new Error("Invalid 'offset': Must be non-negative.");

    filters.location = searchParams.get("location") ?? undefined;
  } catch (error: any) {
    return NextResponse.json(
      { message: "Invalid query parameter format", error: error.message },
      { status: 400 }
    );
  }

  try {
    console.log("Filters:", filters);
    const nirsData = await getNirsDataFiltered(filters);

    return NextResponse.json(nirsData, { status: 200 });
  } catch (error: any) {
    console.error("API Error fetching NIRS data:", error);

    return NextResponse.json(
      { message: "Failed to fetch NIRS data", error: error.message },
      { status: 500 }
    );
  }
}
