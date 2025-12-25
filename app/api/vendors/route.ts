import { NextResponse } from "next/server";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import { createVendor, listVendors } from "@server/vendors/service";

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
      type: typeof body.type === "string" ? body.type : undefined,
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
