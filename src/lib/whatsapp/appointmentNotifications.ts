import { prisma } from "@/src/lib/prisma";

import {
  sendWhatsAppTemplate,
} from "./client";

type AppointmentNotificationInput = {
  appointmentId: string;
  type:
    | "APPOINTMENT_CREATED"
    | "APPOINTMENT_CONFIRMED"
    | "APPOINTMENT_REMINDER"
    | "APPOINTMENT_CANCELLED"
    | "APPOINTMENT_RESCHEDULED"
    | "MEETING_READY";
};

function formatAppointmentDate(
  date: Date
) {
  return date.toLocaleDateString(
    "en-PK",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}

function getTemplateName(
  type: AppointmentNotificationInput["type"]
) {
  switch (type) {
    case "APPOINTMENT_CREATED":
      return "appointment_received";

    case "APPOINTMENT_CONFIRMED":
      return "appointment_confirmed";

    case "APPOINTMENT_REMINDER":
      return "appointment_reminder";

    case "APPOINTMENT_CANCELLED":
      return "appointment_cancelled";

    case "APPOINTMENT_RESCHEDULED":
      return "appointment_rescheduled";

    case "MEETING_READY":
      return "appointment_meeting_ready";

    default:
      return null;
  }
}

export async function sendAppointmentWhatsAppNotification({
  appointmentId,
  type,
}: AppointmentNotificationInput) {
  const appointment =
    await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },

      include: {
        doctor: true,

        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            whatsappOptIn: true,
          },
        },

        meeting: true,
      },
    });

  if (!appointment) {
    throw new Error(
      "Appointment not found."
    );
  }

  const phone =
    appointment.user?.phone?.trim();

  if (!phone) {
    return {
      skipped: true,
      reason: "NO_PHONE",
    };
  }

  if (!appointment.user?.whatsappOptIn) {
    return {
      skipped: true,
      reason: "WHATSAPP_NOT_OPTED_IN",
    };
  }

  const templateName =
    getTemplateName(type);

  if (!templateName) {
    throw new Error(
      "WhatsApp template not configured."
    );
  }

  const appointmentDate =
    formatAppointmentDate(
      appointment.appointmentDate
    );

  const meetingType =
    appointment.meetingType === "CLINIC"
      ? "Clinic Visit"
      : appointment.meetingType ===
          "VIDEO"
        ? "Video Consultation"
        : "Voice Consultation";

  let meetingLink = "";

  if (appointment.meeting?.meetingUrl) {
    meetingLink =
      appointment.meeting.meetingUrl;
  }

  const parameters = [
    appointment.user?.name ||
      appointment.name,

    appointment.doctor.name,

    appointmentDate,

    appointment.appointmentTime,

    meetingType,

    meetingLink ||
      "The clinic will contact you with further details.",
  ];

  const whatsappMessage =
    await prisma.whatsAppMessage.create({
      data: {
        userId:
          appointment.userId,

        appointmentId:
          appointment.id,

        phone,

        type,

        status: "PENDING",

        templateName,

        message:
          `Appointment notification: ${appointmentDate} ${appointment.appointmentTime}`,
      },
    });

  try {
    const result =
      await sendWhatsAppTemplate({
        to: phone,

        templateName,

        languageCode:
          process.env
            .WHATSAPP_TEMPLATE_LANGUAGE ||
          "en_US",

        parameters,
      });

    const providerId =
      result?.messages?.[0]?.id ||
      null;

    await prisma.whatsAppMessage.update({
      where: {
        id: whatsappMessage.id,
      },

      data: {
        status: "SENT",

        providerId,

        sentAt: new Date(),
      },
    });

    return {
      success: true,
      providerId,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "WhatsApp notification failed.";

    await prisma.whatsAppMessage.update({
      where: {
        id: whatsappMessage.id,
      },

      data: {
        status: "FAILED",
        errorMessage,
      },
    });

    console.error(
      "WhatsApp appointment notification error:",
      error
    );

    return {
      success: false,
      error: errorMessage,
    };
  }
}