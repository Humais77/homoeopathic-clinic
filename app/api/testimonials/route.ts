import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        id: true,
        rating: true,
        feedback: true,
        createdAt: true,
        user: {
          select: {
            name: true,
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
    console.error("Public testimonials error:", error);

    return NextResponse.json(
      {
        error: "Unable to load testimonials.",
      },
      {
        status: 500,
      }
    );
  }
}