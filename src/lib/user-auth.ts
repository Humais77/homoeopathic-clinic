// src/lib/user-auth.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const USER_AUTH_COOKIE = 'user_session';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): Uint8Array {
  const secret = process.env.USER_AUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('USER_AUTH_SECRET is not configured. Please set it in .env');
  }
  return new TextEncoder().encode(secret);
}

export async function createUserSession(userId: string): Promise<void> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(USER_AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION,
  });
}

export async function getUserSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(USER_AUTH_COOKIE);
}

export async function getUserFromSession(): Promise<{ id: string; email: string; name: string; phone?: string | null } | null> {
  const session = await getUserSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, phone: true },
  });

  return user;
}

export async function requireUserAuth(): Promise<{ id: string; email: string; name: string; phone?: string | null }> {
  const user = await getUserFromSession();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function validateUserAuth(): Promise<{ id: string; email: string; name: string; phone?: string | null } | null> {
  return getUserFromSession();
}