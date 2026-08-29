import { NextRequest, NextResponse } from "next/server";
import { requireDoctor } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const user = await requireDoctor();

    const doctor = await prisma.doctor.findUnique({
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

    return NextResponse.json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error(
      "Get doctor profile error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load profile",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
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
          message:
            "Name and qualification are required",
        },
        { status: 400 }
      );
    }

    const updatedDoctor =
      await prisma.doctor.update({
        where: {
          id: doctor.id,
        },
        data: {
          name: name.trim(),
          qualification:
            qualification.trim(),
          specialization:
            specialization?.trim() || null,
          experience:
            experience?.trim() || null,
          description:
            description?.trim() || null,
          image: image?.trim() || null,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error(
      "Update doctor profile error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile",
      },
      { status: 500 }
    );
  }
}