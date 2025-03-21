import { NextResponse } from "next/server";

import {
  deleteUser,
  getUser,
  getUsers,
  insertUser,
  updateUser,
} from "@/features/users/db/users";
import { userSchema } from "@/features/users/schemas/user";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");

    if (idParam) {
      const id = Number(idParam);
      const user = await getUser(id);
      if (!user) {
        return NextResponse.json(
          { error: true, message: "User not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: false, user }, { status: 200 });
    } else {
      const limitParam = searchParams.get("limit");
      const limit = limitParam ? Number(limitParam) : undefined;
      const users = await getUsers({ limit });
      return NextResponse.json({ error: false, users }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error fetching users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = userSchema.safeParse(data);
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
    const newUser = await insertUser(parsed.data);
    return NextResponse.json(
      {
        error: false,
        message: "User created successfully",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error creating user" },
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
    const parsed = userSchema.partial().safeParse(data);
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
    const updatedUser = await updateUser({ id }, parsed.data);
    return NextResponse.json(
      {
        error: false,
        message: "User updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error updating user" },
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
    const deletedUser = await deleteUser({ id });
    return NextResponse.json(
      {
        error: false,
        message: "User deleted successfully",
        user: deletedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error deleting user" },
      { status: 500 }
    );
  }
}
