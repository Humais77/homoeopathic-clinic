import { inngest } from "./client";

import { prisma } from "@/src/lib/prisma";

import {
  sendNotification,
} from "@/src/lib/send-notification";

export const appointmentReminder =
  inngest.createFunction(
    {
      id: "appointment-reminder",
      triggers: {
        event:
          "appointment/reminder.requested",
      },
    },

    async ({ event, step }) => {
      const {
        appointmentId,
        reminderType,
      } = event.data;

      const appointment =
        await step.run(
          "load-appointment",
          async () => {
            return prisma.appointment.findUnique(
              {
                where: {
                  id: appointmentId,
                },
                include: {
                  doctor: {
                    include: {
                      user: true,
                    },
                  },
                  user: true,
                },
              }
            );
          }
        );

      if (!appointment) {
        return {
          skipped: true,
          reason:
            "Appointment not found",
        };
      }

      if (
        appointment.status !==
        "CONFIRMED"
      ) {
        return {
          skipped: true,
          reason:
            "Appointment is not confirmed",
        };
      }

      await step.run(
        "send-reminder",
        async () => {
          const message =
            reminderType ===
            "TEN_MINUTES"
              ? `Your appointment with ${appointment.doctor.name} starts in 10 minutes.`
              : `Your appointment with ${appointment.doctor.name} starts in 1 hour.`;

          if (appointment.userId) {
            await sendNotification({
              userId:
                appointment.userId,
              appointmentId:
                appointment.id,
              type:
                "APPOINTMENT_REMINDER",
              title:
                "Upcoming appointment",
              message,
            });
          }

          await sendNotification({
            doctorId:
              appointment.doctorId,
            appointmentId:
              appointment.id,
            type:
              "APPOINTMENT_REMINDER",
            title:
              "Upcoming appointment",
            message:
              `Appointment with ${appointment.name} is approaching.`,
          });

          await sendNotification({
            isAdmin: true,
            appointmentId:
              appointment.id,
            type:
              "APPOINTMENT_REMINDER",
            title:
              "Upcoming appointment",
            message:
              `Appointment with ${appointment.name} is approaching.`,
          });
        }
      );

      return {
        success: true,
        appointmentId,
        reminderType,
      };
    }
  );