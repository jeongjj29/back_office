import { NextResponse } from "next/server";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import { createUser, listUsers } from "@server/users/service";

export async function GET() {
  try {
    await requirePermission("USER_READ");
    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("USER_WRITE");
    const body = await request.json().catch(() => ({}));

    const user = await createUser({
      email: typeof body.email === "string" ? body.email : "",
      name: typeof body.name === "string" ? body.name : undefined,
      password: typeof body.password === "string" ? body.password : "",
      roleKey: typeof body.roleKey === "string" ? body.roleKey : "",
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}
