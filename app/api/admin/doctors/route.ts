import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const doctors =
      await prisma.doctor.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.error(
      "Admin doctors GET error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "Forbidden"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch doctors",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    await requireAdmin();

    const body = await request.json();

    const {
      userId,
      name,
      qualification,
      specialization,
      experience,
      description,
      image,
      isActive = true,
    } = body;

    if (
      !userId ||
      !name ||
      !qualification
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User, name and qualification are required",
        },
        { status: 400 }
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (user.role !== "DOCTOR") {
      return NextResponse.json(
        {
          success: false,
          message:
            "User must have DOCTOR role first",
        },
        { status: 400 }
      );
    }

    const existingDoctor =
      await prisma.doctor.findUnique({
        where: {
          userId,
        },
      });

    if (existingDoctor) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Doctor profile already exists for this user",
        },
        { status: 409 }
      );
    }

    const doctor =
      await prisma.doctor.create({
        data: {
          userId,
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
          isActive,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Doctor profile created successfully",
        doctor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin doctors POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create doctor",
      },
      { status: 500 }
    );
  }
}