import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { parseDateOnly } from "@/src/lib/scheduling";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } =
      new URL(request.url);

    const doctorId =
      searchParams.get("doctorId");

    const dateParam =
      searchParams.get("date");

    if (!doctorId || !dateParam) {
      return NextResponse.json(
        {
          error:
            "doctorId and date are required",
        },
        { status: 400 }
      );
    }

    const date =
      parseDateOnly(dateParam);

    if (!date) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }

    const doctor =
      await prisma.doctor.findFirst({
        where: {
          id: doctorId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
      });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    const [doctorBlock, clinicBlock] =
      await Promise.all([
        prisma.doctorScheduleBlock.findUnique({
          where: {
            doctorId_date: {
              doctorId,
              date,
            },
          },
        }),

        prisma.clinicScheduleBlock.findUnique({
          where: {
            date,
          },
        }),
      ]);

    if (doctorBlock || clinicBlock) {
      return NextResponse.json({
        doctor,
        date: dateParam,
        slots: [],
        blocked: true,
        reason:
          doctorBlock?.reason ??
          clinicBlock?.reason ??
          "Unavailable",
      });
    }

    const slots =
      await prisma.availableSlot.findMany({
        where: {
          doctorId,
          date,
          status: "AVAILABLE",
        },
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
        },
        orderBy: {
          startTime: "asc",
        },
      });

    return NextResponse.json({
      doctor,
      date: dateParam,
      slots,
      blocked: false,
    });
  } catch (error) {
    console.error(
      "Available slots error:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}