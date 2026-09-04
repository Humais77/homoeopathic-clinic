import { NextRequest, NextResponse } from "next/server";
import { requireDoctor } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import {
  validateWorkingHours,
} from "@/src/lib/scheduling";

function handleAuthError(error: unknown) {
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

export async function GET() {
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

    const schedule = await prisma.doctorSchedule.findUnique({
      where: {
        doctorId: doctor.id,
      },
      include: {
        workingHours: {
          orderBy: [
            { dayOfWeek: "asc" },
            { startTime: "asc" },
          ],
        },
      },
    });

    return NextResponse.json({
      schedule,
    });
  } catch (error) {
    const response = handleAuthError(error);

    if (response) return response;

    console.error("Doctor schedule GET error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const timezone =
      typeof body.timezone === "string"
        ? body.timezone.trim()
        : "Asia/Karachi";

    const slotDuration = Number(body.slotDuration);

    const workingHours = Array.isArray(body.workingHours)
      ? body.workingHours
      : [];

    if (
      !Number.isInteger(slotDuration) ||
      slotDuration < 5 ||
      slotDuration > 240
    ) {
      return NextResponse.json(
        {
          error:
            "slotDuration must be between 5 and 240 minutes",
        },
        { status: 400 }
      );
    }

    const workingHourError =
      validateWorkingHours(workingHours);

    if (workingHourError) {
      return NextResponse.json(
        { error: workingHourError },
        { status: 400 }
      );
    }

    const schedule = await prisma.$transaction(
      async (tx) => {
        const schedule =
          await tx.doctorSchedule.upsert({
            where: {
              doctorId: doctor.id,
            },
            create: {
              doctorId: doctor.id,
              timezone,
              slotDuration,
            },
            update: {
              timezone,
              slotDuration,
            },
          });

        await tx.doctorWorkingHour.deleteMany({
          where: {
            scheduleId: schedule.id,
          },
        });

        if (workingHours.length > 0) {
          await tx.doctorWorkingHour.createMany({
            data: workingHours.map(
              (item: {
                dayOfWeek: number;
                startTime: string;
                endTime: string;
                isActive?: boolean;
              }) => ({
                scheduleId: schedule.id,
                dayOfWeek: item.dayOfWeek,
                startTime: item.startTime,
                endTime: item.endTime,
                isActive: item.isActive !== false,
              })
            ),
          });
        }

        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "UPDATE_DOCTOR_SCHEDULE",
            entity: "DoctorSchedule",
            entityId: schedule.id,
            metadata: {
              doctorId: doctor.id,
              timezone,
              slotDuration,
            },
          },
        });

        return tx.doctorSchedule.findUnique({
          where: {
            id: schedule.id,
          },
          include: {
            workingHours: {
              orderBy: [
                { dayOfWeek: "asc" },
                { startTime: "asc" },
              ],
            },
          },
        });
      }
    );

    return NextResponse.json({
      message: "Schedule updated successfully",
      schedule,
    });
  } catch (error) {
    const response = handleAuthError(error);

    if (response) return response;

    console.error("Doctor schedule PUT error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}