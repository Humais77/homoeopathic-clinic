import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: Props
) {
  try {
    const { slug } = await params;

    const treatment = await prisma.treatment.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        content: true,
        image: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!treatment) {
      return NextResponse.json(
        {
          error: "Treatment not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      treatment,
    });
  } catch (error) {
    console.error(
      "GET /api/treatments/[slug] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch treatment",
      },
      { status: 500 }
    );
  }
}