import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/src/lib/prisma";
import {
  comparePassword,
} from "@/src/lib/password";

import {
  createSession,
} from "@/src/lib/auth";

import {
  loginSchema,
} from "@/src/validators/auth.schema";

import {
  loginRateLimit,
} from "@/src/lib/rate-limit";

import {
  getClientIp,
  getUserAgent,
} from "@/src/lib/security";

export async function POST(
  request: NextRequest
) {
  const ip = getClientIp(request);

  const rateLimit =
    await loginRateLimit.limit(ip);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error:
          "Too many login attempts. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(
            (rateLimit.reset -
              Date.now()) /
              1000
          ).toString(),
        },
      }
    );
  }

  try {
    const body =
      await request.json();

    const validation =
      loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error:
            "Invalid email or password",
        },
        {
          status: 400,
        }
      );
    }

    const {
      email,
      password,
    } = validation.data;

    const normalizedEmail =
      email.toLowerCase().trim();

    const user =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          error:
            "Your account is currently unavailable.",
        },
        {
          status: 403,
        }
      );
    }

    const isValid =
      await comparePassword(
        password,
        user.passwordHash
      );

    if (!isValid) {
      return NextResponse.json(
        {
          error:
            "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error:
            "Please verify your email before signing in.",

          requiresVerification: true,

          email: user.email,
        },
        {
          status: 403,
        }
      );
    }

    await createSession(
      user.id,
      user.sessionVersion
    );

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN_SUCCESS",
        entity: "User",
        entityId: user.id,
        ipAddress: ip,
        userAgent:
          getUserAgent(request),
      },
    });

    return NextResponse.json({
      success: true,

      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        emailVerified:
          user.emailVerified,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}