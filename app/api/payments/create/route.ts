import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/auth";
import { createSafepayPayment } from "@/src/lib/payments/safepay";
import { createAuditLog } from "@/src/lib/audit";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();

    const appointmentId = body?.appointmentId;

    if (!appointmentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment ID is required",
        },
        { status: 400 }
      );
    }

    const appointment =
      await prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },
      });

    if (!appointment) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment not found",
        },
        { status: 404 }
      );
    }

    if (appointment.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 403 }
      );
    }

    if (
      appointment.status === "CANCELLED" ||
      appointment.status === "COMPLETED" ||
      appointment.status === "NO_SHOW"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment is not available for this appointment",
        },
        { status: 400 }
      );
    }

    const existingPayment =
      await prisma.payment.findUnique({
        where: {
          appointmentId,
        },
      });

    if (existingPayment?.status === "PAID") {
      return NextResponse.json(
        {
          success: true,
          alreadyPaid: true,
          paymentId: existingPayment.id,
        }
      );
    }

    const amount = Number(appointment.fee);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid appointment fee",
        },
        { status: 400 }
      );
    }

    const payment =
      existingPayment ??
      (await prisma.payment.create({
        data: {
          appointmentId,
          userId: user.id,
          provider: "SAFEPAY",
          method: "UNKNOWN",
          amount: appointment.fee,
          currency: appointment.currency,
          status: "PENDING",
        },
      }));

    const safepay =
      await createSafepayPayment({
        amount,
        currency: appointment.currency,
        appointmentId,
        userId: user.id,
      });

    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        trackerToken: safepay.tracker,
        checkoutUrl: safepay.checkoutUrl,
        status: "PROCESSING",
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "PAYMENT_CHECKOUT_CREATED",
      entity: "Payment",
      entityId: payment.id,
      metadata: {
        provider: "SAFEPAY",
        appointmentId,
        amount,
        currency: appointment.currency,
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutUrl: safepay.checkoutUrl,
    });
  } catch (error) {
    console.error(
      "Create payment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create payment",
      },
      { status: 500 }
    );
  }
}