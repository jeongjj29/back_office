import { NextResponse } from "next/server";
import { clearSession } from "@server/auth/session";
import { toResponseError } from "@lib/errors";

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}
