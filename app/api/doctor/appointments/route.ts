import { NextResponse } from "next/server";
import { requireDoctor } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const user = await requireDoctor();

    const doctor =
      await prisma.doctor.findUnique({
        where: {
          userId: user.id,
        },
      });

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor profile not found",
        },
        { status: 404 }
      );
    }

    const appointments =
      await prisma.appointment.findMany({
        where: {
          doctorId: doctor.id,
        },
        orderBy: {
          appointmentDate: "desc",
        },
        include: {
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
      });

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error(
      "Doctor appointments error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load appointments",
      },
      { status: 500 }
    );
  }
}