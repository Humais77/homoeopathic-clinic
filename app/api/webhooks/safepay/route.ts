import crypto from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { createAuditLog } from "@/src/lib/audit";

function verifySafepayWebhook(
  rawBody: string,
  signature: string,
  timestamp: string,
  secret: string
) {
  const timestampMs =
    Date.parse(timestamp);

  if (!Number.isFinite(timestampMs)) {
    return false;
  }

  // Reject very old/replayed webhook requests.
  const age =
    Math.abs(Date.now() - timestampMs);

  if (age > 5 * 60 * 1000) {
    return false;
  }

  const key = Buffer.from(secret, "base64");

  const signedPayload =
    `${timestamp}.${rawBody}`;

  const digest = crypto
    .createHmac("sha256", key)
    .update(signedPayload)
    .digest("hex");

  const expected =
    `sha256=${digest}`;

  const expectedBuffer =
    Buffer.from(expected);

  const providedBuffer =
    Buffer.from(signature);

  if (
    expectedBuffer.length !==
    providedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    providedBuffer
  );
}

export async function POST(request: Request) {
  try {
    const rawBody =
      await request.text();
     console.log("========== SAFEPAY WEBHOOK ==========");
    console.log("BODY:", rawBody);
    const signature =
      request.headers.get(
        "X-SFPY-SIGNATURE"
      );
      console.log(
      "SIGNATURE:",
      request.headers.get("X-SFPY-SIGNATURE")
    );

    const timestamp =
      request.headers.get(
        "X-SFPY-TIMESTAMP"
      );
      console.log(
      "TIMESTAMP:",
      request.headers.get("X-SFPY-TIMESTAMP")
    );
    const eventId =
      request.headers.get(
        "X-SFPY-EVENT-ID"
      );
      console.log(
      "EVENT ID:",
      request.headers.get("X-SFPY-EVENT-ID")
    );
    console.log("====================================");

    if (
      !signature ||
      !timestamp
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing webhook signature",
        },
        { status: 401 }
      );
    }

    const secret =
      process.env.SAFEPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error(
        "SAFEPAY_WEBHOOK_SECRET is not configured"
      );

      return NextResponse.json(
        {
          success: false,
        },
        { status: 500 }
      );
    }

    const valid =
      verifySafepayWebhook(
        rawBody,
        signature,
        timestamp,
        secret
      );

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid webhook signature",
        },
        { status: 401 }
      );
    }

    const event =
      JSON.parse(rawBody);

    const eventType =
      event?.type ??
      event?.event_type;

    const data =
      event?.data ?? {};

    const tracker =
      data?.tracker ??
      data?.tracker_token ??
      event?.tracker;

    if (!tracker) {
      return NextResponse.json({
        success: true,
      });
    }

    const payment =
      await prisma.payment.findFirst({
        where: {
          trackerToken: tracker,
        },
      });

    if (!payment) {
      console.error(
        "Safepay payment not found:",
        tracker
      );

      // Acknowledge the webhook so Safepay
      // does not repeatedly retry an event
      // that belongs to an unknown tracker.
      return NextResponse.json({
        success: true,
      });
    }

    if (
      eventType === "payment.succeeded" ||
      eventType === "payment.completed"
    ) {
      if (payment.status === "PAID") {
        return NextResponse.json({
          success: true,
          duplicate: true,
        });
      }

      await prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.payment.updateMany({
              where: {
                id: payment.id,
                status: {
                  not: "PAID",
                },
              },
              data: {
                status: "PAID",
                paidAt: new Date(),
                providerPaymentId:
                  data?.token ??
                  data?.payment_token ??
                  null,
                providerReference:
                  data?.reference ??
                  null,
                transactionId:
                  data?.transaction_id ??
                  null,
                metadata: event,
              },
            });

          if (updated.count === 0) {
            return;
          }
        }
      );

      await createAuditLog({
        action: "PAYMENT_PAID",
        entity: "Payment",
        entityId: payment.id,
        metadata: {
          provider: "SAFEPAY",
          appointmentId:
            payment.appointmentId,
          eventType,
          eventId,
        },
      });
    }

    if (
      eventType === "payment.failed" ||
      eventType === "payment.rejected"
    ) {
      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "FAILED",
          failureReason:
            data?.message ??
            data?.error ??
            "Payment failed",
          metadata: event,
        },
      });

      await createAuditLog({
        action: "PAYMENT_FAILED",
        entity: "Payment",
        entityId: payment.id,
        metadata: {
          provider: "SAFEPAY",
          appointmentId:
            payment.appointmentId,
          eventType,
          eventId,
        },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Safepay webhook error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}