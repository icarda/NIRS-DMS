import { NextResponse } from "next/server";

import {
  deleteStudy,
  getStudyByCode,
  insertStudy,
} from "@/features/studies/db/study";
import { studySchema } from "@/features/studies/schemas/study";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studyCode = searchParams.get("studyCode");
    // const qualityLabIdParam = searchParams.get("qualityLabId");

    if (!studyCode) {
      return NextResponse.json(
        {
          error: true,
          message: "Missing studyCode query parameter",
        },
        { status: 400 }
      );
    }

    const study = await getStudyByCode(studyCode);

    if (!study) {
      return NextResponse.json(
        { error: true, message: "Study not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: false, study }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error fetching study" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = studySchema.safeParse(data);
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
    const newStudy = await insertStudy(parsed.data);
    return NextResponse.json(
      {
        error: false,
        message: "Study created successfully",
        study: newStudy,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error creating study" },
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
    const deletedStudy = await deleteStudy({ id });
    return NextResponse.json(
      {
        error: false,
        message: "Study deleted successfully",
        study: deletedStudy,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error deleting study" },
      { status: 500 }
    );
  }
}
