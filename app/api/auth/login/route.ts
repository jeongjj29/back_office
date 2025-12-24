import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { errors, toResponseError } from "@lib/errors";
import { verifyPassword } from "@server/auth/password";
import { createSession } from "@server/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      throw errors.badRequest("Email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw errors.unauthorized("Invalid credentials");
    }

    await prisma.session.deleteMany({
      where: { userId: user.id },
    });
    await createSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.key,
      },
    });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}
