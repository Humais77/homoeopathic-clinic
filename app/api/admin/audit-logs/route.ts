import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      Number(searchParams.get("page") || "1"),
      1
    );

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit") || "20"),
        1
      ),
      100
    );

    const search = searchParams.get("search")?.trim() || "";
    const action = searchParams.get("action")?.trim() || "";
    const entity = searchParams.get("entity")?.trim() || "";
    const userId = searchParams.get("userId")?.trim() || "";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (entity) {
      where.entity = entity;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        {
          action: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          entity: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          entityId: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          ipAddress: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.auditLog.count({
        where,
      }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Audit logs API error:", error);

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