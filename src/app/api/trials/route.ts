import { NextResponse } from "next/server";

import {
  deleteTrial,
  getTrial,
  getTrials,
  insertTrial,
  updateTrial,
} from "@/features/trials/db/trial";
import { trialSchema } from "@/features/trials/schemas/trial";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");

    if (idParam) {
      const id = Number(idParam);
      const trial = await getTrial(id);
      if (!trial) {
        return NextResponse.json(
          { error: true, message: "Trial not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: false, trial }, { status: 200 });
    } else {
      const limitParam = searchParams.get("limit");
      const limit = limitParam ? Number(limitParam) : undefined;
      const trials = await getTrials({ limit });
      return NextResponse.json({ error: false, trials }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error fetching trials" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { fertilizers, ...trialData } = data;

    const parsed = trialSchema.safeParse(trialData);
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

    const newTrial = await insertTrial(parsed.data, fertilizers);
    return NextResponse.json(
      {
        error: false,
        message: "Trial created successfully",
        trial: newTrial,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error creating trial" },
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

    const parsed = trialSchema.partial().safeParse(data);
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
    const updatedTrial = await updateTrial({ id }, parsed.data);
    return NextResponse.json(
      {
        error: false,
        message: "Trial updated successfully",
        trial: updatedTrial,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error updating trial" },
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
    const deletedTrial = await deleteTrial({ id });
    return NextResponse.json(
      {
        error: false,
        message: "Trial deleted successfully",
        trial: deletedTrial,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error deleting trial" },
      { status: 500 }
    );
  }
}
