import { prisma } from "@/src/lib/prisma";

export type CreateNotificationInput = {
  userId?: string;
  doctorId?: string;
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

export async function createNotification(
  data: CreateNotificationInput
) {
  return prisma.notification.create({
    data,
  });
}