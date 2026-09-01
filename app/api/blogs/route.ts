import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: {
        publishedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        image: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      blogs,
    });
  } catch (error) {
    console.error("GET PUBLIC BLOGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load blogs",
      },
      { status: 500 }
    );
  }
}