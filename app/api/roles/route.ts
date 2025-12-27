import { NextResponse } from "next/server";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import { deleteRole, listRoles, updateRolePermissions } from "@server/roles/service";

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

export async function PUT(request: Request) {
  try {
    await requirePermission("ROLE_WRITE");
    const body = await request.json().catch(() => ({}));
    const role = await updateRolePermissions(
      typeof body.key === "string" ? body.key : "",
      Array.isArray(body.permissions) ? body.permissions.filter((p) => typeof p === "string") : [],
    );
    return NextResponse.json({ role });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await requirePermission("ROLE_WRITE");
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: { code: "BAD_REQUEST", message: "key is required" } }, { status: 400 });
    }
    await deleteRole(key);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}
