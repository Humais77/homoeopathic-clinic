import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const pharmacies = await prisma.pharmacy.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      pharmacies,
    });
  } catch (error) {
    console.error("Admin pharmacies GET error:", error);

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
          message: "Forbidden",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load pharmacies",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const {
      name,
      description,
      image,
      imagePublicId,
      address,
      phone,
      website,
      mapsUrl,
      isActive = true,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Pharmacy name is required",
        },
        { status: 400 }
      );
    }

    const pharmacy = await prisma.pharmacy.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        image: image?.trim() || null,
        imagePublicId: imagePublicId?.trim() || null,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        mapsUrl: mapsUrl?.trim() || null,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pharmacy created successfully",
        pharmacy,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin pharmacies POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create pharmacy",
      },
      { status: 500 }
    );
  }
}