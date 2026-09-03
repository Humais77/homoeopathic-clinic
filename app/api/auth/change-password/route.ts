import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/src/lib/prisma";

import {
  requireAuth,
  clearSession,
} from "@/src/lib/auth";

import {
  comparePassword,
  hashPassword,
} from "@/src/lib/password";

import {
  changePasswordSchema,
} from "@/src/validators/auth.schema";

export async function POST(
  request: NextRequest
) {
  try {
    const user =
      await requireAuth();

    const body =
      await request.json();

    const validation =
      changePasswordSchema.safeParse(
        body
      );

    if (!validation.success) {
      return NextResponse.json(
        {
          error:
            "Invalid password details.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      currentPassword,
      newPassword,
    } = validation.data;

    const dbUser =
      await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

    if (!dbUser) {
      return NextResponse.json(
        {
          error:
            "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    const valid =
      await comparePassword(
        currentPassword,
        dbUser.passwordHash
      );

    if (!valid) {
      return NextResponse.json(
        {
          error:
            "Current password is incorrect.",
        },
        {
          status: 400,
        }
      );
    }

    const passwordHash =
      await hashPassword(
        newPassword
      );

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        passwordHash,

        sessionVersion: {
          increment: 1,
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_CHANGED",
        entity: "User",
        entityId: user.id,
      },
    });

    await clearSession();

    return NextResponse.json({
      success: true,
      message:
        "Password changed successfully. Please sign in again.",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "Unauthorized"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to change password.",
      },
      {
        status: 500,
      }
    );
  }
}