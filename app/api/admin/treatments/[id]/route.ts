import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const existingTreatment = await prisma.treatment.findUnique({
      where: {
        id,
      },
    });

    if (!existingTreatment) {
      return NextResponse.json(
        {
          error: "Treatment not found",
        },
        {
          status: 404,
        }
      );
    }

    const data: {
      name?: string;
      description?: string | null;
      isActive?: boolean;
    } = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();

      if (!name) {
        return NextResponse.json(
          {
            error: "Treatment name cannot be empty",
          },
          {
            status: 400,
          }
        );
      }

      const duplicate = await prisma.treatment.findFirst({
        where: {
          name,
          NOT: {
            id,
          },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            error: "Another treatment already uses this name",
          },
          {
            status: 409,
          }
        );
      }

      data.name = name;
    }

    if (body.description !== undefined) {
      data.description =
        body.description === null ||
        body.description === ""
          ? null
          : String(body.description).trim();
    }

    if (body.isActive !== undefined) {
      data.isActive = Boolean(body.isActive);
    }

    const treatment = await prisma.treatment.update({
      where: {
        id,
      },
      data,
    });

    return NextResponse.json({
      treatment,
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/treatments/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update treatment",
      },
      {
        status: 500,
      }
    );
  }
}