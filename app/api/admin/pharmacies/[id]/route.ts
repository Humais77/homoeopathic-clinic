import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import cloudinary from "@/src/lib/cloudinary";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const pharmacy = await prisma.pharmacy.findUnique({
      where: {
        id,
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        {
          success: false,
          message: "Pharmacy not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pharmacy,
    });
  } catch (error) {
    console.error("Admin pharmacy GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load pharmacy",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    await requireAdmin();

    const { id } = await params;

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
      isActive,
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

    const existingPharmacy =
      await prisma.pharmacy.findUnique({
        where: {
          id,
        },
      });

    if (!existingPharmacy) {
      return NextResponse.json(
        {
          success: false,
          message: "Pharmacy not found",
        },
        { status: 404 }
      );
    }

    /*
     * Delete old Cloudinary image when a new image
     * has been uploaded.
     */
    if (
      existingPharmacy.imagePublicId &&
      imagePublicId &&
      existingPharmacy.imagePublicId !== imagePublicId
    ) {
      try {
        await cloudinary.uploader.destroy(
          existingPharmacy.imagePublicId
        );
      } catch (cloudinaryError) {
        console.error(
          "Failed to delete old pharmacy image:",
          cloudinaryError
        );
      }
    }

    const pharmacy = await prisma.pharmacy.update({
      where: {
        id,
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        image: image?.trim() || null,
        imagePublicId:
          imagePublicId?.trim() || null,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        mapsUrl: mapsUrl?.trim() || null,
        isActive:
          typeof isActive === "boolean"
            ? isActive
            : existingPharmacy.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pharmacy updated successfully",
      pharmacy,
    });
  } catch (error) {
    console.error("Admin pharmacy PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update pharmacy",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const pharmacy =
      await prisma.pharmacy.findUnique({
        where: {
          id,
        },
      });

    if (!pharmacy) {
      return NextResponse.json(
        {
          success: false,
          message: "Pharmacy not found",
        },
        { status: 404 }
      );
    }

    if (pharmacy.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(
          pharmacy.imagePublicId
        );
      } catch (cloudinaryError) {
        console.error(
          "Failed to delete pharmacy image:",
          cloudinaryError
        );
      }
    }

    await prisma.pharmacy.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pharmacy deleted successfully",
    });
  } catch (error) {
    console.error("Admin pharmacy DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete pharmacy",
      },
      { status: 500 }
    );
  }
}