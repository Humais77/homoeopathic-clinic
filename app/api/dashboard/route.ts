import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const [
      appointments,
      consultations,
      doctors,
      services,
      blogs
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.consultationInquiry.count(),
      prisma.doctor.count(),
      prisma.treatment.count(),
      // Add blogs count if you have a Blog model
      // prisma.blog.count() ?? 0,
      Promise.resolve(0), // Temporary: return 0 for blogs
    ]);

    return NextResponse.json({
      appointments,
      consultations,
      doctors,
      services,
      blogs,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}