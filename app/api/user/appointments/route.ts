import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";

import { getCurrentUser } from "@/src/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();

    if (!session || session.role !== "USER") {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const appointments =
      await prisma.appointment.findMany({
        where: {
          userId: session.id,

          // Only show appointments that the
          // user has not hidden from their dashboard.
          userHiddenAt: null,
        },

        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              qualification: true,
              specialization: true,
              image: true,
            },
          },

          meeting: {
            select: {
              id: true,
              roomName: true,
              type: true,
              status: true,
            },
          },
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
    console.error(
      "User appointments error:",
      error
    );

    return NextResponse.json(
      {
        message: "Unable to load appointments.",
      },
      {
        status: 500,
      }
    );
  }
}