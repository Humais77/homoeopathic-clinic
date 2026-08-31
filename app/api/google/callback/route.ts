import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { message: "Authorization code is missing." },
      { status: 400 }
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { message: "Google OAuth environment variables are missing." },
      { status: 500 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log("Google OAuth tokens:", tokens);

    return NextResponse.json({
      message: "Google authorization successful.",
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
    });
  } catch (error) {
    console.error("Google OAuth error:", error);

    return NextResponse.json(
      {
        message: "Failed to exchange authorization code.",
      },
      { status: 500 }
    );
  }
}