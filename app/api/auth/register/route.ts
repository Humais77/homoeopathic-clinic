import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/src/lib/prisma";
import {
  hashPassword,
} from "@/src/lib/password";

import {
  sendVerificationEmail,
} from "@/src/lib/email";

import {
  generateVerificationToken,
} from "@/src/lib/email-verification";

import {
  userRegisterSchema,
} from "@/src/validators/auth.schema";

import {
  registerRateLimit,
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
    await registerRateLimit.limit(ip);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error:
          "Too many registration attempts. Please try again later.",
      },
      {
        status: 429,
      }
    );
  }

  try {
    const body =
      await request.json();

    const validation =
      userRegisterSchema.safeParse(
        body
      );

    if (!validation.success) {
      return NextResponse.json(
        {
          error:
            "Invalid registration details.",
          details:
            validation.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const {
      name,
      email,
      password,
      phone,
    } = validation.data;

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const passwordHash =
      await hashPassword(password);

    const {
      token,
      tokenHash,
    } =
      generateVerificationToken();

    const expiresAt =
      new Date(
        Date.now() +
          30 * 60 * 1000
      );

    const user =
      await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          phone: phone || null,

          role: "USER",

          status: "ACTIVE",

          emailVerified: false,

          verifyToken: tokenHash,

          verifyTokenExpiresAt:
            expiresAt,
        },
      });

    try {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        token,
      });
    } catch (emailError) {
      console.error(
        "Verification email failed:",
        emailError
      );

      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });

      return NextResponse.json(
        {
          error:
            "Unable to send verification email. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REGISTRATION",
        entity: "User",
        entityId: user.id,
        ipAddress: ip,
        userAgent:
          getUserAgent(request),
      },
    });

    return NextResponse.json({
      success: true,

      requiresVerification: true,

      email: user.email,

      message:
        "Account created. Please verify your email.",
    });
  } catch (error) {
    console.error(
      "Registration error:",
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