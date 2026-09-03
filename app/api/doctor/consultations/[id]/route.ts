import { NextRequest, NextResponse } from 'next/server';
import { requireDoctor } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const validStatuses = [
  'IN_REVIEW',
  'CONTACTED',
  'COMPLETED',
  'REJECTED',
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  try {
    const user = await requireDoctor();

    const { id } = await params;

    const body = await request.json();

    const { status } = body;

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid consultation status',
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
        },
      });

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: 'Doctor profile not found',
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
      });

    if (!consultation) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Consultation not found or not assigned to you',
        },
        { status: 404 }
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
        include: {
          treatment: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      message:
        'Consultation status updated successfully',
      consultation: updated,
    });
  } catch (error) {
    console.error(
      'Doctor consultation update error:',
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