import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { sendVerificationEmail } from "@/src/lib/email";
import { generateVerificationToken } from "@/src/lib/email-verification";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.toLowerCase().trim()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required.",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    /*
     * Don't reveal whether an email exists.
     */
    if (!user) {
      return NextResponse.json({
        success: true,

        message:
          "If an account exists, a verification email has been sent.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        {
          error:
            "This email is already verified.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      token,
      tokenHash,
    } = generateVerificationToken();

    const expiresAt = new Date(
      Date.now() + 30 * 60 * 1000
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        verifyToken: tokenHash,

        verifyTokenExpiresAt: expiresAt,
      },
    });

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token,
    });

    return NextResponse.json({
      success: true,

      message:
        "Verification email sent successfully.",
    });
  } catch (error) {
    console.error(
      "Resend verification error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to send verification email.",
      },
      {
        status: 500,
      }
    );
  }
}