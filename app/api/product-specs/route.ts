import { NextResponse } from "next/server";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import {
  createProductSpec,
  deleteProductSpec,
  listProductSpecs,
  updateProductSpec,
} from "@server/product-specs/service";

export async function GET() {
  try {
    await requirePermission("PRODUCT_READ");
    const specs = await listProductSpecs();
    return NextResponse.json({ specs });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("PRODUCT_WRITE");
    const body = await request.json().catch(() => ({}));

    const spec = await createProductSpec({
      productId: Number(body.productId),
      vendorId: Number(body.vendorId),
      unitId: Number(body.unitId),
      description: typeof body.description === "string" ? body.description : "",
      caseSize: Number(body.caseSize),
      unitSize: typeof body.unitSize === "string" ? body.unitSize : 0,
      brand: typeof body.brand === "string" ? body.brand : undefined,
      sku: typeof body.sku === "string" ? body.sku : undefined,
    });

    return NextResponse.json({ spec }, { status: 201 });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}

export async function PUT(request: Request) {
  try {
    await requirePermission("PRODUCT_WRITE");
    const body = await request.json().catch(() => ({}));

    const spec = await updateProductSpec(Number(body.id), {
      productId: Number(body.productId),
      vendorId: Number(body.vendorId),
      unitId: Number(body.unitId),
      description: typeof body.description === "string" ? body.description : "",
      caseSize: Number(body.caseSize),
      unitSize: typeof body.unitSize === "string" ? body.unitSize : 0,
      brand: typeof body.brand === "string" ? body.brand : undefined,
      sku: typeof body.sku === "string" ? body.sku : undefined,
    });

    return NextResponse.json({ spec });
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
    await deleteProductSpec(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}
