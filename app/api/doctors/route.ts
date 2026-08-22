import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.error("GET DOCTORS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch doctors",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      qualification,
      specialization,
      experience,
      description,
      image,
    } = body;

    if (!name || !qualification) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and qualification are required",
        },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctor.create({
      data: {
        name,
        qualification,
        specialization: specialization || null,
        experience: experience || null,
        description: description || null,
        image: image || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Doctor created successfully",
        doctor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE DOCTOR ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create doctor",
      },
      { status: 500 }
    );
  }
}