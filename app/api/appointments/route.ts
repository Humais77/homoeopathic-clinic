// app/api/appointments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { createZoomMeeting } from "@/src/lib/meetings/zoom";
import { createGoogleMeet } from "@/src/lib/meetings/googleMeet";
import { roomService } from "@/src/lib/meeting";

type ConnectionMethod = "zoom" | "google_meet" | "livekit" | null;
type FrontendMeetingType = "clinic" | "video" | "voice";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in to book an appointment." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      meetingType,
      connectionMethod,
      appointmentDate,
      appointmentTime,
      concerns,
      doctorId,
    } = body as {
      name?: string;
      email?: string;
      meetingType?: FrontendMeetingType;
      connectionMethod?: ConnectionMethod;
      appointmentDate?: string;
      appointmentTime?: string;
      concerns?: string;
      doctorId?: string;
    };

    if (!name || !email || !meetingType || !appointmentDate || !appointmentTime || !concerns || !doctorId) {
      return NextResponse.json(
        { message: "Please complete all required fields." },
        { status: 400 }
      );
    }

    const validMeetingTypes: FrontendMeetingType[] = ["clinic", "video", "voice"];
    if (!validMeetingTypes.includes(meetingType)) {
      return NextResponse.json(
        { message: "Invalid consultation type." },
        { status: 400 }
      );
    }

    // Validate connection method based on meeting type
    if (meetingType === "clinic" && connectionMethod !== null) {
      return NextResponse.json(
        { message: "Clinic appointments do not require an online meeting." },
        { status: 400 }
      );
    }

    if (meetingType !== "clinic" && !connectionMethod) {
      return NextResponse.json(
        { message: "Please select a connection method." },
        { status: 400 }
      );
    }

    if (meetingType === "voice" && connectionMethod !== "zoom" && connectionMethod !== "livekit") {
      return NextResponse.json(
        { message: "Voice consultations must use Zoom or LiveKit." },
        { status: 400 }
      );
    }

    if (meetingType === "video" && !["zoom", "google_meet", "livekit"].includes(connectionMethod || "")) {
      return NextResponse.json(
        { message: "Invalid connection method for video consultation." },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor || !doctor.isActive) {
      return NextResponse.json(
        { message: "Selected specialist is not available." },
        { status: 400 }
      );
    }

    const startDate = new Date(appointmentDate);
    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid appointment date." },
        { status: 400 }
      );
    }

    const prismaMeetingType = meetingType.toUpperCase() as "CLINIC" | "VIDEO" | "VOICE";
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedConcerns = concerns.trim();

    let meetingProvider: "NONE" | "ZOOM" | "GOOGLE_MEET" = "NONE";
    let externalMeetingId: string | null = null;
    let meetingUrl: string | null = null;
    let hostUrl: string | null = null;
    let roomName: string | null = null;

    // Create meeting based on connection method
    if (meetingType !== "clinic") {
      if (connectionMethod === "zoom") {
        const zoomMeeting = await createZoomMeeting({
          topic: `${meetingType === "voice" ? "Voice" : "Video"} Consultation - ${trimmedName}`,
          startTime: startDate.toISOString(),
          duration: 30,
          patientName: trimmedName,
        });

        meetingProvider = "ZOOM";
        externalMeetingId = String(zoomMeeting.id);
        meetingUrl = zoomMeeting.join_url;
        hostUrl = zoomMeeting.start_url;
      } else if (connectionMethod === "google_meet") {
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

        const googleMeeting = await createGoogleMeet({
          title: `Video Consultation - ${trimmedName}`,
          description: [
            `Patient: ${trimmedName}`,
            `Doctor: ${doctor.name}`,
            `Consultation Type: Video`,
            `Concerns: ${trimmedConcerns}`,
          ].join("\n"),
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          patientEmail: trimmedEmail,
        });

        meetingProvider = "GOOGLE_MEET";
        externalMeetingId = googleMeeting.eventId || null;
        meetingUrl = googleMeeting.meetingUrl;
        hostUrl = googleMeeting.htmlLink || null;
      } else if (connectionMethod === "livekit") {
        // LiveKit - create room
        roomName = `appointment-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

        await roomService.createRoom({
          name: roomName,
          emptyTimeout: 10 * 60,
          maxParticipants: 10,
        });

        meetingProvider = "NONE";
      }
    }

    // Create appointment and meeting in transaction
    const result = await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
  data: {
    name: trimmedName,
    email: trimmedEmail,
    concerns: trimmedConcerns,

    meetingType: prismaMeetingType,
    connectionProvider: meetingProvider,

    appointmentDate: startDate,
    appointmentTime,
    status: "PENDING",

    userId: user.id,
    doctorId,
  },
});

      let meeting = null;

      if (meetingType !== "clinic") {
        meeting = await tx.meeting.create({
          data: {
            appointmentId: appointment.id,
            provider: meetingProvider,
            externalMeetingId,
            meetingUrl,
            hostUrl,
            roomName,
            type: prismaMeetingType,
            status: "CREATED",
          },
        });
      }

      // Create notifications
      await tx.notification.create({
        data: {
          userId: user.id,
          appointmentId: appointment.id,
          type: "APPOINTMENT_CREATED",
          title: "Appointment Request Submitted",
          message: `Your ${meetingType} consultation with ${doctor.name} has been submitted for ${appointmentTime}.`,
        },
      });

      await tx.notification.create({
        data: {
          doctorId: doctor.id,
          appointmentId: appointment.id,
          type: "APPOINTMENT_CREATED",
          title: "New Appointment Request",
          message: `${trimmedName} has requested a ${meetingType} consultation for ${appointmentTime}.`,
        },
      });

      return { appointment, meeting };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Appointment booked successfully.",
        appointment: {
          id: result.appointment.id,
          name: result.appointment.name,
          email: result.appointment.email,
          meetingType: result.appointment.meetingType,
          appointmentDate: result.appointment.appointmentDate,
          appointmentTime: result.appointment.appointmentTime,
          status: result.appointment.status,
          doctor: {
            id: doctor.id,
            name: doctor.name,
          },
          meeting: result.meeting
            ? {
                id: result.meeting.id,
                provider: result.meeting.provider,
                type: result.meeting.type,
                status: result.meeting.status,
                meetingUrl: result.meeting.meetingUrl,
                roomName: result.meeting.roomName,
              }
            : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Appointment API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to book appointment.",
      },
      { status: 500 }
    );
  }
}