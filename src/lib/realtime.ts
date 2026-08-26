import { ably } from "@/src/lib/ably";

export type RealtimeNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  appointmentId?: string | null;
  createdAt: string;
};

export async function publishUserNotification(
  userId: string,
  notification: RealtimeNotification
) {
  const channel = ably.channels.get(
    `user:${userId}:notifications`
  );

  await channel.publish(
    "notification",
    notification
  );
}

export async function publishDoctorNotification(
  doctorId: string,
  notification: RealtimeNotification
) {
  const channel = ably.channels.get(
    `doctor:${doctorId}:notifications`
  );

  await channel.publish(
    "notification",
    notification
  );
}

export async function publishAdminNotification(
  notification: RealtimeNotification
) {
  const channel = ably.channels.get(
    "admins:notifications"
  );

  await channel.publish(
    "notification",
    notification
  );
}