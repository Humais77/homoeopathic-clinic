import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const doctor =
      await prisma.doctor.findFirst({
        where: {
          id,
          isActive: true,
        },
      });

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error(
      "GET DOCTOR ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch doctor",
      },
      { status: 500 }
    );
  }
}