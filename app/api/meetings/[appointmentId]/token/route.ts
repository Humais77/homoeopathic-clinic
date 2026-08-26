import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/src/lib/prisma";

import {
  createMeetingToken,
  livekitHost,
} from "@/src/lib/meeting";

import {
  getAdminFromSession,
} from "@/src/lib/auth";

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
          meeting: true,
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
          message:
            "Appointment not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      appointment.status !==
      "CONFIRMED"
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

    if (
      appointment.meetingType ===
      "CLINIC"
    ) {
      return NextResponse.json(
        {
          message:
            "This appointment does not have an online meeting.",
        },
        {
          status: 400,
        }
      );
    }

    if (!appointment.meeting) {
      return NextResponse.json(
        {
          message:
            "Meeting room has not been created yet.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Authorization
     *
     * ADMIN -> allowed
     * DOCTOR -> only assigned doctor
     * USER -> only their appointment
     */

    let allowed = false;

    if (
      session.role === "ADMIN"
    ) {
      allowed = true;
    }

    if (
      session.role === "DOCTOR"
    ) {
      allowed =
        appointment.doctor.userId ===
        session.id;
    }

    if (
      session.role === "USER"
    ) {
      allowed =
        appointment.userId ===
        session.id;
    }

    /*
     * Existing legacy appointments may
     * not have userId.
     *
     * In that case we can additionally
     * verify email.
     */

    if (
      session.role === "USER" &&
      !appointment.userId &&
      session.email !==
        appointment.email
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
     * Join window:
     *
     * 10 minutes before appointment
     * until 2 hours after appointment.
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

    if (
      now < earliestJoin
    ) {
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

    if (
      now > latestJoin
    ) {
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

    const identity =
      `${session.role.toLowerCase()}-${session.id}`;

    const token =
      await createMeetingToken({
        roomName:
          appointment.meeting.roomName,

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
        appointment.meeting.roomName,
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
          "Unable to join meeting.",
      },
      {
        status: 500,
      }
    );
  }
}