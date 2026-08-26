import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { hashPassword } from "@/src/lib/password";
import { createSession } from "@/src/lib/auth";
import { sendVerificationEmail } from "@/src/lib/email";
import { generateVerificationToken } from "@/src/lib/email-verification";

import { userRegisterSchema } from "@/src/validators/user-auth.schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = userRegisterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
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

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const passwordHash = await hashPassword(password);

    const {
      token,
      tokenHash,
    } = generateVerificationToken();

    const expiresAt = new Date(
      Date.now() + 30 * 60 * 1000
    );

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        phone,
        role: "USER",

        emailVerified: false,

        verifyToken: tokenHash,

        verifyTokenExpiresAt: expiresAt,
      },
    });

    /*
     * Send verification email.
     */
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

      /*
       * Remove account if email could not be sent.
       *
       * This prevents users from having an account
       * that they can never verify.
       */
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

    /*
     * IMPORTANT:
     *
     * Do NOT create login session yet.
     *
     * User must verify email first.
     */

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
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}