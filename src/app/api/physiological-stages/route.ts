import { NextResponse } from "next/server";

import {
  deletePhysiologicalStage,
  getPhysiologicalStages,
  insertPhysiologicalStage,
} from "@/features/studies/db/physiological-stage";
import { physiologicalStageSchema } from "@/features/studies/schemas/physiological-stage";

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
    const stages = await getPhysiologicalStages(cropId);
    return NextResponse.json({ error: false, stages }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: true,
        message: error.message || "Error fetching physiological stages",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = physiologicalStageSchema.safeParse(data);
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
    const newStage = await insertPhysiologicalStage(parsed.data);
    return NextResponse.json(
      {
        error: false,
        message: "Physiological stage created successfully",
        stage: newStage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: true,
        message: error.message || "Error creating physiological stage",
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
    const deletedStage = await deletePhysiologicalStage({ id });
    return NextResponse.json(
      {
        error: false,
        message: "Physiological stage deleted successfully",
        stage: deletedStage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: true,
        message: error.message || "Error deleting physiological stage",
      },
      { status: 500 }
    );
  }
}
