import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: Params
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        doctor: {
          select: {
            id: true,
            name: true,
            qualification: true,
            specialization: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            appointments: true,
            notifications: true,
            blogs: true,
            auditLogs: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Admin user GET error:", error);

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
        message: "Failed to fetch user",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  try {
    const admin = await requireAdmin();

    const { id } = await params;

    const body = await request.json();

    const {
      name,
      email,
      password,
      phone,
      role,
      status,
      emailVerified,
    } = body;

    const existingUser =
      await prisma.user.findUnique({
        where: {
          id,
        },
      });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Prevent admin from changing their own role.
    if (
      id === admin.id &&
      role !== undefined &&
      role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot remove your own administrator role.",
        },
        { status: 400 }
      );
    }

    // Prevent admin from disabling themselves.
    if (
      id === admin.id &&
      status !== undefined &&
      status !== "ACTIVE"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot disable your own administrator account.",
        },
        { status: 400 }
      );
    }

    const allowedRoles = [
      "USER",
      "DOCTOR",
      "ADMIN",
    ];

    const allowedStatuses = [
      "ACTIVE",
      "SUSPENDED",
      "DISABLED",
    ];

    if (
      role !== undefined &&
      !allowedRoles.includes(role)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user role",
        },
        { status: 400 }
      );
    }

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user status",
        },
        { status: 400 }
      );
    }

    if (
      email !== undefined &&
      !email?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Email cannot be empty",
        },
        { status: 400 }
      );
    }

    if (
      name !== undefined &&
      !name?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Name cannot be empty",
        },
        { status: 400 }
      );
    }

    if (
      password !== undefined &&
      password !== "" &&
      password.length < 8
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    const normalizedEmail =
      email !== undefined
        ? email.trim().toLowerCase()
        : undefined;

    if (
      normalizedEmail &&
      normalizedEmail !== existingUser.email
    ) {
      const emailOwner =
        await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        });

      if (
        emailOwner &&
        emailOwner.id !== id
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A user with this email already exists",
          },
          { status: 409 }
        );
      }
    }

    const data: {
      name?: string;
      email?: string;
      phone?: string | null;
      role?: "USER" | "DOCTOR" | "ADMIN";
      status?: "ACTIVE" | "SUSPENDED" | "DISABLED";
      emailVerified?: boolean;
      passwordHash?: string;
      sessionVersion?: {
        increment: number;
      };
    } = {};

    if (name !== undefined) {
      data.name = name.trim();
    }

    if (normalizedEmail !== undefined) {
      data.email = normalizedEmail;
    }

    if (phone !== undefined) {
      data.phone = phone?.trim() || null;
    }

    if (role !== undefined) {
      data.role = role;
    }

    if (status !== undefined) {
      data.status = status;
    }

    if (emailVerified !== undefined) {
      data.emailVerified =
        Boolean(emailVerified);
    }

    if (password) {
      data.passwordHash =
        await bcrypt.hash(password, 12);

      // Invalidate all existing sessions
      // after an admin changes the password.
      data.sessionVersion = {
        increment: 1,
      };
    }

    const user =
      await prisma.user.update({
        where: {
          id,
        },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "UPDATE_USER",
        entity: "User",
        entityId: id,
        metadata: {
          changedFields: Object.keys(body).filter(
            (field) => field !== "password"
          ),
          passwordChanged: Boolean(password),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Admin user PATCH error:", error);

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
        message: "Failed to update user",
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
    const admin = await requireAdmin();

    const { id } = await params;

    if (id === admin.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot delete your own administrator account.",
        },
        { status: 400 }
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              appointments: true,
              blogs: true,
              notifications: true,
              auditLogs: true,
              mediaAssets: true,
            },
          },
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const hasRelatedData =
      user._count.appointments > 0 ||
      user._count.blogs > 0 ||
      user._count.notifications > 0 ||
      user._count.auditLogs > 0 ||
      user._count.mediaAssets > 0;

    if (hasRelatedData) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This user has related records and cannot be deleted. Disable the account instead.",
        },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "DELETE_USER",
        entity: "User",
        entityId: id,
        metadata: {
          deletedEmail: user.email,
          deletedName: user.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Admin user DELETE error:", error);

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
        message: "Failed to delete user",
      },
      { status: 500 }
    );
  }
}