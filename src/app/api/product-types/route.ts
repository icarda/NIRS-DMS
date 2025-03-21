import { NextResponse } from "next/server";

import {
  deleteProductType,
  getProductTypes,
  insertProductType,
} from "@/features/studies/db/product-type";
import { productTypeSchema } from "@/features/studies/schemas/product-type";

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
    const productTypes = await getProductTypes(cropId);
    return NextResponse.json({ error: false, productTypes }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error fetching product types" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = productTypeSchema.safeParse(data);
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
    const newProductType = await insertProductType(parsed.data);
    return NextResponse.json(
      {
        error: false,
        message: "Product Type created successfully",
        productType: newProductType,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error creating product type" },
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
    const deletedProductType = await deleteProductType({ id });
    return NextResponse.json(
      {
        error: false,
        message: "Product Type deleted successfully",
        productType: deletedProductType,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || "Error deleting product type" },
      { status: 500 }
    );
  }
}
