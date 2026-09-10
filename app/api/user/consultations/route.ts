import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const body = await request.json();

    const {
      name,
      email,
      phone,
      treatmentId,
      message,
    } = body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !treatmentId ||
      !message?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    const treatment =
      await prisma.treatment.findFirst({
        where: {
          id: treatmentId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
      });

    if (!treatment) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected treatment is not available",
        },
        { status: 400 }
      );
    }

    const consultation =
      await prisma.consultationInquiry.create({
        data: {
          userId: user.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          treatmentId: treatment.id,
          message: message.trim(),
          status: "PENDING",
        },
        include: {
          treatment: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Consultation request submitted successfully",
        consultation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create user consultation error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to submit a consultation",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit consultation",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await requireUser();

    const consultations =
      await prisma.consultationInquiry.findMany({
        where: {
          userId: user.id,
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
          doctor: {
            select: {
              id: true,
              name: true,
              qualification: true,
              specialization: true,
              image: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              doctor: {
                select: {
                  id: true,
                  name: true,
                  qualification: true,
                },
              },
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      consultations,
    });
  } catch (error) {
    console.error(
      "Get user consultations error:",
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