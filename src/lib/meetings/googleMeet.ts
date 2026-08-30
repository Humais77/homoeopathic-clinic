import { google } from "googleapis";

type CreateGoogleMeetParams = {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  patientEmail: string;
};

export async function createGoogleMeet({
  title,
  description,
  startTime,
  endTime,
  patientEmail,
}: CreateGoogleMeetParams) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (
    !clientId ||
    !clientSecret ||
    !refreshToken
  ) {
    throw new Error(
      "Google Calendar environment variables are not configured."
    );
  }

  const oauth2Client =
    new google.auth.OAuth2(
      clientId,
      clientSecret,
      process.env.GOOGLE_REDIRECT_URI
    );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client,
  });

  const event = await calendar.events.insert({
    calendarId: "primary",

    conferenceDataVersion: 1,

    sendUpdates: "all",

    requestBody: {
      summary: title,

      description,

      start: {
        dateTime: startTime,
        timeZone:
          process.env.CLINIC_TIMEZONE ||
          "Asia/Karachi",
      },

      end: {
        dateTime: endTime,
        timeZone:
          process.env.CLINIC_TIMEZONE ||
          "Asia/Karachi",
      },

      attendees: [
        {
          email: patientEmail,
        },
      ],

      conferenceData: {
        createRequest: {
          requestId: `heal-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 10)}`,

          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    },
  });

  const conference =
    event.data.conferenceData;

  const entryPoints =
    conference?.entryPoints || [];

  const videoEntryPoint =
    entryPoints.find(
      (entry) => entry.entryPointType === "video"
    );

  if (!videoEntryPoint?.uri) {
    throw new Error(
      "Google Meet link was not generated."
    );
  }

  return {
    eventId: event.data.id,
    meetingUrl: videoEntryPoint.uri,
    htmlLink: event.data.htmlLink,
  };
}