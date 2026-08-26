import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/src/lib/prisma";
import {
  createAppointmentSchema,
} from "@/src/lib/validations/appointment";

import {
  sendNotification,
} from "@/src/lib/send-notification";
import {
  getAdminFromSession,
} from "@/src/lib/auth";

function normalizeMeetingType(
  value: string
) {
  if (value === "online") {
    return "VIDEO" as const;
  }

  if (value === "video") {
    return "VIDEO" as const;
  }

  if (value === "voice") {
    return "VOICE" as const;
  }

  return "CLINIC" as const;
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const result =
      createAppointmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid appointment information.",
          errors:
            result.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const data = result.data;

    const appointmentDate =
      new Date(data.appointmentDate);

    if (
      Number.isNaN(
        appointmentDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid appointment date.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      appointmentDate.getTime() <
      Date.now()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Appointment date cannot be in the past.",
        },
        {
          status: 400,
        }
      );
    }

    const doctor =
      await prisma.doctor.findFirst({
        where: {
          id: data.doctorId,
          isActive: true,
        },
      });

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected doctor is not available.",
        },
        {
          status: 404,
        }
      );
    }

    const existing =
      await prisma.appointment.findFirst({
        where: {
          doctorId: data.doctorId,
          appointmentDate,
          appointmentTime:
            data.appointmentTime,
          status: {
            in: [
              "PENDING",
              "CONFIRMED",
            ],
          },
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This appointment slot is already booked.",
        },
        {
          status: 409,
        }
      );
    }

    const meetingType =
      normalizeMeetingType(
        data.meetingType
      );
      
    const session =
      await getAdminFromSession();

    const appointment =
      await prisma.appointment.create({
        data: {
          name: data.name,
          email: data.email,
          concerns: data.concerns,
          meetingType,
          appointmentDate,
          appointmentTime:
            data.appointmentTime,
          doctorId: doctor.id,
          userId:
            session?.role === "USER"
              ? session.id
              : undefined,
          status: "PENDING",
        },
      });

    // Send notification (wrap in try-catch so it doesn't break the response)
    try {
      await sendNotification({
        doctorId: doctor.id,
        isAdmin: true,
        appointmentId:
          appointment.id,
        type: "APPOINTMENT_CREATED",
        title: "New appointment request",
        message:
          `${appointment.name} requested a ${meetingType.toLowerCase()} appointment.`,
      });
    } catch (notificationError) {
      console.error(
        "Failed to send notification:",
        notificationError
      );
      // Continue even if notification fails
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Appointment request submitted successfully.",
        appointment,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Appointment creation error:",
      error
    );

    // Always return a proper JSON response
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while booking the appointment.",
      },
      {
        status: 500,
      }
    );
  }
}