import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import {
  parseDateOnly,
  validateTimeRange,
} from "@/src/lib/scheduling";

type Context = {
  params: Promise<{
    doctorId: string;
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

export async function GET(
  request: NextRequest,
  context: Context
) {
  try {
    const user = await requireAdmin();

    const { doctorId } = await context.params;

    const doctor =
      await prisma.doctor.findUnique({
        where: {
          id: doctorId,
        },
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const dateParam =
      searchParams.get("date");

    const date = dateParam
      ? parseDateOnly(dateParam)
      : null;

    if (dateParam && !date) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }

    const slots =
      await prisma.availableSlot.findMany({
        where: {
          doctorId,
          ...(date ? { date } : {}),
        },
        include: {
          appointment: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
            },
          },
        },
        orderBy: [
          { date: "asc" },
          { startTime: "asc" },
        ],
      });

    return NextResponse.json({
      doctor,
      slots,
    });
  } catch (error) {
    const response = authError(error);

    if (response) return response;

    console.error("Admin slots GET error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: Context
) {
  try {
    const user = await requireAdmin();

    const { doctorId } = await context.params;

    const doctor =
      await prisma.doctor.findUnique({
        where: {
          id: doctorId,
          isActive: true,
        },
      });

    if (!doctor) {
      return NextResponse.json(
        { error: "Active doctor not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const date =
      typeof body.date === "string"
        ? parseDateOnly(body.date)
        : null;

    const startTime =
      typeof body.startTime === "string"
        ? body.startTime
        : "";

    const endTime =
      typeof body.endTime === "string"
        ? body.endTime
        : "";

    if (!date) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }

    if (!validateTimeRange(startTime, endTime)) {
      return NextResponse.json(
        { error: "Invalid time range" },
        { status: 400 }
      );
    }

    const blocked =
      await prisma.doctorScheduleBlock.findUnique({
        where: {
          doctorId_date: {
            doctorId,
            date,
          },
        },
      });

    const clinicBlocked =
      await prisma.clinicScheduleBlock.findUnique({
        where: {
          date,
        },
      });

    if (blocked || clinicBlocked) {
      return NextResponse.json(
        {
          error:
            "Cannot create slot on an unavailable date",
        },
        { status: 400 }
      );
    }

    const slot =
      await prisma.availableSlot.create({
        data: {
          doctorId,
          date,
          startTime,
          endTime,
        },
      });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "ADMIN_CREATE_SLOT",
        entity: "AvailableSlot",
        entityId: slot.id,
        metadata: {
          doctorId,
          date: body.date,
          startTime,
          endTime,
        },
      },
    });

    return NextResponse.json(
      {
        message: "Slot created successfully",
        slot,
      },
      { status: 201 }
    );
  } catch (error) {
    const response = authError(error);

    if (response) return response;

    console.error("Admin slots POST error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}