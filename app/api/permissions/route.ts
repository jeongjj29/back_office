import { NextResponse } from "next/server";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import { deletePermission, listPermissions } from "@server/permissions/service";

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

export async function DELETE(request: Request) {
  try {
    await requirePermission("ROLE_WRITE");
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: { code: "BAD_REQUEST", message: "key is required" } }, { status: 400 });
    }
    await deletePermission(key);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}
