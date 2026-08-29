import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
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
    await requireAdmin();

    const { id } = await params;

    const body = await request.json();

    const {
      name,
      qualification,
      specialization,
      experience,
      description,
      image,
      isActive,
    } = body;

    const existingDoctor =
      await prisma.doctor.findUnique({
        where: {
          id,
        },
      });

    if (!existingDoctor) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor not found",
        },
        { status: 404 }
      );
    }

    const doctor =
      await prisma.doctor.update({
        where: {
          id,
        },
        data: {
          ...(name !== undefined && {
            name: name.trim(),
          }),

          ...(qualification !==
            undefined && {
            qualification:
              qualification.trim(),
          }),

          ...(specialization !==
            undefined && {
            specialization:
              specialization?.trim() ||
              null,
          }),

          ...(experience !== undefined && {
            experience:
              experience?.trim() || null,
          }),

          ...(description !==
            undefined && {
            description:
              description?.trim() || null,
          }),

          ...(image !== undefined && {
            image:
              image?.trim() || null,
          }),

          ...(isActive !== undefined && {
            isActive: Boolean(isActive),
          }),
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Doctor updated successfully",
      doctor,
    });
  } catch (error) {
    console.error(
      "Admin doctor update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update doctor",
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

    const doctor =
      await prisma.doctor.findUnique({
        where: {
          id,
        },
        include: {
          appointments: {
            select: {
              id: true,
            },
          },
        },
      });

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor not found",
        },
        { status: 404 }
      );
    }

    if (doctor.appointments.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete a doctor with existing appointments. Deactivate the doctor instead.",
        },
        { status: 400 }
      );
    }

    await prisma.doctor.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Doctor deleted successfully",
    });
  } catch (error) {
    console.error(
      "Admin doctor delete error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete doctor",
      },
      { status: 500 }
    );
  }
}