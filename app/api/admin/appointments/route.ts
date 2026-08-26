import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/src/lib/prisma";

import {
  getAdminFromSession,
} from "@/src/lib/auth";

export async function GET() {
  try {
    const session =
      await getAdminFromSession();

    if (
      !session ||
      session.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          message:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

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
            appointmentDate:
              "asc",
          },
          {
            createdAt:
              "desc",
          },
        ],
      });

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error(
      "Admin appointments error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load appointments.",
      },
      {
        status: 500,
      }
    );
  }
}