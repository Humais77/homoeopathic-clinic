import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
  clearSession,
} from "@/src/lib/auth";

import { prisma } from "@/src/lib/prisma";

export async function POST() {
  try {
    const user =
      await getCurrentUser();

    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGOUT",
          entity: "User",
          entityId: user.id,
        },
      });
    }

    await clearSession();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Logout error:",
      error
    );

    await clearSession();

    return NextResponse.json({
      success: true,
    });
  }
}