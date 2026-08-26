import { inngest } from "./client";

export async function scheduleAppointmentReminders(
  appointmentId: string,
  appointmentDate: Date
) {
  const oneHourBefore =
    appointmentDate.getTime() -
    60 * 60 * 1000;

  const tenMinutesBefore =
    appointmentDate.getTime() -
    10 * 60 * 1000;

  const now = Date.now();

  if (
    oneHourBefore > now
  ) {
    await inngest.send({
      name:
        "appointment/reminder.requested",

      data: {
        appointmentId,
        reminderType:
          "ONE_HOUR",
      },

      ts: oneHourBefore,
    });
  }

  if (
    tenMinutesBefore > now
  ) {
    await inngest.send({
      name:
        "appointment/reminder.requested",

      data: {
        appointmentId,
        reminderType:
          "TEN_MINUTES",
      },

      ts: tenMinutesBefore,
    });
  }
}