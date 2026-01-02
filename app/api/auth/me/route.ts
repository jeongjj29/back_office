import { NextResponse } from "next/server";
import { getCurrentUser } from "@server/auth/session";
import { errors, toResponseError } from "@lib/errors";

function serializeUser(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: {
      key: user.role.key,
      name: user.role.name,
      permissions: user.role.permissions.map((link) => link.permission.key),
    },
    createdAt: user.createdAt,
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw errors.unauthorized("Not authenticated");
    }
    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}
