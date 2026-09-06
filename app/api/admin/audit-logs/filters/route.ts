import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const [actions, entities, users] = await Promise.all([
      prisma.auditLog.findMany({
        distinct: ["action"],
        select: {
          action: true,
        },
        orderBy: {
          action: "asc",
        },
      }),

      prisma.auditLog.findMany({
        where: {
          entity: {
            not: null,
          },
        },
        distinct: ["entity"],
        select: {
          entity: true,
        },
        orderBy: {
          entity: "asc",
        },
      }),

      prisma.user.findMany({
        where: {
          auditLogs: {
            some: {},
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

    return NextResponse.json({
      actions: actions.map((item) => item.action),
      entities: entities
        .map((item) => item.entity)
        .filter(Boolean),
      users,
    });
  } catch (error) {
    console.error("Audit filter error:", error);

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