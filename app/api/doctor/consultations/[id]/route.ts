import {
  NextRequest,
  NextResponse,
} from "next/server";
import { requireDoctor } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const validStatuses = [
  "IN_REVIEW",
  "COMPLETED",
  "REJECTED",
] as const;

export async function GET(
  _request: NextRequest,
  { params }: Params
) {
  try {
    const user = await requireDoctor();

    const { id } = await params;

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

    const consultation =
      await prisma.consultationInquiry.findFirst({
        where: {
          id,
          doctorId: doctor.id,
        },
        include: {
          treatment: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              qualification: true,
              specialization: true,
              experience: true,
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

    if (!consultation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Consultation not found or not assigned to you",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      consultation,
    });
  } catch (error) {
    console.error(
      "Doctor consultation GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load consultation",
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
    const user = await requireDoctor();

    const { id } = await params;

    const body = await request.json();

    const { status } = body;

    const doctor =
      await prisma.doctor.findUnique({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          name: true,
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

    const consultation =
      await prisma.consultationInquiry.findFirst({
        where: {
          id,
          doctorId: doctor.id,
        },
        select: {
          id: true,
          status: true,
          userId: true,
          name: true,
        },
      });

    if (!consultation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Consultation not found or not assigned to you",
        },
        { status: 404 }
      );
    }

    if (
      !validStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid consultation status",
        },
        { status: 400 }
      );
    }

    const updated =
      await prisma.consultationInquiry.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

    // Notify the user when the doctor starts reviewing
    if (
      status === "IN_REVIEW" &&
      consultation.userId
    ) {
      await prisma.notification.create({
        data: {
          userId: consultation.userId,
          consultationId: consultation.id,
          type: "CONSULTATION_RESPONSE",
          title: "Consultation Under Review",
          message:
            "Your consultation request is now being reviewed by the doctor.",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        status === "IN_REVIEW"
          ? "Consultation review started"
          : "Consultation status updated successfully",
      consultation: updated,
    });
  } catch (error) {
    console.error(
      "Doctor consultation update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update consultation",
      },
      { status: 500 }
    );
  }
}