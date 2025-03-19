import { NextResponse } from "next/server";

import {
  deleteQualityLab,
  getQualityLab,
  getQualityLabs,
  insertQualityLab,
  updateQualityLab,
} from "@/features/quality-labs/db/quality-lab";
import { qualityLabSchema } from "@/features/quality-labs/schemas/quality-lab";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");

    if (idParam) {
      const id = Number(idParam);
      const qualityLab = await getQualityLab(id);
      if (!qualityLab) {
        return NextResponse.json(
          { error: true, message: "Quality Lab not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: false, qualityLab }, { status: 200 });
    } else {
      const limitParam = searchParams.get("limit");
      const limit = limitParam ? Number(limitParam) : undefined;
      const qualityLabs = await getQualityLabs({ limit });
      return NextResponse.json({ error: false, qualityLabs }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: true,
        message: error.message || "Error fetching quality labs",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = qualityLabSchema.safeParse(data);
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
    const newQualityLab = await insertQualityLab(parsed.data);
    return NextResponse.json(
      {
        error: false,
        message: "Quality Lab created successfully",
        qualityLab: newQualityLab,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: true,
        message: error.message || "Error creating quality lab",
      },
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
    const parsed = qualityLabSchema.safeParse(data);
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
    const updatedQualityLab = await updateQualityLab({ id }, parsed.data);
    return NextResponse.json(
      {
        error: false,
        message: "Quality Lab updated successfully",
        qualityLab: updatedQualityLab,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: true,
        message: error.message || "Error updating quality lab",
      },
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
    const deletedQualityLab = await deleteQualityLab({ id });
    return NextResponse.json(
      {
        error: false,
        message: "Quality Lab deleted successfully",
        qualityLab: deletedQualityLab,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: true,
        message: error.message || "Error deleting quality lab",
      },
      { status: 500 }
    );
  }
}
