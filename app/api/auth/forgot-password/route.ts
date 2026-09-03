import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/src/lib/prisma";

import {
  generatePasswordResetToken,
} from "@/src/lib/password-reset";

import {
  sendPasswordResetEmail,
} from "@/src/lib/email";

import {
  forgotPasswordSchema,
} from "@/src/validators/auth.schema";

import {
  forgotPasswordRateLimit,
} from "@/src/lib/rate-limit";

import {
  getClientIp,
} from "@/src/lib/security";

export async function POST(
  request: NextRequest
) {
  const ip = getClientIp(request);

  const rateLimit =
    await forgotPasswordRateLimit.limit(
      ip
    );

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        message:
          "If an account exists, a password reset email has been sent.",
      }
    );
  }

  try {
    const body =
      await request.json();

    const validation =
      forgotPasswordSchema.safeParse(
        body
      );

    if (!validation.success) {
      return NextResponse.json(
        {
          message:
            "If an account exists, a password reset email has been sent.",
        }
      );
    }

    const email =
      validation.data.email
        .toLowerCase()
        .trim();

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    /*
     * Always return the same response.
     * This prevents account enumeration.
     */
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists, a password reset email has been sent.",
      });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists, a password reset email has been sent.",
      });
    }

    if (!user.emailVerified) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists, a password reset email has been sent.",
      });
    }

    const {
      token,
      tokenHash,
    } =
      generatePasswordResetToken();

    const expiresAt =
      new Date(
        Date.now() +
          30 * 60 * 1000
      );

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        passwordResetToken:
          tokenHash,

        passwordResetTokenExpiresAt:
          expiresAt,
      },
    });

    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      token,
    });

    return NextResponse.json({
      success: true,
      message:
        "If an account exists, a password reset email has been sent.",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return NextResponse.json({
      success: true,
      message:
        "If an account exists, a password reset email has been sent.",
    });
  }
}