import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import {
  validateWorkingHours,
} from "@/src/lib/scheduling";

type Context = {
  params: Promise<{
    doctorId: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: Context
) {
  try {
    await requireAdmin();

    const { doctorId } = await context.params;

    const doctor =
      await prisma.doctor.findUnique({
        where: {
          id: doctorId,
        },
        include: {
          schedule: {
            include: {
              workingHours: {
                orderBy: [
                  { dayOfWeek: "asc" },
                  { startTime: "asc" },
                ],
              },
            },
          },
        },
      });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      doctor,
      schedule: doctor.schedule,
    });
  } catch (error) {
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

    console.error("Admin schedule GET error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
      });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const timezone =
      typeof body.timezone === "string"
        ? body.timezone.trim()
        : "Asia/Karachi";

    const slotDuration =
      Number(body.slotDuration);

    const workingHours =
      Array.isArray(body.workingHours)
        ? body.workingHours
        : [];

    if (
      !Number.isInteger(slotDuration) ||
      slotDuration < 5 ||
      slotDuration > 240
    ) {
      return NextResponse.json(
        { error: "Invalid slot duration" },
        { status: 400 }
      );
    }

    const validation =
      validateWorkingHours(
        workingHours
      );

    if (validation) {
      return NextResponse.json(
        { error: validation },
        { status: 400 }
      );
    }

    const schedule =
      await prisma.$transaction(
        async (tx) => {
          const schedule =
            await tx.doctorSchedule.upsert({
              where: {
                doctorId,
              },
              create: {
                doctorId,
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
                  isActive:
                    item.isActive !== false,
                })
              ),
            });
          }

          await tx.auditLog.create({
            data: {
              userId: user.id,
              action: "ADMIN_UPDATE_DOCTOR_SCHEDULE",
              entity: "DoctorSchedule",
              entityId: schedule.id,
              metadata: {
                doctorId,
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

    console.error("Admin schedule PUT error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}