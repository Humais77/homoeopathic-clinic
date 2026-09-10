import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } =
      new URL(request.url);

    const tracker =
      searchParams.get("tracker");

    if (!tracker) {
      return NextResponse.json(
        {
          success: false,
          message: "Tracker is required",
        },
        { status: 400 }
      );
    }

    const payment =
      await prisma.payment.findFirst({
        where: {
          trackerToken: tracker,
          userId: user.id,
        },
        select: {
          id: true,
          status: true,
          amount: true,
          currency: true,
          appointmentId: true,
          paidAt: true,
        },
      });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: payment.status,
      payment,
    });
  } catch (error) {
    console.error(
      "Payment status error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch payment status",
      },
      { status: 500 }
    );
  }
}