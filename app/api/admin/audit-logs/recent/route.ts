import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const logs = await prisma.auditLog.findMany({
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Recent audit logs error:", error);

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