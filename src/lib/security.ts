import { NextRequest } from "next/server";

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return (
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

export function isSafeRedirect(
  redirect: string | null
): boolean {
  if (!redirect) return false;

  if (!redirect.startsWith("/")) return false;

  if (redirect.startsWith("//")) return false;

  if (redirect.includes("://")) return false;

  return true;
}

export function getSafeRedirect(
  redirect: string | null
): string | null {
  return isSafeRedirect(redirect)
    ? redirect
    : null;
}