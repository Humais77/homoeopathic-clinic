import { NextRequest, NextResponse } from "next/server";
import { requireDoctor } from "@/src/lib/auth";
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
    const doctor = await requireDoctor();

    const blogs = await prisma.blog.findMany({
      where: {
        authorId: doctor.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      blogs,
    });
  } catch (error) {
    console.error("DOCTOR GET BLOGS ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "Forbidden"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor access required",
        },
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
    const doctor = await requireDoctor();

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

    const allowedStatus =
      status === "PENDING_REVIEW"
        ? "PENDING_REVIEW"
        : "DRAFT";

    const blog = await prisma.blog.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        category: category?.trim() || null,
        image: image?.trim() || null,
        status: allowedStatus,
        authorId: doctor.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          allowedStatus === "PENDING_REVIEW"
            ? "Blog submitted for review"
            : "Blog saved as draft",
        blog,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("DOCTOR CREATE BLOG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create blog",
      },
      { status: 500 }
    );
  }
}