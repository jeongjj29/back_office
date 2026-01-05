import { NextResponse } from "next/server";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import {
  createProductSpec,
  deleteProductSpec,
  listProductSpecs,
  updateProductSpec,
} from "@server/product-specs/service";

function parsePositiveInt(value: unknown) {
  const num = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isInteger(num) && num > 0 ? num : null;
}

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

    const productId = parsePositiveInt(body.productId);
    const vendorId = parsePositiveInt(body.vendorId);
    const unitId = parsePositiveInt(body.unitId);
    const caseSize = parsePositiveInt(body.caseSize);
    if (!productId || !vendorId || !unitId || !caseSize) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "productId, vendorId, unitId, and caseSize must be positive integers" } },
        { status: 400 },
      );
    }

    const spec = await createProductSpec({
      productId,
      vendorId,
      unitId,
      description: typeof body.description === "string" ? body.description : "",
      caseSize,
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

    const id = parsePositiveInt(body.id);
    const productId = parsePositiveInt(body.productId);
    const vendorId = parsePositiveInt(body.vendorId);
    const unitId = parsePositiveInt(body.unitId);
    const caseSize = parsePositiveInt(body.caseSize);
    if (!id || !productId || !vendorId || !unitId || !caseSize) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "id, productId, vendorId, unitId, and caseSize must be positive integers" } },
        { status: 400 },
      );
    }

    const spec = await updateProductSpec(id, {
      productId,
      vendorId,
      unitId,
      description: typeof body.description === "string" ? body.description : "",
      caseSize,
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
    const id = parsePositiveInt(searchParams.get("id"));
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
