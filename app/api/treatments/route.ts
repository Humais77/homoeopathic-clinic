import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const treatments = await prisma.treatment.findMany({
      where: {
        status: "PUBLISHED",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      treatments,
    });
  } catch (error) {
    console.error("GET /api/treatments error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch treatments",
      },
      { status: 500 }
    );
  }
}