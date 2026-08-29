import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/src/lib/prisma";

import {
  getAdminFromSession,
} from "@/src/lib/auth";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;

    const session =
      await getAdminFromSession();

    if (
      !session ||
      session.role !== "USER"
    ) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Only find appointments belonging
     * to the currently logged-in user.
     */
    const appointment =
      await prisma.appointment.findFirst({
        where: {
          id,
          userId: session.id,
        },
      });

    if (!appointment) {
      return NextResponse.json(
        {
          message:
            "Appointment not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * User cannot hide active appointments.
     *
     * They must cancel first.
     */
    const removableStatuses = [
      "CANCELLED",
      "COMPLETED",
      "NO_SHOW",
    ];

    if (
      !removableStatuses.includes(
        appointment.status
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Only cancelled, completed, or no-show appointments can be removed from your dashboard.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * IMPORTANT:
     *
     * We are NOT deleting the appointment.
     *
     * We are only hiding it from the
     * user's dashboard.
     */
    await prisma.appointment.update({
      where: {
        id: appointment.id,
      },

      data: {
        userHiddenAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,

      message:
        "Appointment removed from your dashboard.",
    });
  } catch (error) {
    console.error(
      "Remove appointment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to remove appointment from dashboard.",
      },
      {
        status: 500,
      }
    );
  }
}