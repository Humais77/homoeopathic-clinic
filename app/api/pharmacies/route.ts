import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const pharmacies = await prisma.pharmacy.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      pharmacies,
    });
  } catch (error) {
    console.error("Public pharmacies GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load pharmacies",
      },
      { status: 500 }
    );
  }
}