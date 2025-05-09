import { NextResponse } from "next/server";

import {
  getCropCommonNames,
  insertCropCommonNames,
} from "@/features/crops/db/cropCommonNames";
import { cropCommonNameSchema } from "@/features/crops/schemas/crop";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cropId: string }> }
) {
  let { cropId: id } = await params;
  try {
    const cropId = Number(id);
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : undefined;
    const commonNames = await getCropCommonNames(cropId);
    return NextResponse.json({ error: false, commonNames }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error fetching common names" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ cropId: string }> }
) {
  let { cropId: id } = await params;
  try {
    const cropId = Number(id);
    const data = await request.json();
    const parsed = cropCommonNameSchema.safeParse(data);
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
    const newCommonName = await insertCropCommonNames(
      cropId,
      parsed.data.map((commonName) => commonName.commonName)
    );
    return NextResponse.json(
      {
        error: false,
        message: "Common name created successfully",
        commonName: newCommonName,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error creating common name" },
      { status: 500 }
    );
  }
}
