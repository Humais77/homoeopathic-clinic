import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

import {
  sendAppointmentWhatsAppNotification,
} from "@/src/lib/whatsapp/appointmentNotifications";

import {
  createSafepayPayment,
} from "@/src/lib/payments/safepay";

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
    // --------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be logged in to book an appointment.",
        },
        { status: 401 }
      );
    }

    if (user.role !== "USER") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only patient accounts can book appointments.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // REQUEST BODY
    // --------------------------------------------------

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

    // --------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------

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
          success: false,
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
          success: false,
          message: "Invalid consultation type.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // CONNECTION METHOD VALIDATION
    // --------------------------------------------------

    if (
      meetingType === "clinic" &&
      connectionMethod !== null
    ) {
      return NextResponse.json(
        {
          success: false,
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
          success: false,
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
          success: false,
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
          success: false,
          message:
            "Invalid connection method for video consultation.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // FIND DOCTOR
    // --------------------------------------------------

    const doctor =
      await prisma.doctor.findUnique({
        where: {
          id: doctorId,
        },
      });

    if (!doctor || !doctor.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected specialist is not available.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // FIND SLOT
    // --------------------------------------------------

    const slot =
      await prisma.availableSlot.findUnique({
        where: {
          id: slotId,
        },
      });

    if (!slot) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected appointment slot does not exist.",
        },
        { status: 400 }
      );
    }

    if (slot.doctorId !== doctorId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected slot does not belong to this specialist.",
        },
        { status: 400 }
      );
    }

    if (slot.status !== "AVAILABLE") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This appointment slot is no longer available. Please select another time.",
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // DATE / TIME
    // --------------------------------------------------

    const appointmentDate =
      new Date(slot.date);

    if (
      Number.isNaN(
        appointmentDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The selected appointment date is invalid.",
        },
        { status: 400 }
      );
    }

    const appointmentTime =
      slot.startTime;

    // --------------------------------------------------
    // CLEAN INPUT
    // --------------------------------------------------

    const trimmedName =
      name.trim();

    const trimmedEmail =
      email.trim().toLowerCase();

    const trimmedConcerns =
      concerns.trim();

    // --------------------------------------------------
    // MEETING PROVIDER
    // --------------------------------------------------

    let meetingProvider:
      | "NONE"
      | "ZOOM"
      | "GOOGLE_MEET"
      | "LIVEKIT" = "NONE";

    if (meetingType !== "clinic") {
      if (
        connectionMethod === "zoom"
      ) {
        meetingProvider = "ZOOM";
      }

      if (
        connectionMethod ===
        "google_meet"
      ) {
        meetingProvider =
          "GOOGLE_MEET";
      }

      if (
        connectionMethod === "livekit"
      ) {
        meetingProvider =
          "LIVEKIT";
      }
    }

    // --------------------------------------------------
    // APPOINTMENT FEE
    // --------------------------------------------------
    //
    // Doctor currently has no consultationFee
    // field in Prisma.
    //
    // Therefore we use a server-side environment
    // variable instead of trusting the frontend.
    //

    const consultationFee =
      Number(
        process.env.APPOINTMENT_FEE_PKR
      );

    if (
      !Number.isFinite(
        consultationFee
      ) ||
      consultationFee <= 0
    ) {
      console.error(
        "APPOINTMENT_FEE_PKR is not configured correctly."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Appointment fee is not configured.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // CREATE APPOINTMENT
    // + RESERVE SLOT
    // + CREATE PAYMENT
    // --------------------------------------------------

    const result =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Atomic slot reservation.
           *
           * This prevents two users from booking
           * the same slot simultaneously.
           */

          const reservedSlot =
            await tx.availableSlot.updateMany(
              {
                where: {
                  id: slotId,
                  doctorId,
                  status: "AVAILABLE",
                },
                data: {
                  status: "BOOKED",
                },
              }
            );

          if (
            reservedSlot.count !== 1
          ) {
            throw new Error(
              "This appointment slot is no longer available. Please select another time."
            );
          }

          // ------------------------------------------------
          // CREATE APPOINTMENT
          // ------------------------------------------------

          const appointment =
            await tx.appointment.create({
              data: {
                name: trimmedName,
                email: trimmedEmail,
                concerns: trimmedConcerns,

                meetingType:
                  meetingType.toUpperCase() as
                    | "CLINIC"
                    | "VIDEO"
                    | "VOICE",

                appointmentDate,
                appointmentTime,

                fee: consultationFee,
                currency: "PKR",

                status: "PENDING",

                userId: user.id,
                doctorId: doctor.id,
                slotId: slot.id,

                connectionProvider:
                  meetingProvider,
              },
            });

          // ------------------------------------------------
          // CREATE PAYMENT
          // ------------------------------------------------

          const payment =
            await tx.payment.create({
              data: {
                appointmentId:
                  appointment.id,

                userId: user.id,

                provider:
                  "SAFEPAY",

                /*
                 * The customer chooses the actual
                 * payment method on Safepay checkout.
                 */
                method: "UNKNOWN",

                amount:
                  consultationFee,

                currency: "PKR",

                status: "PENDING",
              },
            });

          // ------------------------------------------------
          // PATIENT NOTIFICATION
          // ------------------------------------------------

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
                `Your ${meetingType} consultation with ${doctor.name} has been submitted for ${appointmentTime}. Please complete the payment to continue.`,
            },
          });

          // ------------------------------------------------
          // DOCTOR NOTIFICATION
          // ------------------------------------------------

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
                `${trimmedName} has requested a ${meetingType} consultation for ${appointmentTime}. Payment is pending.`,
            },
          });

          return {
            appointment,
            payment,
          };
        }
      );

    // --------------------------------------------------
    // CREATE SAFEPAY CHECKOUT
    // --------------------------------------------------

    let safepay;

    try {
      safepay =
        await createSafepayPayment({
          amount:
            consultationFee,

          currency: "PKR",

          appointmentId:
            result.appointment.id,

          userId: user.id,
        });
    } catch (safepayError) {
      console.error(
        "Safepay checkout creation failed:",
        safepayError
      );

      /*
       * Safepay failed after the appointment was
       * created, so release the slot and cancel
       * the appointment.
       */

      await prisma.$transaction(
        async (tx) => {
          await tx.payment.update({
            where: {
              id: result.payment.id,
            },
            data: {
              status: "FAILED",
              failureReason:
                "Unable to create Safepay checkout.",
            },
          });

          await tx.appointment.update({
            where: {
              id: result.appointment.id,
            },
            data: {
              status: "CANCELLED",
              cancellationReason:
                "Payment checkout could not be created.",
              cancelledAt:
                new Date(),
              cancelledBy:
                "SYSTEM",
            },
          });

          await tx.availableSlot.update({
            where: {
              id: slot.id,
            },
            data: {
              status: "AVAILABLE",
            },
          });
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to initialize payment. Please try again.",
        },
        { status: 502 }
      );
    }

    // --------------------------------------------------
    // SAVE SAFEPAY DETAILS
    // --------------------------------------------------

    const updatedPayment =
      await prisma.payment.update({
        where: {
          id: result.payment.id,
        },

        data: {
          trackerToken:
            safepay.tracker,

          checkoutUrl:
            safepay.checkoutUrl,

          status:
            "PROCESSING",
        },
      });

    // --------------------------------------------------
    // WHATSAPP
    // --------------------------------------------------

    try {
      await sendAppointmentWhatsAppNotification(
        {
          appointmentId:
            result.appointment.id,

          type:
            "APPOINTMENT_CREATED",
        }
      );
    } catch (error) {
      console.error(
        "WhatsApp notification failed:",
        error
      );
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        appointment: {
          id:
            result.appointment.id,

          date:
            result.appointment
              .appointmentDate,

          time:
            result.appointment
              .appointmentTime,

          fee:
            result.appointment.fee,

          currency:
            result.appointment
              .currency,

          status:
            result.appointment
              .status,
        },

        payment: {
          id:
            updatedPayment.id,

          status:
            updatedPayment.status,

          checkoutUrl:
            updatedPayment.checkoutUrl,
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
        message:
          "Unable to book appointment.",
      },
      {
        status: 500,
      }
    );
  }
}