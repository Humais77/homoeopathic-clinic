"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { useEffect, useState } from "react";
import { MeetingInterface } from "./MeetingInterface";

type Props = {
  appointmentId: string;
};

type MeetingResponse = {
  success: boolean;
  token: string;
  serverUrl: string;
  roomName: string;
  meetingType: "VIDEO" | "VOICE";
  provider?: "LIVEKIT" | "ZOOM" | "GOOGLE_MEET";
  meetingUrl?: string;
  message?: string;
};

export function MeetingRoom({ appointmentId }: Props) {
  const [data, setData] = useState<MeetingResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasAudio, setHasAudio] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [deviceCheckComplete, setDeviceCheckComplete] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const audioDevices = devices.filter(device => device.kind === "audioinput");
        const videoDevices = devices.filter(device => device.kind === "videoinput");
        
        if (mounted) {
          setHasAudio(audioDevices.length > 0);
          setHasVideo(videoDevices.length > 0);
          setDeviceCheckComplete(true);
        }
      } catch (error) {
        console.error("Error checking devices:", error);
        if (mounted) {
          setHasAudio(false);
          setHasVideo(false);
          setDeviceCheckComplete(true);
        }
      }
    }

    checkDevices();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function joinMeeting() {
      if (!deviceCheckComplete) return;

      try {
        const response = await fetch(`/api/meetings/${appointmentId}/token`, {
          method: "POST",
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to join meeting.");
        }

        if (mounted) {
          setData(result);
          
          // If it's an external meeting (Zoom/Google Meet), redirect
          if (result.provider === "ZOOM" || result.provider === "GOOGLE_MEET") {
            if (result.meetingUrl) {
              window.location.href = result.meetingUrl;
              return;
            }
          }
        }
      } catch (error) {
        if (mounted) {
          setError(
            error instanceof Error ? error.message : "Unable to join meeting."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (deviceCheckComplete) {
      joinMeeting();
    }

    return () => {
      mounted = false;
    };
  }, [appointmentId, deviceCheckComplete]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050d32] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p>Preparing your private meeting...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050d32] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-bold text-red-600">Unable to Join Meeting</h1>
          <p className="mt-3 text-sm text-gray-600">{error}</p>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mt-6 rounded-xl bg-[#151568] px-6 py-3 text-sm font-semibold text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Handle external meetings (Zoom/Google Meet)
  if (data.provider === "ZOOM" || data.provider === "GOOGLE_MEET") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050d32] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-bold text-gray-900">
            Opening {data.provider === "ZOOM" ? "Zoom" : "Google Meet"} Meeting
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            You are being redirected to your meeting...
          </p>
          <a
            href={data.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-xl bg-[#151568] px-6 py-3 text-sm font-semibold text-white"
          >
            Click here if not redirected
          </a>
        </div>
      </div>
    );
  }

  // LiveKit meeting
  return (
    <LiveKitRoom
      token={data.token}
      serverUrl={data.serverUrl}
      connect={true}
      audio={hasAudio}
      video={hasVideo && data.meetingType === "VIDEO"}
      className="min-h-screen"
      onError={(error) => {
        console.error("LiveKit room error:", error);
      }}
    >
      <MeetingInterface 
        meetingType={data.meetingType}
        hasAudio={hasAudio}
        hasVideo={hasVideo}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}