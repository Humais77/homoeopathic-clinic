import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

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
      });

    if (!inquiry) {
      return NextResponse.json(
        {
          success: false,
          message: 'Consultation not found',
        },
        { status: 404 }
      );
    }

    if (doctorId !== undefined) {
      if (!doctorId) {
        return NextResponse.json(
          {
            success: false,
            message: 'Doctor ID is required',
          },
          { status: 400 }
        );
      }

      const doctor =
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

      if (!doctor) {
        return NextResponse.json(
          {
            success: false,
            message: 'Active doctor not found',
          },
          { status: 404 }
        );
      }
    }

    const validStatuses = [
      'PENDING',
      'ASSIGNED',
      'IN_REVIEW',
      'CONTACTED',
      'APPOINTMENT_CREATED',
      'COMPLETED',
      'REJECTED',
    ];

    if (
      status !== undefined &&
      !validStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid consultation status',
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
          ...(doctorId !== undefined && {
            doctorId,
            status: status ?? 'ASSIGNED',
          }),

          ...(status !== undefined && {
            status,
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

    // Create notification when doctor is assigned
    if (doctorId) {
      await prisma.notification.create({
        data: {
          doctorId,
          appointmentId: null,
          type: 'SYSTEM',
          title: 'New Consultation Request',
          message: `A new ${updated.treatment.name} consultation has been assigned to you.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        doctorId
          ? 'Doctor assigned successfully'
          : 'Consultation updated successfully',
      consultation: updated,
    });
  } catch (error) {
    console.error(
      'Admin consultation update error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Failed to update consultation',
      },
      { status: 500 }
    );
  }
}