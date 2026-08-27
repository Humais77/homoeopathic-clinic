import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/src/lib/prisma";

import {
  createMeetingToken,
  livekitHost,
} from "@/src/lib/meeting";

import {
  getAdminFromSession,
} from "@/src/lib/auth";

import {
  ensureAppointmentMeeting,
} from "@/src/lib/appointment-meeting";

type Context = {
  params: Promise<{
    appointmentId: string;
  }>;
};

export async function POST(
  request: NextRequest,
  context: Context
) {
  try {
    const { appointmentId } =
      await context.params;

    const session =
      await getAdminFromSession();

    if (!session) {
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
      await prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },

        include: {
          doctor: {
            include: {
              user: true,
            },
          },
        },
      });

    if (!appointment) {
      return NextResponse.json(
        {
          message: "Appointment not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      appointment.status !== "CONFIRMED"
    ) {
      return NextResponse.json(
        {
          message:
            "This appointment is not confirmed.",
        },
        {
          status: 403,
        }
      );
    }

    // Clinic appointments don't use LiveKit
    if (
      appointment.meetingType === "CLINIC"
    ) {
      return NextResponse.json(
        {
          message:
            "This appointment is a clinic visit and does not have an online meeting.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ----------------------------------------------------
     * AUTHORIZATION
     * ----------------------------------------------------
     */

    let allowed = false;

    // ADMIN can join any meeting
    if (session.role === "ADMIN") {
      allowed = true;
    }

    // DOCTOR can only join their own appointments
    if (session.role === "DOCTOR") {
      allowed =
        appointment.doctor.userId ===
        session.id;
    }

    // USER can only join their appointment
    if (session.role === "USER") {
      allowed =
        appointment.userId ===
        session.id;
    }

    /*
     * Legacy appointment support
     */
    if (
      session.role === "USER" &&
      !appointment.userId &&
      session.email !== appointment.email
    ) {
      allowed = false;
    }

    if (!allowed) {
      return NextResponse.json(
        {
          message:
            "You are not allowed to join this meeting.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * ----------------------------------------------------
     * ENSURE MEETING EXISTS
     * ----------------------------------------------------
     *
     * This fixes the problem where an appointment was
     * manually changed to CONFIRMED in the database.
     *
     * It creates:
     *
     * 1. LiveKit room
     * 2. Prisma Meeting record
     */

    const meeting =
      await ensureAppointmentMeeting(
        appointment.id
      );

    if (!meeting) {
      return NextResponse.json(
        {
          message:
            "Unable to create online meeting.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ----------------------------------------------------
     * JOIN WINDOW
     * ----------------------------------------------------
     */

    const appointmentStart =
      appointment.appointmentDate.getTime();

    const now = Date.now();

    const earliestJoin =
      appointmentStart -
      10 * 60 * 1000;

    const latestJoin =
      appointmentStart +
      2 * 60 * 60 * 1000;

    if (now < earliestJoin) {
      return NextResponse.json(
        {
          message:
            "The meeting is not available yet.",
          availableAt:
            new Date(
              earliestJoin
            ).toISOString(),
        },
        {
          status: 403,
        }
      );
    }

    if (now > latestJoin) {
      return NextResponse.json(
        {
          message:
            "The meeting has ended.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * ----------------------------------------------------
     * CREATE LIVEKIT TOKEN
     * ----------------------------------------------------
     */

    const identity =
      `${session.role.toLowerCase()}-${session.id}`;

    const token =
      await createMeetingToken({
        roomName: meeting.roomName,

        identity,

        name:
          session.role === "USER"
            ? appointment.name
            : session.name,

        canPublish: true,
      });

    return NextResponse.json({
      success: true,

      serverUrl: livekitHost,

      token,

      roomName:
        meeting.roomName,

      meetingType:
        appointment.meetingType,
    });
  } catch (error) {
    console.error(
      "Meeting token error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to join meeting.",
      },
      {
        status: 500,
      }
    );
  }
}