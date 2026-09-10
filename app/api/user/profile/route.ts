import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/src/lib/prisma";
import { requireUser } from "@/src/lib/auth";

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must not exceed 100 characters."),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .nullable()
    .optional(),

  whatsappOptIn: z.boolean().optional(),
});

const MAX_NAME_CHANGES = 2;
const MAX_PHONE_CHANGES = 2;

export async function GET() {
  try {
    const user = await requireUser();

    const profile = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsappOptIn: true,
        emailVerified: true,
        nameChangeCount: true,
        phoneChangeCount: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
      limits: {
        maxNameChanges: MAX_NAME_CHANGES,
        maxPhoneChanges: MAX_PHONE_CHANGES,
        remainingNameChanges: Math.max(
          0,
          MAX_NAME_CHANGES - profile.nameChangeCount
        ),
        remainingPhoneChanges: Math.max(
          0,
          MAX_PHONE_CHANGES - profile.phoneChangeCount
        ),
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized.",
      },
      { status: 401 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();

    const body = await request.json();

    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid data.",
        },
        { status: 400 }
      );
    }

    const input = parsed.data;

    const currentUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        whatsappOptIn: true,
        nameChangeCount: true,
        phoneChangeCount: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    const newName = input.name;
    const newPhone =
      input.phone === undefined
        ? currentUser.phone
        : input.phone || null;

    const newWhatsappOptIn =
      input.whatsappOptIn === undefined
        ? currentUser.whatsappOptIn
        : input.whatsappOptIn;

    const nameChanged = newName !== currentUser.name;
    const phoneChanged = newPhone !== currentUser.phone;

    // Nothing changed.
    if (!nameChanged && !phoneChanged) {
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          whatsappOptIn: newWhatsappOptIn,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          whatsappOptIn: true,
          emailVerified: true,
          nameChangeCount: true,
          phoneChangeCount: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Profile updated successfully.",
        profile: updatedUser,
      });
    }

    // Check name limit.
    if (
      nameChanged &&
      currentUser.nameChangeCount >= MAX_NAME_CHANGES
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You have reached the maximum number of name changes. Please contact the clinic if you need further assistance.",
          field: "name",
        },
        { status: 403 }
      );
    }

    // Check phone limit.
    if (
      phoneChanged &&
      currentUser.phoneChangeCount >= MAX_PHONE_CHANGES
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You have reached the maximum number of phone number changes. Please contact the clinic if you need further assistance.",
          field: "phone",
        },
        { status: 403 }
      );
    }

    /*
     * Use a transaction so the profile and counters
     * remain consistent.
     */
    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: newName,
          phone: newPhone,
          whatsappOptIn: newWhatsappOptIn,

          ...(nameChanged && {
            nameChangeCount: {
              increment: 1,
            },
          }),

          ...(phoneChanged && {
            phoneChangeCount: {
              increment: 1,
            },
          }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          whatsappOptIn: true,
          emailVerified: true,
          nameChangeCount: true,
          phoneChangeCount: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "USER_PROFILE_UPDATED",
          entity: "User",
          entityId: user.id,
          metadata: {
            nameChanged,
            phoneChanged,
            whatsappOptInChanged:
              newWhatsappOptIn !== currentUser.whatsappOptIn,
          },
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      profile: updatedUser,
      limits: {
        maxNameChanges: MAX_NAME_CHANGES,
        maxPhoneChanges: MAX_PHONE_CHANGES,
        remainingNameChanges: Math.max(
          0,
          MAX_NAME_CHANGES - updatedUser.nameChangeCount
        ),
        remainingPhoneChanges: Math.max(
          0,
          MAX_PHONE_CHANGES - updatedUser.phoneChangeCount
        ),
      },
    });
  } catch (error) {
    console.error("Update user profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update your profile.",
      },
      { status: 500 }
    );
  }
}