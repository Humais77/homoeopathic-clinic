// app/api/appointments/route.ts

import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

import { createZoomMeeting } from "@/src/lib/meetings/zoom";
import { createGoogleMeet } from "@/src/lib/meetings/googleMeet";
import { roomService } from "@/src/lib/meeting";

type ConnectionMethod =
  | "zoom"
  | "google_meet"
  | "livekit"
  | null;

type FrontendMeetingType =
  | "clinic"
  | "video"
  | "voice";

export async function POST(request: Request) {
  try {

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message:
            "You must be logged in to book an appointment.",
        },
        { status: 401 }
      );
    }
    if (user.role !== "USER") {
  return NextResponse.json(
    { message: "Only patient accounts can book appointments." },
    { status: 403 }
  );
}

    const body = await request.json();

    const {
      name,
      email,
      meetingType,
      connectionMethod,
      concerns,
      doctorId,
      slotId,
    } = body as {
      name?: string;
      email?: string;
      meetingType?: FrontendMeetingType;
      connectionMethod?: ConnectionMethod;
      concerns?: string;
      doctorId?: string;
      slotId?: string;
    };

    if (
      !name?.trim() ||
      !email?.trim() ||
      !meetingType ||
      !concerns?.trim() ||
      !doctorId ||
      !slotId
    ) {
      return NextResponse.json(
        {
          message:
            "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    const validMeetingTypes: FrontendMeetingType[] = [
      "clinic",
      "video",
      "voice",
    ];

    if (!validMeetingTypes.includes(meetingType)) {
      return NextResponse.json(
        {
          message: "Invalid consultation type.",
        },
        { status: 400 }
      );
    }

    if (
      meetingType === "clinic" &&
      connectionMethod !== null
    ) {
      return NextResponse.json(
        {
          message:
            "Clinic appointments do not require an online meeting.",
        },
        { status: 400 }
      );
    }

    if (
      meetingType !== "clinic" &&
      !connectionMethod
    ) {
      return NextResponse.json(
        {
          message:
            "Please select a connection method.",
        },
        { status: 400 }
      );
    }

    if (
      meetingType === "voice" &&
      connectionMethod !== "zoom" &&
      connectionMethod !== "livekit"
    ) {
      return NextResponse.json(
        {
          message:
            "Voice consultations must use Zoom or LiveKit.",
        },
        { status: 400 }
      );
    }

    if (
      meetingType === "video" &&
      ![
        "zoom",
        "google_meet",
        "livekit",
      ].includes(connectionMethod || "")
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid connection method for video consultation.",
        },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
    });

    if (!doctor || !doctor.isActive) {
      return NextResponse.json(
        {
          message:
            "Selected specialist is not available.",
        },
        { status: 400 }
      );
    }


    const slot = await prisma.availableSlot.findUnique({
      where: {
        id: slotId,
      },
    });

    if (!slot) {
      return NextResponse.json(
        {
          message:
            "Selected appointment slot does not exist.",
        },
        { status: 400 }
      );
    }

    if (slot.doctorId !== doctorId) {
      return NextResponse.json(
        {
          message:
            "Selected slot does not belong to this specialist.",
        },
        { status: 400 }
      );
    }

    if (slot.status !== "AVAILABLE") {
      return NextResponse.json(
        {
          message:
            "This appointment slot is no longer available. Please select another time.",
        },
        { status: 409 }
      );
    }

    const appointmentDate = new Date(slot.date);

    if (Number.isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        {
          message:
            "The selected appointment date is invalid.",
        },
        { status: 400 }
      );
    }

    const appointmentTime = slot.startTime;

    const trimmedName = name.trim();

    const trimmedEmail =
      email.trim().toLowerCase();

    const trimmedConcerns =
      concerns.trim();

    const prismaMeetingType =
      meetingType.toUpperCase() as
        | "CLINIC"
        | "VIDEO"
        | "VOICE";

    let meetingProvider:
      | "NONE"
      | "ZOOM"
      | "GOOGLE_MEET" = "NONE";

    let externalMeetingId:
      | string
      | null = null;

    let meetingUrl:
      | string
      | null = null;

    let hostUrl:
      | string
      | null = null;

    let roomName:
      | string
      | null = null;


    if (meetingType !== "clinic") {

      if (connectionMethod === "zoom") {
        const zoomMeeting =
          await createZoomMeeting({
            topic: `${
              meetingType === "voice"
                ? "Voice"
                : "Video"
            } Consultation - ${trimmedName}`,

            startTime:
              appointmentDate.toISOString(),

            duration: 30,

            patientName: trimmedName,
          });

        meetingProvider = "ZOOM";

        externalMeetingId =
          String(zoomMeeting.id);

        meetingUrl =
          zoomMeeting.join_url;

        hostUrl =
          zoomMeeting.start_url;
      }
      else if (
        connectionMethod === "google_meet"
      ) {
        const endDate = new Date(
          appointmentDate.getTime() +
            30 * 60 * 1000
        );

        const googleMeeting =
          await createGoogleMeet({
            title: `Video Consultation - ${trimmedName}`,

            description: [
              `Patient: ${trimmedName}`,
              `Doctor: ${doctor.name}`,
              `Consultation Type: Video`,
              `Concerns: ${trimmedConcerns}`,
            ].join("\n"),

            startTime:
              appointmentDate.toISOString(),

            endTime:
              endDate.toISOString(),

            patientEmail:
              trimmedEmail,
          });

        meetingProvider =
          "GOOGLE_MEET";

        externalMeetingId =
          googleMeeting.eventId || null;

        meetingUrl =
          googleMeeting.meetingUrl;

        hostUrl =
          googleMeeting.htmlLink || null;
      }
      else if (
        connectionMethod === "livekit"
      ) {
        roomName = `appointment-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 10)}`;

        await roomService.createRoom({
          name: roomName,

          emptyTimeout:
            10 * 60,

          maxParticipants: 10,
        });
        meetingProvider = "NONE";
      }
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const reservedSlot =
            await tx.availableSlot.updateMany({
              where: {
                id: slotId,

                doctorId,

                status: "AVAILABLE",
              },

              data: {
                status: "BOOKED",
              },
            });

          if (reservedSlot.count !== 1) {
            throw new Error(
              "This appointment slot is no longer available. Please select another time."
            );
          }
          const appointment =
            await tx.appointment.create({
              data: {
                name: trimmedName,

                email: trimmedEmail,

                concerns:
                  trimmedConcerns,

                meetingType:
                  prismaMeetingType,

                connectionProvider:
                  meetingProvider,

                appointmentDate,

                appointmentTime,

                status: "PENDING",

                userId: user.id,

                doctorId,

                slotId,
              },
            });

          let meeting = null;

          if (meetingType !== "clinic") {
            meeting =
              await tx.meeting.create({
                data: {
                  appointmentId:
                    appointment.id,

                  provider:
                    meetingProvider,

                  externalMeetingId,

                  meetingUrl,

                  hostUrl,

                  roomName,

                  type:
                    prismaMeetingType,

                  status: "CREATED",
                },
              });
          }
          await tx.notification.create({
            data: {
              userId: user.id,

              appointmentId:
                appointment.id,

              type:
                "APPOINTMENT_CREATED",

              title:
                "Appointment Request Submitted",

              message:
                `Your ${meetingType} consultation with ${doctor.name} has been submitted for ${appointmentTime}.`,
            },
          });

          await tx.notification.create({
            data: {
              doctorId: doctor.id,

              appointmentId:
                appointment.id,

              type:
                "APPOINTMENT_CREATED",

              title:
                "New Appointment Request",

              message:
                `${trimmedName} has requested a ${meetingType} consultation for ${appointmentTime}.`,
            },
          });

          return {
            appointment,
            meeting,
          };
        }
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Appointment booked successfully.",

        appointment: {
          id: result.appointment.id,

          name:
            result.appointment.name,

          email:
            result.appointment.email,

          meetingType:
            result.appointment.meetingType,

          appointmentDate:
            result.appointment.appointmentDate,

          appointmentTime:
            result.appointment.appointmentTime,

          status:
            result.appointment.status,

          doctor: {
            id: doctor.id,

            name: doctor.name,
          },

          meeting: result.meeting
            ? {
                id:
                  result.meeting.id,

                provider:
                  result.meeting.provider,

                type:
                  result.meeting.type,

                status:
                  result.meeting.status,

                meetingUrl:
                  result.meeting.meetingUrl,

                roomName:
                  result.meeting.roomName,
              }
            : null,
        },
      },

      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Appointment API error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to book appointment.";

    if (
      message.includes(
        "no longer available"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 500,
      }
    );
  }
}