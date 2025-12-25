import { NextResponse } from "next/server";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import { createProduct, deleteProduct, listProducts, updateProduct } from "@server/products/service";

export async function GET() {
  try {
    await requirePermission("PRODUCT_READ");
    const products = await listProducts();
    return NextResponse.json({ products });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("PRODUCT_WRITE");
    const body = await request.json().catch(() => ({}));

    const product = await createProduct({
      name: typeof body.name === "string" ? body.name : "",
      nameKr: typeof body.nameKr === "string" ? body.nameKr : undefined,
      categoryId: Number(body.categoryId),
      unitGroupId: Number(body.unitGroupId),
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}

export async function PUT(request: Request) {
  try {
    await requirePermission("PRODUCT_WRITE");
    const body = await request.json().catch(() => ({}));

    const product = await updateProduct(Number(body.id), {
      name: typeof body.name === "string" ? body.name : "",
      nameKr: typeof body.nameKr === "string" ? body.nameKr : undefined,
      categoryId: Number(body.categoryId),
      unitGroupId: Number(body.unitGroupId),
    });

    return NextResponse.json({ product });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await requirePermission("PRODUCT_WRITE");
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: { code: "BAD_REQUEST", message: "id is required" } }, { status: 400 });
    }
    await deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}
