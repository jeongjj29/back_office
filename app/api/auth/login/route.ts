import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { errors, toResponseError } from "@lib/errors";
import { verifyPassword } from "@server/auth/password";
import { createSession } from "@server/auth/session";

function serializeUser(user: {
  id: number;
  email: string;
  name: string | null;
  role: {
    key: string;
    name: string;
    permissions: { permission: { key: string } }[];
  };
  createdAt: Date;
}) {
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

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      throw errors.validation("Email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw errors.unauthorized("Invalid email or password");
    }

    await createSession(user.id);

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}
