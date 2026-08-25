import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE = "session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

async function getSessionUserId(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      getSecretKey()
    );

    if (
      !payload.userId ||
      typeof payload.userId !== "string"
    ) {
      return null;
    }

    return payload.userId;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const userId = await getSessionUserId(request);

  // No login -> custom 404
  if (!userId) {
    return new NextResponse(null, {
      status: 404,
    });
  }

  /*
   * We have the user ID, but middleware should not directly
   * use your Prisma client.
   *
   * Instead, let the admin layout/API authorization handle
   * the role check.
   */

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};