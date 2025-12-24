import { NextResponse } from "next/server";
import { toResponseError } from "@lib/errors";
import { requireAuth } from "@server/auth/guards";

export async function GET() {
  try {
    const user = await requireAuth();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.key,
        permissions: user.role.permissions.map((link) => link.permission.key),
      },
    });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}
