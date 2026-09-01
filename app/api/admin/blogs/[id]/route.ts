import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { createSlug } from "@/src/lib/blog";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const body = await request.json();

    const {
      title,
      excerpt,
      content,
      category,
      image,
      status,
    } = body;

    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return NextResponse.json(
        {
          success: false,
          message: "Blog not found",
        },
        { status: 404 }
      );
    }

    let slug = existingBlog.slug;

    if (
      title !== undefined &&
      title.trim() !== existingBlog.title
    ) {
      const newBaseSlug = createSlug(title);

      let newSlug = newBaseSlug;
      let counter = 1;

      while (true) {
        const found = await prisma.blog.findFirst({
          where: {
            slug: newSlug,
            NOT: {
              id,
            },
          },
        });

        if (!found) break;

        newSlug = `${newBaseSlug}-${counter}`;
        counter++;
      }

      slug = newSlug;
    }

    const data: any = {
      ...(title !== undefined && {
        title: title.trim(),
      }),

      ...(excerpt !== undefined && {
        excerpt: excerpt?.trim() || null,
      }),

      ...(content !== undefined && {
        content: content.trim(),
      }),

      ...(category !== undefined && {
        category: category?.trim() || null,
      }),

      ...(image !== undefined && {
        image: image?.trim() || null,
      }),

      ...(title !== undefined && {
        slug,
      }),
    };

    if (status !== undefined) {
      data.status = status;

      if (status === "PUBLISHED") {
        data.publishedAt =
          existingBlog.publishedAt || new Date();
      } else if (
        status === "DRAFT" ||
        status === "REJECTED" ||
        status === "ARCHIVED"
      ) {
        data.publishedAt = null;
      }
    }

    const blog = await prisma.blog.update({
      where: { id },
      data,
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
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("ADMIN UPDATE BLOG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update blog",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: Params
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const blog = await prisma.blog.findUnique({
      where: { id },
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

    await prisma.blog.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("ADMIN DELETE BLOG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete blog",
      },
      { status: 500 }
    );
  }
}
export async function GET(
  _request: NextRequest,
  { params }: Params
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const blog = await prisma.blog.findUnique({
      where: { id },
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
    console.error("ADMIN GET BLOG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load blog",
      },
      { status: 500 }
    );
  }
}