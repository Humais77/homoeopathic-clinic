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

    const doctor = await prisma.doctor.findUnique({
      where: {
        id,
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
    console.error("GET DOCTOR ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch doctor",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      qualification,
      specialization,
      experience,
      description,
      image,
      isActive,
    } = body;

    const doctor = await prisma.doctor.update({
      where: {
        id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(qualification !== undefined && { qualification }),
        ...(specialization !== undefined && {
          specialization,
        }),
        ...(experience !== undefined && { experience }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Doctor updated successfully",
      doctor,
    });
  } catch (error) {
    console.error("UPDATE DOCTOR ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update doctor",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    await prisma.doctor.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    console.error("DELETE DOCTOR ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete doctor",
      },
      { status: 500 }
    );
  }
}