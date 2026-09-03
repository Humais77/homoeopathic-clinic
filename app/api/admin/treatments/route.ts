import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

export async function GET() {
  try {
    await requireAdmin();

    const treatments =
      await prisma.treatment.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

    return NextResponse.json({
      success: true,
      treatments,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to load treatments',
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
      name,
      description,
      isActive = true,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Treatment name is required',
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.treatment.findUnique({
        where: {
          name: name.trim(),
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Treatment already exists',
        },
        { status: 409 }
      );
    }

    const treatment =
      await prisma.treatment.create({
        data: {
          name: name.trim(),
          description:
            description?.trim() || null,
          isActive: Boolean(isActive),
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          'Treatment created successfully',
        treatment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      'Create treatment error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Failed to create treatment',
      },
      { status: 500 }
    );
  }
}