import { NextRequest, NextResponse } from "next/server";
import { requireDoctor } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const user = await requireDoctor();

    const { id } = await params;

    const doctor =
      await prisma.doctor.findUnique({
        where: {
          userId: user.id,
        },
      });

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor profile not found",
        },
        { status: 404 }
      );
    }

    const appointment =
      await prisma.appointment.findFirst({
        where: {
          id,
          doctorId: doctor.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          doctor: true,
          meeting: true,
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

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error(
      "Get doctor appointment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load appointment",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  try {
    const user = await requireDoctor();

    const { id } = await params;

    const doctor =
      await prisma.doctor.findUnique({
        where: {
          userId: user.id,
        },
      });

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor profile not found",
        },
        { status: 404 }
      );
    }

    const appointment =
      await prisma.appointment.findFirst({
        where: {
          id,
          doctorId: doctor.id,
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

    const body = await request.json();

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED",
      "NO_SHOW",
    ] as const;

    const status = body.status;

    if (
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid appointment status",
        },
        { status: 400 }
      );
    }

    const updatedAppointment =
      await prisma.appointment.update({
        where: {
          id: appointment.id,
        },
        data: {
          status,
          ...(status === "CANCELLED"
            ? {
                cancelledAt: new Date(),
                cancelledBy: user.id,
                cancellationReason:
                  body.cancellationReason ||
                  null,
              }
            : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          doctor: true,
          meeting: true,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Appointment updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error(
      "Update doctor appointment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update appointment",
      },
      { status: 500 }
    );
  }
}