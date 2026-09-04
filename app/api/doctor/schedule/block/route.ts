import { NextRequest, NextResponse } from "next/server";
import { requireDoctor } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { parseDateOnly } from "@/src/lib/scheduling";

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

    if (!date) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }

    const block =
      await prisma.doctorScheduleBlock.upsert({
        where: {
          doctorId_date: {
            doctorId: doctor.id,
            date,
          },
        },
        create: {
          doctorId: doctor.id,
          date,
          reason:
            typeof body.reason === "string"
              ? body.reason.trim()
              : null,
        },
        update: {
          reason:
            typeof body.reason === "string"
              ? body.reason.trim()
              : null,
        },
      });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "BLOCK_DOCTOR_DATE",
        entity: "DoctorScheduleBlock",
        entityId: block.id,
        metadata: {
          doctorId: doctor.id,
          date: body.date,
        },
      },
    });

    return NextResponse.json({
      message: "Date blocked successfully",
      block,
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

    console.error("Doctor block error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    if (!date) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }

    await prisma.doctorScheduleBlock.deleteMany({
      where: {
        doctorId: doctor.id,
        date,
      },
    });

    return NextResponse.json({
      message: "Date unblocked successfully",
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

    console.error("Doctor unblock error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}