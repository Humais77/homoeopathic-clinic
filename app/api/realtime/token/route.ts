import { NextResponse } from "next/server";
import { ably } from "@/src/lib/ably";
import {
  getCurrentUser,
} from "@/src/lib/auth";

export async function GET() {
  try {
   const session =
  await getCurrentUser();

if (!session) {
  return NextResponse.json(
    {
      message: "Unauthorized",
    },
    {
      status: 401,
    }
  );
}

    const capabilities: Record<
      string,
      string[]
    > = {};

    if (session.role === "ADMIN") {
      capabilities["admins:notifications"] = [
        "subscribe",
      ];
    }

    if (session.role === "USER") {
      capabilities[
        `user:${session.id}:notifications`
      ] = ["subscribe"];
    }

    if (session.role === "DOCTOR") {
      capabilities[
        `doctor:${session.id}:notifications`
      ] = ["subscribe"];
    }

    const tokenRequest =
      await ably.auth.createTokenRequest({
        clientId: session.id,
        capability:
          JSON.stringify(capabilities),
        ttl: 60 * 60 * 1000,
      });

    return NextResponse.json(
      tokenRequest
    );
  } catch (error) {
    console.error(
      "Ably token error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to authenticate realtime connection.",
      },
      {
        status: 500,
      }
    );
  }
}