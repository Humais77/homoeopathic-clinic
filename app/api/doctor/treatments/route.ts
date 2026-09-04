import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { slugify } from "@/src/lib/slugify";

async function requireDoctor() {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    return null;
  }

  return user;
}

async function createUniqueSlug(name: string) {
  const baseSlug = slugify(name);

  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.treatment.findUnique({
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
    const user = await requireDoctor();

    if (!user) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const treatments = await prisma.treatment.findMany({
      where: {
        authorId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      treatments,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch treatments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDoctor();

    if (!user) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      category,
      description,
      content,
      image,
      imagePublicId,
      status,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          error: "Treatment name is required",
        },
        { status: 400 }
      );
    }

    const slug = await createUniqueSlug(name);

    /**
     * IMPORTANT:
     *
     * Doctor can NEVER publish directly.
     */
    const safeStatus =
      status === "PENDING_REVIEW"
        ? "PENDING_REVIEW"
        : "DRAFT";

    const treatment = await prisma.treatment.create({
      data: {
        name: name.trim(),
        slug,

        category: category?.trim() || null,

        description:
          description?.trim() || null,

        content:
          content?.trim() || null,

        image: image || null,

        imagePublicId:
          imagePublicId || null,

        status: safeStatus,

        isActive: false,

        authorId: user.id,
      },
    });

    return NextResponse.json(
      {
        message:
          safeStatus === "PENDING_REVIEW"
            ? "Treatment submitted for review"
            : "Treatment saved as draft",

        treatment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/doctor/treatments error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create treatment",
      },
      { status: 500 }
    );
  }
}