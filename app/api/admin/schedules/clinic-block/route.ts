import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { parseDateOnly } from "@/src/lib/scheduling";

export async function POST(
  request: NextRequest
) {
  try {
    const user = await requireAdmin();

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
      await prisma.clinicScheduleBlock.upsert({
        where: {
          date,
        },
        create: {
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
        action: "ADMIN_BLOCK_CLINIC",
        entity: "ClinicScheduleBlock",
        entityId: block.id,
        metadata: {
          date: body.date,
        },
      },
    });

    return NextResponse.json({
      message: "Clinic blocked successfully",
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

    console.error(
      "Clinic block error:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    await requireAdmin();

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

    await prisma.clinicScheduleBlock.delete({
      where: {
        date,
      },
    });

    return NextResponse.json({
      message: "Clinic unblocked successfully",
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

    console.error(
      "Clinic unblock error:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}