import {
  createNotification,
} from "@/src/lib/notifications";

import {
  publishUserNotification,
  publishDoctorNotification,
  publishAdminNotification,
} from "@/src/lib/realtime";

type Input = {
  userId?: string;
  doctorId?: string;
  isAdmin?: boolean;
  appointmentId?: string;

  type:
    | "APPOINTMENT_CREATED"
    | "APPOINTMENT_CONFIRMED"
    | "APPOINTMENT_CANCELLED"
    | "APPOINTMENT_REMINDER"
    | "MEETING_READY"
    | "MEETING_STARTED"
    | "SYSTEM";

  title: string;
  message: string;
};

export async function sendNotification(
  input: Input
) {
  const notification =
    await createNotification({
      userId: input.userId,
      doctorId: input.doctorId,
      appointmentId:
        input.appointmentId,
      type: input.type,
      title: input.title,
      message: input.message,
    });

  const payload = {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    appointmentId:
      notification.appointmentId,
    createdAt:
      notification.createdAt.toISOString(),
  };

  const tasks: Promise<unknown>[] = [];

  if (input.userId) {
    tasks.push(
      publishUserNotification(
        input.userId,
        payload
      )
    );
  }

  if (input.doctorId) {
    tasks.push(
      publishDoctorNotification(
        input.doctorId,
        payload
      )
    );
  }

  if (input.isAdmin) {
    tasks.push(
      publishAdminNotification(payload)
    );
  }

  await Promise.all(tasks);

  return notification;
}