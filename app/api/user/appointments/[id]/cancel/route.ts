import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/src/lib/prisma";

import {
  getAdminFromSession,
} from "@/src/lib/auth";

import {
  sendNotification,
} from "@/src/lib/send-notification";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
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

    const appointment =
      await prisma.appointment.findFirst({
        where: {
          id,
          userId: session.id,
        },
        include: {
          doctor: true,
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
     * An appointment that is already cancelled
     * cannot be cancelled again.
     */
    if (
      appointment.status ===
      "CANCELLED"
    ) {
      return NextResponse.json(
        {
          message:
            "Appointment is already cancelled.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Completed and no-show appointments
     * cannot be cancelled.
     */
    if (
      appointment.status ===
        "COMPLETED" ||
      appointment.status ===
        "NO_SHOW"
    ) {
      return NextResponse.json(
        {
          message:
            "This appointment can no longer be cancelled.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Optional safety check:
     * Do not allow cancellation after
     * the appointment time has passed.
     *
     * We are currently only checking the date.
     * You can add exact time validation later.
     */
    const appointmentDate =
      new Date(
        appointment.appointmentDate
      );

    if (
      appointmentDate.getTime() <
      Date.now()
    ) {
      return NextResponse.json(
        {
          message:
            "Past appointments cannot be cancelled.",
        },
        {
          status: 400,
        }
      );
    }

    const updated =
      await prisma.appointment.update({
        where: {
          id: appointment.id,
        },

        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelledBy: "USER",
        },

        include: {
          doctor: true,
          meeting: true,
        },
      });

    /*
     * Notify doctor.
     */
    try {
      await sendNotification({
        doctorId:
          appointment.doctorId,

        appointmentId:
          appointment.id,

        type:
          "APPOINTMENT_CANCELLED",

        title:
          "Appointment cancelled",

        message:
          `${appointment.name} has cancelled their appointment.`,
      });
    } catch (notificationError) {
      console.error(
        "Failed to notify doctor:",
        notificationError
      );
    }

    /*
     * Notify admin.
     */
    try {
      await sendNotification({
        isAdmin: true,

        appointmentId:
          appointment.id,

        type:
          "APPOINTMENT_CANCELLED",

        title:
          "Appointment cancelled",

        message:
          `${appointment.name} has cancelled their appointment with ${appointment.doctor.name}.`,
      });
    } catch (notificationError) {
      console.error(
        "Failed to notify admin:",
        notificationError
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Appointment cancelled successfully.",

      appointment: updated,
    });
  } catch (error) {
    console.error(
      "Cancel appointment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to cancel appointment.",
      },
      {
        status: 500,
      }
    );
  }
}