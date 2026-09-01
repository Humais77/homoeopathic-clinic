import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: Params
) {
  try {
    const { slug } = await params;

    const blog = await prisma.blog.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        category: true,
        image: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            role: true,
            doctor: {
              select: {
                qualification: true,
                specialization: true,
              },
            },
          },
        },
      },
    });

    if (!blog) {
      return NextResponse.json(
        {
          success: false,
          message: "Blog not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("GET BLOG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load blog",
      },
      { status: 500 }
    );
  }
}