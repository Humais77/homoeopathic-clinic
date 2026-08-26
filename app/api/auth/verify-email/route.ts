import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { hashVerificationToken } from "@/src/lib/email-verification";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const token = body.token;

    if (
      !token ||
      typeof token !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Invalid verification token.",
        },
        {
          status: 400,
        }
      );
    }

    const tokenHash =
      hashVerificationToken(token);

    const user =
      await prisma.user.findFirst({
        where: {
          verifyToken: tokenHash,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired verification link.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      user.emailVerified
    ) {
      return NextResponse.json({
        success: true,

        alreadyVerified: true,

        message:
          "Your email is already verified.",
      });
    }

    if (
      !user.verifyTokenExpiresAt ||
      user.verifyTokenExpiresAt < new Date()
    ) {
      return NextResponse.json(
        {
          error:
            "This verification link has expired.",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        emailVerified: true,

        /*
         * Delete token after successful verification.
         */
        verifyToken: null,

        verifyTokenExpiresAt: null,
      },
    });

    return NextResponse.json({
      success: true,

      message:
        "Email verified successfully.",
    });
  } catch (error) {
    console.error(
      "Email verification error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to verify email.",
      },
      {
        status: 500,
      }
    );
  }
}