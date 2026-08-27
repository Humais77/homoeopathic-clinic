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

  // Physical clinic appointment
  // does not need LiveKit.
  if (appointment.meetingType === "CLINIC") {
    return null;
  }

  const roomName =
    `appointment-${appointment.id}`;

  /*
   * Make sure the LiveKit room exists.
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
   * Create the database meeting record.
   *
   * Upsert prevents duplicate Meeting records
   * if two requests happen at nearly the same time.
   */
  const meeting =
    await prisma.meeting.upsert({
      where: {
        appointmentId,
      },
      create: {
        appointmentId,
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