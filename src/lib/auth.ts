import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { AUTH_SECRET } from "./env";
import { prisma } from "./prisma";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
};

const COOKIE = "cp_session";

function secret() {
  return new TextEncoder().encode(AUTH_SECRET);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

// cache() keeps this to a single cookie read + single query per request even
// though the layout and the page both ask for the session.
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  let id: string;
  let issuedAt: number | null = null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.id !== "string") return null;
    id = payload.id;
    issuedAt = typeof payload.iat === "number" ? payload.iat : null;
  } catch {
    return null;
  }

  // The token is valid for 14 days, so trusting its claims would keep deleted
  // or demoted accounts authorised until it expired. Re-read the user instead
  // and treat the database as the source of truth for identity and role.
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, passwordChangedAt: true },
    });
    if (!user) return null;

    // A password change must sign out cookies issued before it, otherwise a
    // stolen 14-day token would outlive the rotation meant to revoke it.
    if (user.passwordChangedAt) {
      if (issuedAt === null) return null;
      // iat has one-second resolution, so allow a second of slack to avoid
      // logging out the session created immediately after the change.
      if (issuedAt * 1000 < user.passwordChangedAt.getTime() - 1000) return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role === "ADMIN" ? "ADMIN" : "EDITOR",
    };
  } catch {
    // Fail closed: no session rather than an unauthenticated admin surface.
    return null;
  }
});

export async function requireUser() {
  const user = await getSession();
  if (!user) return null;
  return user;
}

export async function requireAdmin() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  const session: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "ADMIN" ? "ADMIN" : "EDITOR",
  };
  await createSession(session);
  return session;
}
