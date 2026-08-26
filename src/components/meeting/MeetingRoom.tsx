"use client";

import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
} from "@livekit/components-react";


import {
  useEffect,
  useState,
} from "react";

type Props = {
  appointmentId: string;
};

type MeetingResponse = {
  success: boolean;
  token: string;
  serverUrl: string;
  roomName: string;
  meetingType: "VIDEO" | "VOICE";
  message?: string;
};

export function MeetingRoom({
  appointmentId,
}: Props) {
  const [data, setData] =
    useState<MeetingResponse | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function joinMeeting() {
      try {
        const response =
          await fetch(
            `/api/meetings/${appointmentId}/token`,
            {
              method: "POST",
              credentials: "include",
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to join meeting."
          );
        }

        if (mounted) {
          setData(result);
        }
      } catch (error) {
        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to join meeting."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    joinMeeting();

    return () => {
      mounted = false;
    };
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />

          <p>
            Preparing your private meeting...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-bold text-red-600">
            Unable to Join Meeting
          </h1>

          <p className="mt-3 text-sm text-gray-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            className="mt-6 rounded-xl bg-[#151568] px-6 py-3 text-sm font-semibold text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <LiveKitRoom
        token={data.token}
        serverUrl={data.serverUrl}
        connect
        audio
        video={
          data.meetingType ===
          "VIDEO"
        }
        className="h-screen"
      >
        <div className="flex h-full flex-col">
          <div className="flex-1">
            <VideoConference />
          </div>

          <ControlBar />

          <RoomAudioRenderer />
        </div>
      </LiveKitRoom>
    </div>
  );
}