import { NextResponse } from "next/server";
import { clearSession } from "@server/auth/session";
import { requireAuth } from "@server/auth/guards";

export async function POST() {
  await requireAuth();
  await clearSession();
  return NextResponse.json({ ok: true });
}
