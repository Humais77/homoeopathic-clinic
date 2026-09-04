import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/src/lib/prisma";

import { requireAdmin } from "@/src/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const appointments =
      await prisma.appointment.findMany({
        include: {
          doctor: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          meeting: true,
        },
        orderBy: [
          {
            appointmentDate: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "Forbidden"
    ) {
      return NextResponse.json(
        { message: "Forbidden." },
        { status: 403 }
      );
    }

    console.error(
      "Admin appointments error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load appointments.",
      },
      { status: 500 }
    );
  }
}