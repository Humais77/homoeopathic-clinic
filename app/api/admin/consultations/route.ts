import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

export async function GET() {
  try {
    await requireAdmin();

    const consultations =
      await prisma.consultationInquiry.findMany({
        orderBy: {
          createdAt: 'desc',
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
              isActive: true,
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
      'Admin consultations GET error:',
      error
    );

    if (
      error instanceof Error &&
      error.message === 'Unauthorized'
    ) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === 'Forbidden'
    ) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to load consultations',
      },
      { status: 500 }
    );
  }
}