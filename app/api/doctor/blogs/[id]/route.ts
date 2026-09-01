import { NextRequest, NextResponse } from "next/server";
import { requireDoctor } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

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
    const doctor = await requireDoctor();

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

    const existingBlog = await prisma.blog.findFirst({
      where: {
        id,
        authorId: doctor.id,
      },
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

    if (existingBlog.status === "PUBLISHED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Published blogs cannot be edited directly. Please ask an administrator.",
        },
        { status: 400 }
      );
    }

    let finalStatus = existingBlog.status;

    if (status === "PENDING_REVIEW") {
      finalStatus = "PENDING_REVIEW";
    } else if (status === "DRAFT") {
      finalStatus = "DRAFT";
    }

    const blog = await prisma.blog.update({
      where: {
        id,
      },
      data: {
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

        status: finalStatus,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        finalStatus === "PENDING_REVIEW"
          ? "Blog submitted for review"
          : "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("DOCTOR UPDATE BLOG ERROR:", error);

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
    const doctor = await requireDoctor();

    const { id } = await params;

    const blog = await prisma.blog.findFirst({
      where: {
        id,
        authorId: doctor.id,
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

    if (blog.status === "PUBLISHED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Published blogs cannot be deleted by doctors.",
        },
        { status: 400 }
      );
    }

    await prisma.blog.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("DOCTOR DELETE BLOG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete blog",
      },
      { status: 500 }
    );
  }
}