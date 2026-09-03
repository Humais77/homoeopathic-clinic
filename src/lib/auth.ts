import {
  SignJWT,
  jwtVerify,
} from "jose";

import { cookies } from "next/headers";

import { prisma } from "./prisma";

const AUTH_COOKIE = "session";

const SESSION_DURATION =
  60 * 60 * 24 * 7;

export type UserRole =
  | "USER"
  | "ADMIN"
  | "DOCTOR";

export type UserStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "DISABLED";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
};

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not configured"
    );
  }

  if (secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be at least 32 characters"
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createSession(
  userId: string,
  sessionVersion: number
) {
  const token = await new SignJWT({
    userId,
    sessionVersion,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt()
    .setExpirationTime(
      `${SESSION_DURATION}s`
    )
    .sign(getSecretKey());

  const cookieStore = await cookies();

  cookieStore.set(
    AUTH_COOKIE,
    token,
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge: SESSION_DURATION,
    }
  );
}

export async function getSession(): Promise<{
  userId: string;
  sessionVersion: number;
} | null> {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } =
      await jwtVerify(
        token,
        getSecretKey()
      );

    if (
      typeof payload.userId !==
      "string"
    ) {
      return null;
    }

    if (
      typeof payload.sessionVersion !==
      "number"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      sessionVersion:
        payload.sessionVersion,
    };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.set(
    AUTH_COOKIE,
    "",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    }
  );
}

export async function getCurrentUser(): Promise<
  AuthUser | null
> {
  const session =
    await getSession();

  if (!session) {
    return null;
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: session.userId,
      },

      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        sessionVersion: true,
      },
    });

  if (!user) {
    return null;
  }

  if (
    user.sessionVersion !==
    session.sessionVersion
  ) {
    return null;
  }

  if (user.status !== "ACTIVE") {
    return null;
  }

  if (!user.emailVerified) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    status: user.status,
    emailVerified:
      user.emailVerified,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user =
    await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user =
    await requireAuth();

  if (user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return user;
}

export async function requireDoctor(): Promise<AuthUser> {
  const user =
    await requireAuth();

  if (user.role !== "DOCTOR") {
    throw new Error("Forbidden");
  }

  return user;
}

export async function requireUser(): Promise<AuthUser> {
  const user =
    await requireAuth();

  if (user.role !== "USER") {
    throw new Error("Forbidden");
  }

  return user;
}

export async function revokeAllSessions(
  userId: string
) {
  await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      sessionVersion: {
        increment: 1,
      },
    },
  });

  await clearSession();
}