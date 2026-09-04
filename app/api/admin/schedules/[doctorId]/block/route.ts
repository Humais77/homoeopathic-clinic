import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { parseDateOnly } from "@/src/lib/scheduling";

type Context = {
  params: Promise<{
    doctorId: string;
  }>;
};

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
        },
      });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
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
            doctorId,
            date,
          },
        },
        create: {
          doctorId,
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
        action: "ADMIN_BLOCK_DOCTOR_DATE",
        entity: "DoctorScheduleBlock",
        entityId: block.id,
        metadata: {
          doctorId,
          date: body.date,
        },
      },
    });

    return NextResponse.json({
      message: "Doctor date blocked",
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

    console.error("Admin block error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: Context
) {
  try {
    await requireAdmin();

    const { doctorId } = await context.params;

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
        doctorId,
        date,
      },
    });

    return NextResponse.json({
      message: "Doctor date unblocked",
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

    console.error("Admin unblock error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}