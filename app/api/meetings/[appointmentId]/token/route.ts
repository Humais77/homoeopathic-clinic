// app/api/meetings/[appointmentId]/token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { createMeetingToken, livekitHost } from "@/src/lib/meeting";
import {
  getCurrentUser,
} from "@/src/lib/auth";

type Context = {
  params: Promise<{
    appointmentId: string;
  }>;
};

export async function POST(request: NextRequest, context: Context) {
  try {
    const { appointmentId } = await context.params;
    const session =
  await getCurrentUser();

if (!session) {
  return NextResponse.json(
    {
      message: "Unauthorized.",
    },
    {
      status: 401,
    }
  );
}

    if (!session) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { include: { user: true } },
        meeting: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ message: "Appointment not found." }, { status: 404 });
    }

    if (appointment.status !== "CONFIRMED") {
      return NextResponse.json(
        { message: "This appointment is not confirmed." },
        { status: 403 }
      );
    }

    if (appointment.meetingType === "CLINIC") {
      return NextResponse.json(
        { message: "This appointment is a clinic visit and does not have an online meeting." },
        { status: 400 }
      );
    }

    // Authorization
    let allowed = false;
    if (session.role === "ADMIN") {
      allowed = true;
    }
    if (session.role === "DOCTOR") {
      allowed = appointment.doctor.userId === session.id;
    }
    if (session.role === "USER") {
      allowed = appointment.userId === session.id;
    }
    if (session.role === "USER" && !appointment.userId && session.email !== appointment.email) {
      allowed = false;
    }

    if (!allowed) {
      return NextResponse.json(
        { message: "You are not allowed to join this meeting." },
        { status: 403 }
      );
    }

    // Check meeting type
    if (!appointment.meeting) {
      return NextResponse.json(
        { message: "No meeting found for this appointment." },
        { status: 404 }
      );
    }

    // For Zoom meetings, redirect to Zoom URL
    if (appointment.meeting.provider === "ZOOM") {
      return NextResponse.json({
        success: true,
        meetingType: appointment.meetingType,
        provider: "ZOOM",
        meetingUrl: appointment.meeting.meetingUrl,
        externalMeetingId: appointment.meeting.externalMeetingId,
      });
    }

    // For Google Meet, redirect to Google Meet URL
    if (appointment.meeting.provider === "GOOGLE_MEET") {
      return NextResponse.json({
        success: true,
        meetingType: appointment.meetingType,
        provider: "GOOGLE_MEET",
        meetingUrl: appointment.meeting.meetingUrl,
        externalMeetingId: appointment.meeting.externalMeetingId,
      });
    }

    // For LiveKit, create token
    const roomName = appointment.meeting.roomName;
    if (!roomName) {
      return NextResponse.json(
        { message: "Meeting room not found." },
        { status: 500 }
      );
    }

    const identity = `${session.role.toLowerCase()}-${session.id}`;
    const token = await createMeetingToken({
      roomName,
      identity,
      name: session.role === "USER" ? appointment.name : session.name,
      canPublish: true,
    });

    return NextResponse.json({
      success: true,
      serverUrl: livekitHost,
      token,
      roomName,
      meetingType: appointment.meetingType,
      provider: "LIVEKIT",
    });
  } catch (error) {
    console.error("Meeting token error:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to join meeting.",
      },
      { status: 500 }
    );
  }
}