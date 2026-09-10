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

export async function POST(
  request: NextRequest,
  { params }: Params
) {
  try {
    const user = await requireDoctor();

    const { id } = await params;

    const body = await request.json();

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Response message is required",
        },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Response cannot exceed 5000 characters",
        },
        { status: 400 }
      );
    }

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
          userId: true,
          status: true,
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

    const result =
      await prisma.$transaction(
        async (tx) => {
          const consultationMessage =
            await tx.consultationMessage.create({
              data: {
                consultationId: consultation.id,
                doctorId: doctor.id,
                senderType: "DOCTOR",
                message,
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
            });

          const updatedConsultation =
            await tx.consultationInquiry.update({
              where: {
                id: consultation.id,
              },
              data: {
                status: "CONTACTED",
              },
            });

          if (consultation.userId) {
            await tx.notification.create({
              data: {
                userId: consultation.userId,
                consultationId: consultation.id,
                type: "CONSULTATION_RESPONSE",
                title: "Doctor Responded",
                message:
                  "Your doctor has responded to your consultation request.",
              },
            });
          }

          return {
            consultationMessage,
            updatedConsultation,
          };
        }
      );

    return NextResponse.json({
      success: true,
      message:
        "Response sent successfully",
      consultationMessage:
        result.consultationMessage,
      consultation:
        result.updatedConsultation,
    });
  } catch (error) {
    console.error(
      "Doctor consultation message error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to send consultation response",
      },
      { status: 500 }
    );
  }
}