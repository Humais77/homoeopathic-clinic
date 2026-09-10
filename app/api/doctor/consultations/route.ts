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
        select: {
          id: true,
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

    const consultations =
      await prisma.consultationInquiry.findMany({
        where: {
          doctorId: doctor.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          treatment: {
            select: {
              id: true,
              name: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

    return NextResponse.json({
      success: true,
      consultations,
    });
  } catch (error) {
    console.error(
      "Doctor consultations GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load consultations",
      },
      { status: 500 }
    );
  }
}