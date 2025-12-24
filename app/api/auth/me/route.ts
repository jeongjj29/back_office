import { NextResponse } from "next/server";
import { getCurrentUser } from "@server/auth/session";
import { errors, toResponseError } from "@lib/errors";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw errors.unauthorized("Not authenticated");
    }

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
