import { NextRequest, NextResponse } from "next/server";
import { requireDoctor } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import {
  parseDateOnly,
  validateTimeRange,
} from "@/src/lib/scheduling";

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

export async function GET(request: NextRequest) {
  try {
    const user = await requireDoctor();

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

    const { searchParams } =
      new URL(request.url);

    const dateParam =
      searchParams.get("date");

    const where: {
      doctorId: string;
      date?: Date;
    } = {
      doctorId: doctor.id,
    };

    if (dateParam) {
      const date = parseDateOnly(dateParam);

      if (!date) {
        return NextResponse.json(
          { error: "Invalid date" },
          { status: 400 }
        );
      }

      where.date = date;
    }

    const slots =
      await prisma.availableSlot.findMany({
        where,
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
      slots,
    });
  } catch (error) {
    const response = authError(error);

    if (response) return response;

    console.error("Doctor slots GET error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireDoctor();

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

    if (date.getTime() < Date.now() - 86400000) {
      return NextResponse.json(
        { error: "Cannot create a slot in the past" },
        { status: 400 }
      );
    }

    const blocked =
      await prisma.doctorScheduleBlock.findUnique({
        where: {
          doctorId_date: {
            doctorId: doctor.id,
            date,
          },
        },
      });

    if (blocked) {
      return NextResponse.json(
        { error: "This date is blocked" },
        { status: 400 }
      );
    }

    const clinicBlocked =
      await prisma.clinicScheduleBlock.findUnique({
        where: {
          date,
        },
      });

    if (clinicBlocked) {
      return NextResponse.json(
        { error: "Clinic is unavailable on this date" },
        { status: 400 }
      );
    }

    const existing =
      await prisma.availableSlot.findUnique({
        where: {
          doctorId_date_startTime: {
            doctorId: doctor.id,
            date,
            startTime,
          },
        },
      });

    if (existing) {
      return NextResponse.json(
        { error: "Slot already exists" },
        { status: 409 }
      );
    }

    const slot =
      await prisma.availableSlot.create({
        data: {
          doctorId: doctor.id,
          date,
          startTime,
          endTime,
        },
      });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_SLOT",
        entity: "AvailableSlot",
        entityId: slot.id,
        metadata: {
          doctorId: doctor.id,
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

    console.error("Doctor slots POST error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}