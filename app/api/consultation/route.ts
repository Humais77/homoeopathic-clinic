
import { prisma } from '@/src/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, treatment, message } = body;

    // Validate input
    if (!name || !email || !treatment || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Save to database
    const inquiry = await prisma.consultationInquiry.create({
      data: {
        name,
        email,
        treatment,
        message,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Consultation request submitted successfully',
        inquiry: {
          id: inquiry.id,
          name: inquiry.name,
          email: inquiry.email,
          treatment: inquiry.treatment,
          status: inquiry.status,
          createdAt: inquiry.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting consultation:', error);
    return NextResponse.json(
      { error: 'Failed to submit consultation request' },
      { status: 500 }
    );
  }
}