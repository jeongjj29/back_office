import { NextResponse } from "next/server";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import { createProduct, deleteProduct, listProducts, updateProduct } from "@server/products/service";

function parsePositiveInt(value: unknown) {
  const num = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isInteger(num) && num > 0 ? num : null;
}

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

    const categoryId = parsePositiveInt(body.categoryId);
    const unitGroupId = parsePositiveInt(body.unitGroupId);
    if (!categoryId || !unitGroupId) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "categoryId and unitGroupId must be positive integers" } },
        { status: 400 },
      );
    }

    const product = await createProduct({
      name: typeof body.name === "string" ? body.name : "",
      nameKr: typeof body.nameKr === "string" ? body.nameKr : undefined,
      categoryId,
      unitGroupId,
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

    const id = parsePositiveInt(body.id);
    const categoryId = parsePositiveInt(body.categoryId);
    const unitGroupId = parsePositiveInt(body.unitGroupId);
    if (!id || !categoryId || !unitGroupId) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "id, categoryId, and unitGroupId must be positive integers" } },
        { status: 400 },
      );
    }

    const product = await updateProduct(id, {
      name: typeof body.name === "string" ? body.name : "",
      nameKr: typeof body.nameKr === "string" ? body.nameKr : undefined,
      categoryId,
      unitGroupId,
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
    const id = parsePositiveInt(searchParams.get("id"));
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
