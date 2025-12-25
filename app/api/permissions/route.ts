import { NextResponse } from "next/server";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import { listPermissions } from "@server/permissions/service";

export async function GET() {
  try {
    await requirePermission("ROLE_READ");
    const permissions = await listPermissions();
    return NextResponse.json({ permissions });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}
