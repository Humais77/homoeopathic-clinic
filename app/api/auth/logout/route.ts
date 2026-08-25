import { clearSession } from "@/src/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  await clearSession();

  return NextResponse.json({
    success: true,
  });
}