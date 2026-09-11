import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const testimonials = await prisma.testimonial.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
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
    console.error("Admin testimonials GET error:", error);

    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "Forbidden"
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Unable to load testimonials." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    const status = body.status;

    const adminNote =
      typeof body.adminNote === "string"
        ? body.adminNote.trim()
        : null;

    if (!id) {
      return NextResponse.json(
        { error: "Testimonial ID is required." },
        { status: 400 }
      );
    }

    if (
      status !== "PUBLISHED" &&
      status !== "REJECTED" &&
      status !== "PENDING"
    ) {
      return NextResponse.json(
        { error: "Invalid testimonial status." },
        { status: 400 }
      );
    }

    const testimonial =
      await prisma.testimonial.findUnique({
        where: {
          id,
        },
      });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found." },
        { status: 404 }
      );
    }

    const updated =
      await prisma.testimonial.update({
        where: {
          id,
        },
        data: {
          status,
          adminNote:
            adminNote || null,
          reviewedAt:
            status === "PENDING"
              ? null
              : new Date(),
          reviewedById:
            status === "PENDING"
              ? null
              : admin.id,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
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

    return NextResponse.json({
      success: true,
      testimonial: updated,
    });
  } catch (error) {
    console.error("Admin testimonial PATCH error:", error);

    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "Forbidden"
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Unable to update testimonial." },
      { status: 500 }
    );
  }
}