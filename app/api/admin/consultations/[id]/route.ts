import {
  NextRequest,
  NextResponse,
} from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const validStatuses = [
  "PENDING",
  "ASSIGNED",
  "IN_REVIEW",
  "CONTACTED",
  "APPOINTMENT_CREATED",
  "COMPLETED",
  "REJECTED",
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const body = await request.json();

    const {
      doctorId,
      status,
    } = body;

    const inquiry =
      await prisma.consultationInquiry.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          doctorId: true,
          status: true,
          treatment: {
            select: {
              name: true,
            },
          },
        },
      });

    if (!inquiry) {
      return NextResponse.json(
        {
          success: false,
          message: "Consultation not found",
        },
        { status: 404 }
      );
    }

    let assignedDoctor = null;

    if (doctorId !== undefined) {
      if (!doctorId) {
        return NextResponse.json(
          {
            success: false,
            message: "Doctor ID is required",
          },
          { status: 400 }
        );
      }

      assignedDoctor =
        await prisma.doctor.findFirst({
          where: {
            id: doctorId,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
          },
        });

      if (!assignedDoctor) {
        return NextResponse.json(
          {
            success: false,
            message: "Active doctor not found",
          },
          { status: 404 }
        );
      }
    }

    if (
      status !== undefined &&
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

    const isNewDoctorAssignment =
      doctorId !== undefined &&
      doctorId !== inquiry.doctorId;

    const nextStatus =
      doctorId !== undefined
        ? status ?? "ASSIGNED"
        : status;

    const updated =
      await prisma.consultationInquiry.update({
        where: {
          id,
        },
        data: {
          ...(doctorId !== undefined && {
            doctorId,
          }),

          ...(nextStatus !== undefined && {
            status: nextStatus,
          }),
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
              specialization: true,
            },
          },
        },
      });

    if (
      isNewDoctorAssignment &&
      assignedDoctor
    ) {
      await prisma.notification.create({
        data: {
          doctorId: assignedDoctor.id,
          consultationId: inquiry.id,
          type: "CONSULTATION_ASSIGNED",
          title: "New Consultation Request",
          message: `A new ${inquiry.treatment.name} consultation has been assigned to you.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: isNewDoctorAssignment
        ? "Doctor assigned successfully"
        : "Consultation updated successfully",
      consultation: updated,
    });
  } catch (error) {
    console.error(
      "Admin consultation update error:",
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