import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/src/lib/prisma";

import {
  sendNotification,
} from "@/src/lib/send-notification";
import {
  scheduleAppointmentReminders,
} from "@/src/lib/inngest/scheduleAppointmentReminders";
import { ensureAppointmentMeeting } from "@/src/lib/appointment-meeting";
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
    const { id } =
      await context.params;

    const appointment =
      await prisma.appointment.findUnique({
        where: {
          id,
        },
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
          user: true,
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
  appointment.status ===
    "CANCELLED" ||
  appointment.status ===
    "COMPLETED" ||
  appointment.status ===
    "NO_SHOW"
) {
  return NextResponse.json(
    {
      message:
        "This appointment cannot be confirmed.",
    },
    {
      status: 400,
    }
  );
}

    if (appointment.meetingType === "CLINIC") {
  const updated = await prisma.appointment.update({
    where: {
      id,
    },
    data: {
      status: "CONFIRMED",
    },
  });

  await scheduleAppointmentReminders(
    appointment.id,
    appointment.appointmentDate
  );

  return NextResponse.json({
    success: true,
    appointment: updated,
    meeting: null,
  });
}

const meeting = await ensureAppointmentMeeting(
  appointment.id
);

const updated = await prisma.appointment.update({
  where: {
    id,
  },
  data: {
    status: "CONFIRMED",
  },
  include: {
    doctor: true,
    user: true,
    meeting: true,
  },
});

await scheduleAppointmentReminders(
  appointment.id,
  appointment.appointmentDate
);
    if (appointment.userId) {
      await sendNotification({
        userId:
          appointment.userId,
        appointmentId:
          appointment.id,
        type:
          "APPOINTMENT_CONFIRMED",
        title:
          "Appointment confirmed",
        message:
          `Your appointment with ${appointment.doctor.name} has been confirmed.`,
      });

      await sendNotification({
        userId:
          appointment.userId,
        appointmentId:
          appointment.id,
        type: "MEETING_READY",
        title:
          "Your meeting is ready",
        message:
          "Your private meeting room has been created.",
      });
    }

    await sendNotification({
      doctorId:
        appointment.doctorId,
      appointmentId:
        appointment.id,
      type:
        "APPOINTMENT_CONFIRMED",
      title:
        "Appointment confirmed",
      message:
        `Appointment with ${appointment.name} is confirmed.`,
    });

    await sendNotification({
      isAdmin: true,
      appointmentId:
        appointment.id,
      type:
        "APPOINTMENT_CONFIRMED",
      title:
        "Appointment confirmed",
      message:
        `Appointment with ${appointment.name} is confirmed.`,
    });

    return NextResponse.json({
      success: true,
      appointment: updated,
      meeting,
    });
  } catch (error) {
    console.error(
      "Confirm appointment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to confirm appointment.",
      },
      {
        status: 500,
      }
    );
  }
}