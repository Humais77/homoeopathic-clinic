import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/src/lib/prisma";

import {
  requireAdmin,
} from "@/src/lib/auth";

import {
  sendNotification,
} from "@/src/lib/send-notification";

import {
  scheduleAppointmentReminders,
} from "@/src/lib/inngest/scheduleAppointmentReminders";

import {
  ensureAppointmentMeeting,
} from "@/src/lib/appointment-meeting";

import {
  createAuditLog,
} from "@/src/lib/audit";

type Context = {
  params: Promise<{
    id: string;
  }>;
};
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Safepay webhook endpoint is reachable",
  });
}
export async function POST(
  request: NextRequest,
  context: Context
) {
  try {
    /*
     * --------------------------------------------------
     * ADMIN AUTHORIZATION
     * --------------------------------------------------
     */

    const admin =
      await requireAdmin();

    const { id } =
      await context.params;

    /*
     * --------------------------------------------------
     * GET APPOINTMENT
     * --------------------------------------------------
     */

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

          payment: true,

          meeting: true,
        },
      });

    if (!appointment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Appointment not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * --------------------------------------------------
     * STATUS VALIDATION
     * --------------------------------------------------
     */

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
          success: false,
          message:
            "This appointment cannot be confirmed.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Already confirmed.
     */

    if (
      appointment.status ===
      "CONFIRMED"
    ) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Appointment is already confirmed.",
          appointment,
          meeting:
            appointment.meeting,
        }
      );
    }

    /*
     * --------------------------------------------------
     * PAYMENT VALIDATION
     * --------------------------------------------------
     *
     * Clinic appointments don't need online payment
     * validation here if you decide to allow them
     * without payment.
     *
     * Online appointments MUST be paid.
     */

    if (
      appointment.meetingType !==
        "CLINIC" &&
      appointment.payment?.status !==
        "PAID"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This appointment cannot be confirmed until payment is completed.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * --------------------------------------------------
     * CLINIC APPOINTMENT
     * --------------------------------------------------
     */

    if (
      appointment.meetingType ===
      "CLINIC"
    ) {
      const updated =
        await prisma.appointment.update(
          {
            where: {
              id,
            },

            data: {
              status: "CONFIRMED",
            },

            include: {
              doctor: true,
              user: true,
              payment: true,
              meeting: true,
            },
          }
        );

      await scheduleAppointmentReminders(
        appointment.id,
        appointment.appointmentDate
      );

      /*
       * Audit log.
       */

      await createAuditLog({
        userId: admin.id,

        action:
          "APPOINTMENT_CONFIRMED",

        entity:
          "Appointment",

        entityId:
          appointment.id,

        metadata: {
          meetingType:
            appointment.meetingType,

          paymentStatus:
            appointment.payment?.status ??
            "NOT_REQUIRED",

          meetingProvider:
            "NONE",
        },
      });

      /*
       * Patient notification.
       */

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
            `Your clinic appointment with ${appointment.doctor.name} has been confirmed.`,
        });
      }

      /*
       * Doctor notification.
       */

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

      /*
       * Admin notification.
       */

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

        appointment:
          updated,

        meeting: null,
      });
    }

    /*
     * --------------------------------------------------
     * ONLINE APPOINTMENT
     * --------------------------------------------------
     *
     * Payment is PAID at this point.
     *
     * Now create the actual meeting.
     */

    const meeting =
      await ensureAppointmentMeeting(
        appointment.id
      );

    /*
     * --------------------------------------------------
     * CONFIRM APPOINTMENT
     * --------------------------------------------------
     */

    const updated =
      await prisma.appointment.update({
        where: {
          id,
        },

        data: {
          status:
            "CONFIRMED",
        },

        include: {
          doctor: true,
          user: true,
          payment: true,
          meeting: true,
        },
      });

    /*
     * --------------------------------------------------
     * REMINDERS
     * --------------------------------------------------
     */

    await scheduleAppointmentReminders(
      appointment.id,
      appointment.appointmentDate
    );

    /*
     * --------------------------------------------------
     * AUDIT LOG
     * --------------------------------------------------
     */

    await createAuditLog({
      userId: admin.id,

      action:
        "APPOINTMENT_CONFIRMED",

      entity:
        "Appointment",

      entityId:
        appointment.id,

      metadata: {
        meetingType:
          appointment.meetingType,

        meetingProvider:
          meeting?.provider ??
          appointment.connectionProvider,

        paymentStatus:
          appointment.payment?.status,

        paymentId:
          appointment.payment?.id ??
          null,

        doctorId:
          appointment.doctorId,
      },
    });

    /*
     * --------------------------------------------------
     * PATIENT NOTIFICATIONS
     * --------------------------------------------------
     */

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

        type:
          "MEETING_READY",

        title:
          "Your meeting is ready",

        message:
          "Your private meeting room has been created.",
      });
    }

    /*
     * --------------------------------------------------
     * DOCTOR NOTIFICATION
     * --------------------------------------------------
     */

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

    /*
     * --------------------------------------------------
     * ADMIN NOTIFICATION
     * --------------------------------------------------
     */

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

      appointment:
        updated,

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