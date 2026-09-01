import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { createSlug } from "@/src/lib/blog";

async function generateUniqueSlug(title: string) {
  const baseSlug = createSlug(title);

  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.blog.findUnique({
      where: { slug },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function GET() {
  try {
    await requireAdmin();

    const blogs = await prisma.blog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      blogs,
    });
  } catch (error) {
    console.error("ADMIN GET BLOGS ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "Forbidden"
    ) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load blogs",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();

    const {
      title,
      excerpt,
      content,
      category,
      image,
      status = "DRAFT",
    } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and content are required",
        },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(title);

    const validStatuses = [
      "DRAFT",
      "PENDING_REVIEW",
      "PUBLISHED",
      "REJECTED",
      "ARCHIVED",
    ];

    const finalStatus = validStatuses.includes(status)
      ? status
      : "DRAFT";

    const blog = await prisma.blog.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        category: category?.trim() || null,
        image: image?.trim() || null,
        status: finalStatus,
        authorId: admin.id,
        publishedAt:
          finalStatus === "PUBLISHED"
            ? new Date()
            : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Blog created successfully",
        blog,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADMIN CREATE BLOG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create blog",
      },
      { status: 500 }
    );
  }
}