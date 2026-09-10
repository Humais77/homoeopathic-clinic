import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: Params
) {
  try {
    const user = await requireUser();

    const { id } = await params;

    const consultation =
      await prisma.consultationInquiry.findFirst({
        where: {
          id,
          userId: user.id,
        },
        include: {
          treatment: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              qualification: true,
              specialization: true,
              experience: true,
              image: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              doctor: {
                select: {
                  id: true,
                  name: true,
                  qualification: true,
                },
              },
            },
          },
        },
      });

    if (!consultation) {
      return NextResponse.json(
        {
          success: false,
          message: "Consultation not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      consultation,
    });
  } catch (error) {
    console.error(
      "Get user consultation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load consultation",
      },
      { status: 500 }
    );
  }
}