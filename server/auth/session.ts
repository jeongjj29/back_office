import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "@lib/prisma";
import type { User } from "@generated/prisma/client";

export const SESSION_COOKIE = "session_token";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

function hashToken(raw: string): string {
  const salt = Buffer.alloc(0);
  const derived = scryptSync(raw, salt, 64);
  return derived.toString("hex");
}

function tokensMatch(raw: string, hashed: string): boolean {
  const computed = Buffer.from(hashToken(raw), "hex");
  const stored = Buffer.from(hashed, "hex");
  return stored.length === computed.length && timingSafeEqual(stored, computed);
}

export async function createSession(userId: number): Promise<string> {
  const rawToken = randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      token: hashedToken,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return rawToken;
}

export async function clearSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (rawToken) {
    await prisma.session.deleteMany({
      where: { token: hashToken(rawToken) },
    });
  }
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export type CurrentUser = User & {
  role: { key: string; name: string; permissions: { permission: { key: string } }[] };
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) return null;

  const session = await prisma.session.findUnique({
    where: { token: hashToken(rawToken) },
    include: {
      user: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await clearSession();
    return null;
  }

  if (!tokensMatch(rawToken, session.token)) {
    await clearSession();
    return null;
  }

  return session.user as CurrentUser;
}
