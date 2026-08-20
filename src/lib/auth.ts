import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

const AUTH_COOKIE = 'admin_session';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured. Please set it in .env');
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(adminId: string): Promise<void> {
  const token = await new SignJWT({ adminId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION,
  });
}

export async function getSession(): Promise<{ adminId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return { adminId: payload.adminId as string };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

export async function getAdminFromSession(): Promise<{ id: string; email: string; } | null> {
  const session = await getSession();
  if (!session) return null;
  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: { id: true, email: true},
  });

  return admin;
}

export async function requireAuth(): Promise<{ id: string; email: string; }> {
  const admin = await getAdminFromSession();
  if (!admin) {
    throw new Error('Unauthorized');
  }
  return admin;
}

export async function validateAuth(): Promise<{ id: string; email: string; } | null> {
  const session = await getSession();
  if (!session) return null;

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: { id: true, email: true},
  });

  return admin;
}