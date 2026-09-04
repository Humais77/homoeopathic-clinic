import { NextRequest, NextResponse } from "next/server";
import { requireDoctor } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import {
  parseDateOnly,
  validateTimeRange,
} from "@/src/lib/scheduling";

type Context = {
  params: Promise<{
    slotId: string;
  }>;
};

function authError(error: unknown) {
  if (
    error instanceof Error &&
    error.message === "Unauthorized"
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (
    error instanceof Error &&
    error.message === "Forbidden"
  ) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  return null;
}

export async function PATCH(
  request: NextRequest,
  context: Context
) {
  try {
    const user = await requireDoctor();

    const { slotId } = await context.params;

    const doctor = await prisma.doctor.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    const slot =
      await prisma.availableSlot.findFirst({
        where: {
          id: slotId,
          doctorId: doctor.id,
        },
        include: {
          appointment: true,
        },
      });

    if (!slot) {
      return NextResponse.json(
        { error: "Slot not found" },
        { status: 404 }
      );
    }

    if (
      slot.status === "BOOKED" ||
      slot.appointment
    ) {
      return NextResponse.json(
        {
          error:
            "Booked slots cannot be modified by doctors",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const date =
      typeof body.date === "string"
        ? parseDateOnly(body.date)
        : slot.date;

    const startTime =
      typeof body.startTime === "string"
        ? body.startTime
        : slot.startTime;

    const endTime =
      typeof body.endTime === "string"
        ? body.endTime
        : slot.endTime;

    if (!date || !validateTimeRange(startTime, endTime)) {
      return NextResponse.json(
        { error: "Invalid slot data" },
        { status: 400 }
      );
    }

    const updated =
      await prisma.availableSlot.update({
        where: {
          id: slot.id,
        },
        data: {
          date,
          startTime,
          endTime,
        },
      });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_SLOT",
        entity: "AvailableSlot",
        entityId: slot.id,
        metadata: {
          doctorId: doctor.id,
        },
      },
    });

    return NextResponse.json({
      message: "Slot updated successfully",
      slot: updated,
    });
  } catch (error) {
    const response = authError(error);

    if (response) return response;

    console.error("Doctor slot PATCH error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: Context
) {
  try {
    const user = await requireDoctor();

    const { slotId } = await context.params;

    const doctor = await prisma.doctor.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    const slot =
      await prisma.availableSlot.findFirst({
        where: {
          id: slotId,
          doctorId: doctor.id,
        },
        include: {
          appointment: true,
        },
      });

    if (!slot) {
      return NextResponse.json(
        { error: "Slot not found" },
        { status: 404 }
      );
    }

    if (
      slot.status === "BOOKED" ||
      slot.appointment
    ) {
      return NextResponse.json(
        {
          error:
            "Booked slots cannot be deleted",
        },
        { status: 403 }
      );
    }

    await prisma.availableSlot.delete({
      where: {
        id: slot.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DELETE_SLOT",
        entity: "AvailableSlot",
        entityId: slot.id,
        metadata: {
          doctorId: doctor.id,
        },
      },
    });

    return NextResponse.json({
      message: "Slot deleted successfully",
    });
  } catch (error) {
    const response = authError(error);

    if (response) return response;

    console.error("Doctor slot DELETE error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}