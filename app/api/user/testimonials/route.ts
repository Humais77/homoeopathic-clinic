import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUser } from "@/src/lib/auth";

const MIN_FEEDBACK_LENGTH = 10;
const MAX_FEEDBACK_LENGTH = 1000;

const BLOCKED_PATTERNS = [
  /<script\b/i,
  /<\/script>/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
];

function normalizeFeedback(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .trim();
}

function containsBlockedContent(value: string) {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(value));
}

export async function GET() {
  try {
    const user = await requireUser();

    const testimonials = await prisma.testimonial.findMany({
      where: {
        userId: user.id,
      },
      include: {
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            appointmentTime: true,
            status: true,
            doctor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      testimonials,
    });
  } catch (error) {
    console.error("User testimonials GET error:", error);

    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const body = await request.json();

    const appointmentId =
      typeof body.appointmentId === "string"
        ? body.appointmentId.trim()
        : "";

    const rating = Number(body.rating);

    const feedback =
      typeof body.feedback === "string"
        ? normalizeFeedback(body.feedback)
        : "";

    if (!appointmentId) {
      return NextResponse.json(
        {
          error: "Appointment is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          error: "Rating must be between 1 and 5 stars.",
        },
        {
          status: 400,
        }
      );
    }

    if (feedback.length < MIN_FEEDBACK_LENGTH) {
      return NextResponse.json(
        {
          error: `Feedback must be at least ${MIN_FEEDBACK_LENGTH} characters.`,
        },
        {
          status: 400,
        }
      );
    }

    if (feedback.length > MAX_FEEDBACK_LENGTH) {
      return NextResponse.json(
        {
          error: `Feedback must not exceed ${MAX_FEEDBACK_LENGTH} characters.`,
        },
        {
          status: 400,
        }
      );
    }

    if (containsBlockedContent(feedback)) {
      return NextResponse.json(
        {
          error: "Your feedback contains invalid content.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * IMPORTANT:
     * We verify both the user and COMPLETED status on the server.
     */
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        userId: user.id,
        status: "COMPLETED",
      },
      select: {
        id: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        {
          error:
            "You can only submit feedback for a completed appointment.",
        },
        {
          status: 403,
        }
      );
    }

    const existingTestimonial =
      await prisma.testimonial.findUnique({
        where: {
          appointmentId,
        },
      });

    if (existingTestimonial) {
      return NextResponse.json(
        {
          error:
            "You have already submitted feedback for this appointment.",
        },
        {
          status: 409,
        }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        userId: user.id,
        appointmentId: appointment.id,
        rating,
        feedback,
        status: "PENDING",
      },
      include: {
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            appointmentTime: true,
            doctor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you. Your feedback has been submitted for review.",
        testimonial,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("User testimonial POST error:", error);

    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to submit feedback.",
      },
      {
        status: 500,
      }
    );
  }
}