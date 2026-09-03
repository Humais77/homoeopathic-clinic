import { prisma } from '@/src/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
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
          error: 'All fields are required',
        },
        { status: 400 }
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        {
          error: 'Invalid email address',
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
          error: 'Selected treatment is not available',
        },
        { status: 400 }
      );
    }

    const inquiry =
      await prisma.consultationInquiry.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          treatmentId: treatment.id,
          message: message.trim(),
          status: 'PENDING',
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
          'Consultation request submitted successfully',
        inquiry: {
          id: inquiry.id,
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          treatment: inquiry.treatment,
          message: inquiry.message,
          status: inquiry.status,
          createdAt: inquiry.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      'Error submitting consultation:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Failed to submit consultation request',
      },
      { status: 500 }
    );
  }
}