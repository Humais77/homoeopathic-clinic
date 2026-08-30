type CreateZoomMeetingParams = {
  topic: string;
  startTime: string;
  duration: number;
  patientName: string;
};

type ZoomMeetingResponse = {
  id: number;
  join_url: string;
  start_url: string;
  password?: string;
};

async function getZoomAccessToken() {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error(
      "Zoom environment variables are not configured."
    );
  }

  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response = await fetch(
    "https://zoom.us/oauth/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "account_credentials",
        account_id: accountId,
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Zoom token error:", data);

    throw new Error(
      data?.reason ||
        data?.error ||
        "Unable to authenticate with Zoom."
    );
  }

  return data.access_token as string;
}

export async function createZoomMeeting({
  topic,
  startTime,
  duration,
  patientName,
}: CreateZoomMeetingParams) {
  const token = await getZoomAccessToken();

  const zoomUserId =
    process.env.ZOOM_USER_ID || "me";

  const response = await fetch(
    `https://api.zoom.us/v2/users/${encodeURIComponent(
      zoomUserId
    )}/meetings`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        type: 2,
        start_time: startTime,
        duration,
        timezone:
          process.env.CLINIC_TIMEZONE ||
          "Asia/Karachi",

        agenda: `Patient: ${patientName}`,

        settings: {
          waiting_room: true,
          join_before_host: false,
          mute_upon_entry: true,
          participant_video: false,
          host_video: false,
        },
      }),
      cache: "no-store",
    }
  );

  const data =
    (await response.json()) as
      | ZoomMeetingResponse
      | {
          message?: string;
          code?: number;
        };

  if (!response.ok) {
    console.error("Zoom create meeting error:", data);

    throw new Error(
      "Unable to create Zoom meeting."
    );
  }

  return data as ZoomMeetingResponse;
}