import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { comparePassword } from "@/src/lib/password";
import { createSession } from "@/src/lib/auth";

import { loginSchema } from "@/src/validators/auth.schema";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

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

    /*
     * Email verification check.
     */
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

    /*
     * Only verified users get a session.
     */
    await createSession(user.id);

    return NextResponse.json({
      success: true,

      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
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