import { NextResponse } from "next/server";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import { listRoles } from "@server/roles/service";

export async function GET() {
  try {
    await requirePermission("ROLE_READ");
    const roles = await listRoles();
    return NextResponse.json({ roles });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}
