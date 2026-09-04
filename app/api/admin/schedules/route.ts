import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const doctors = await prisma.doctor.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        schedule: true,
        _count: {
          select: {
            slots: true,
            appointments: true,
          },
        },
      },
    });

    return NextResponse.json({
      doctors,
    });
  } catch (error) {
    console.error("Admin schedules error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}