import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("User dashboard error:", error);

    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }
}