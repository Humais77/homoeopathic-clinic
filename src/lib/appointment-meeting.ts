// src/lib/appointment-meeting.ts

import { prisma } from "@/src/lib/prisma";
import { roomService } from "@/src/lib/meeting";

export async function ensureAppointmentMeeting(
  appointmentId: string
) {
  const appointment =
    await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        meeting: true,
      },
    });

  if (!appointment) {
    throw new Error("Appointment not found.");
  }

  // Clinic visits do NOT need LiveKit
  if (appointment.meetingType === "CLINIC") {
    return null;
  }

  const roomName =
    `appointment-${appointment.id}`;

  /*
   * Always make sure the LiveKit room exists.
   *
   * If it already exists, LiveKit will throw.
   * We safely ignore that error.
   */
  try {
    await roomService.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60,
      maxParticipants: 10,
    });
  } catch (error) {
    console.log(
      "LiveKit room already exists or could not be created:",
      error
    );
  }

  /*
   * Make sure the Meeting database record exists.
   *
   * upsert is important because:
   *
   * - appointment may already have a meeting
   * - appointment may have been manually confirmed
   * - multiple users may try to join
   */
  const meeting =
    await prisma.meeting.upsert({
      where: {
        appointmentId: appointment.id,
      },

      create: {
        appointmentId: appointment.id,
        roomName,
        type: appointment.meetingType,
        status: "CREATED",
      },

      update: {
        roomName,
        type: appointment.meetingType,
        status: "CREATED",
      },
    });

  return meeting;
}