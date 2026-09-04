import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { slugify } from "@/src/lib/slugify";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function requireDoctor() {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    return null;
  }

  return user;
}

async function createUniqueSlug(
  name: string,
  currentId: string
) {
  const baseSlug = slugify(name);

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.treatment.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function GET(
  _request: Request,
  { params }: Props
) {
  try {
    const user = await requireDoctor();

    if (!user) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const treatment = await prisma.treatment.findFirst({
      where: {
        id,
        authorId: user.id,
      },
    });

    if (!treatment) {
      return NextResponse.json(
        { error: "Treatment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      treatment,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch treatment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Props
) {
  try {
    const user = await requireDoctor();

    if (!user) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing =
      await prisma.treatment.findFirst({
        where: {
          id,
          authorId: user.id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        { error: "Treatment not found" },
        { status: 404 }
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

    const data: Record<string, unknown> = {};

    if (typeof name === "string" && name.trim()) {
      data.name = name.trim();

      if (name.trim() !== existing.name) {
        data.slug = await createUniqueSlug(
          name,
          id
        );
      }
    }

    if (typeof category === "string") {
      data.category =
        category.trim() || null;
    }

    if (typeof description === "string") {
      data.description =
        description.trim() || null;
    }

    if (typeof content === "string") {
      data.content =
        content.trim() || null;
    }

    if (image !== undefined) {
      data.image = image || null;
    }

    if (imagePublicId !== undefined) {
      data.imagePublicId =
        imagePublicId || null;
    }

    /**
     * Doctor can ONLY use:
     * DRAFT
     * PENDING_REVIEW
     */
    if (status === "PENDING_REVIEW") {
      data.status = "PENDING_REVIEW";
      data.isActive = false;
    } else if (status === "DRAFT") {
      data.status = "DRAFT";
      data.isActive = false;
    }

    /**
     * Explicitly prevent:
     *
     * PUBLISHED
     * ARCHIVED
     */
    const treatment =
      await prisma.treatment.update({
        where: { id },
        data,
      });

    return NextResponse.json({
      message:
        treatment.status === "PENDING_REVIEW"
          ? "Treatment submitted for review"
          : "Treatment saved successfully",

      treatment,
    });
  } catch (error) {
    console.error(
      "PATCH /api/doctor/treatments/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update treatment",
      },
      { status: 500 }
    );
  }
}