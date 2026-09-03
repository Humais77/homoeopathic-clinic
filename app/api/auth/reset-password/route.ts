import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/src/lib/prisma";

import {
  hashPassword,
} from "@/src/lib/password";

import {
  hashPasswordResetToken,
} from "@/src/lib/password-reset";

import {
  resetPasswordSchema,
} from "@/src/validators/auth.schema";

import {
  resetPasswordRateLimit,
} from "@/src/lib/rate-limit";

import {
  clearSession,
} from "@/src/lib/auth";

export async function POST(
  request: NextRequest
) {
  const rateLimit =
    await resetPasswordRateLimit.limit(
      request.ip || "unknown"
    );

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error:
          "Too many requests. Please try again later.",
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
      resetPasswordSchema.safeParse(
        body
      );

    if (!validation.success) {
      return NextResponse.json(
        {
          error:
            "Invalid password reset request.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      token,
      password,
    } = validation.data;

    const tokenHash =
      hashPasswordResetToken(token);

    const user =
      await prisma.user.findFirst({
        where: {
          passwordResetToken:
            tokenHash,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired password reset link.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !user.passwordResetTokenExpiresAt ||
      user.passwordResetTokenExpiresAt <
        new Date()
    ) {
      return NextResponse.json(
        {
          error:
            "This password reset link has expired.",
        },
        {
          status: 400,
        }
      );
    }

    const passwordHash =
      await hashPassword(password);

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        passwordHash,

        passwordResetToken: null,

        passwordResetTokenExpiresAt:
          null,

        sessionVersion: {
          increment: 1,
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET",
        entity: "User",
        entityId: user.id,
      },
    });

    await clearSession();

    return NextResponse.json({
      success: true,
      message:
        "Password reset successfully.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to reset password.",
      },
      {
        status: 500,
      }
    );
  }
}