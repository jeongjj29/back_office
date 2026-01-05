import { NextResponse } from "next/server";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import { createVendor, deleteVendor, listVendors, updateVendor } from "@server/vendors/service";
import type { VendorType } from "@generated/prisma/client";

function parsePositiveInt(value: unknown) {
  const num = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isInteger(num) && num > 0 ? num : null;
}

export async function GET() {
  try {
    await requirePermission("VENDOR_READ");
    const vendors = await listVendors();
    return NextResponse.json({ vendors });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("VENDOR_WRITE");
    const body = await request.json().catch(() => ({}));

    const vendor = await createVendor({
      name: typeof body.name === "string" ? body.name : "",
      type: parseVendorType(body.type),
      phone: typeof body.phone === "string" ? body.phone : undefined,
      email: typeof body.email === "string" ? body.email : undefined,
      address: typeof body.address === "string" ? body.address : undefined,
      website: typeof body.website === "string" ? body.website : undefined,
      accountNumber: typeof body.accountNumber === "string" ? body.accountNumber : undefined,
    });

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}

export async function PUT(request: Request) {
  try {
    await requirePermission("VENDOR_WRITE");
    const body = await request.json().catch(() => ({}));
    const id = parsePositiveInt(body.id);
    if (!id) {
      return NextResponse.json({ error: { code: "BAD_REQUEST", message: "id must be a positive integer" } }, { status: 400 });
    }

    const vendor = await updateVendor(id, {
      name: typeof body.name === "string" ? body.name : "",
      type: parseVendorType(body.type),
      phone: typeof body.phone === "string" ? body.phone : undefined,
      email: typeof body.email === "string" ? body.email : undefined,
      address: typeof body.address === "string" ? body.address : undefined,
      website: typeof body.website === "string" ? body.website : undefined,
      accountNumber: typeof body.accountNumber === "string" ? body.accountNumber : undefined,
    });
    return NextResponse.json({ vendor });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}

function parseVendorType(value: unknown): VendorType | undefined {
  if (value === "INVENTORY" || value === "SERVICE" || value === "UTILITY" || value === "OTHER") {
    return value;
  }
  return undefined;
}

export async function DELETE(request: Request) {
  try {
    await requirePermission("VENDOR_WRITE");
    const { searchParams } = new URL(request.url);
    const id = parsePositiveInt(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: { code: "BAD_REQUEST", message: "id is required" } }, { status: 400 });
    }
    await deleteVendor(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}
