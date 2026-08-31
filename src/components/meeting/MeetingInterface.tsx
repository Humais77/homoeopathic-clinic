"use client";

import { useEffect, useState } from "react";
import {
  useTracks,
  useLocalParticipant,
  useRoomContext,
  ParticipantTile,
} from "@livekit/components-react";
import { Track } from "livekit-client";

type Props = {
  meetingType: "VIDEO" | "VOICE";
  hasAudio: boolean;
  hasVideo: boolean;
};

export function MeetingInterface({ meetingType, hasAudio, hasVideo }: Props) {
  const room = useRoomContext();
  const tracks = useTracks([
    {
      source: Track.Source.Camera,
      withPlaceholder: true,
    },
  ]);

  const { isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();

  const [mic, setMic] = useState(false);
  const [camera, setCamera] = useState(false);
  const [deviceError, setDeviceError] = useState("");

  useEffect(() => {
    setMic(isMicrophoneEnabled);
    setCamera(isCameraEnabled);
  }, [isMicrophoneEnabled, isCameraEnabled]);

  useEffect(() => {
    // Set initial device error message
    if (!hasAudio && !hasVideo) {
      setDeviceError("No camera or microphone detected. You are in view-only mode.");
    } else if (!hasAudio) {
      setDeviceError("No microphone detected. You can watch but won't be heard.");
    } else if (!hasVideo && meetingType === "VIDEO") {
      setDeviceError("No camera detected. You can participate with audio only.");
    }
  }, [hasAudio, hasVideo, meetingType]);

  async function toggleMic() {
    if (!hasAudio) {
      setDeviceError("No microphone available.");
      return;
    }

    try {
      const enabled = !isMicrophoneEnabled;
      await room.localParticipant.setMicrophoneEnabled(enabled);
      setMic(enabled);
      setDeviceError("");
    } catch (error) {
      console.error("Microphone error:", error);
      setDeviceError("Unable to access microphone. Please check your browser permissions.");
    }
  }

  async function toggleCamera() {
    if (meetingType === "VOICE" || !hasVideo) {
      return;
    }

    try {
      const enabled = !isCameraEnabled;
      await room.localParticipant.setCameraEnabled(enabled);
      setCamera(enabled);
      setDeviceError("");
    } catch (error) {
      console.error("Camera error:", error);
      setDeviceError("Unable to access camera. Please check your browser permissions.");
    }
  }

  function leaveMeeting() {
    room.disconnect();
    window.history.back();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050d32]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 text-white">
        <div>
          <h1 className="text-lg font-semibold">Heal By Nature</h1>
          <p className="text-xs text-white/60">Private Consultation</p>
        </div>

        <div className="flex items-center gap-3">
          {deviceError && (
            <div className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs text-yellow-300">
              {deviceError}
            </div>
          )}
          <div className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300">
            Connected
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex flex-1 items-center justify-center p-6">
        {meetingType === "VIDEO" && hasVideo ? (
          <div className="grid w-full max-w-6xl gap-4 md:grid-cols-2">
            {tracks.length > 0 ? (
              tracks.map((track) => (
                <div
                  key={track.publication?.trackSid ?? track.participant.identity}
                  className="aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl"
                >
                  <ParticipantTile trackRef={track} className="h-full w-full" />
                </div>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center text-white">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-white/60">
                  Waiting for participants...
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-white">
            <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-white/10 text-4xl">
              {meetingType === "VIDEO" ? "📹" : "🎙️"}
            </div>
            
            <h2 className="text-2xl font-semibold">
              {meetingType === "VIDEO" ? "Video Consultation" : "Voice Consultation"}
            </h2>
            
            <p className="mt-2 text-sm text-white/60">
              {!hasAudio && !hasVideo
                ? "View-only mode - no camera or microphone detected"
                : !hasAudio
                  ? "Audio unavailable - microphone not detected"
                  : meetingType === "VIDEO" && !hasVideo
                    ? "Camera unavailable - joining with audio only"
                    : "Your consultation is in progress"}
            </p>
            
            {deviceError && (
              <div className="mt-4 rounded-lg bg-yellow-500/20 px-4 py-2 text-sm text-yellow-300">
                {deviceError}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Controls */}
      <footer className="flex items-center justify-center gap-4 border-t border-white/10 px-6 py-5">
        <button
          type="button"
          onClick={toggleMic}
          disabled={!hasAudio}
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            mic ? "bg-white/10 text-white" : "bg-red-500 text-white"
          } ${!hasAudio ? "opacity-50 cursor-not-allowed" : ""}`}
          title={hasAudio ? (mic ? "Mute microphone" : "Unmute microphone") : "No microphone available"}
        >
          {mic ? "🎙️" : "🔇"}
        </button>

        {meetingType === "VIDEO" && (
          <button
            type="button"
            onClick={toggleCamera}
            disabled={!hasVideo}
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              camera ? "bg-white/10 text-white" : "bg-red-500 text-white"
            } ${!hasVideo ? "opacity-50 cursor-not-allowed" : ""}`}
            title={hasVideo ? (camera ? "Turn camera off" : "Turn camera on") : "No camera available"}
          >
            {camera ? "📹" : "🚫"}
          </button>
        )}

        <button
          type="button"
          onClick={leaveMeeting}
          className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
        >
          End Call
        </button>
      </footer>
    </div>
  );
}