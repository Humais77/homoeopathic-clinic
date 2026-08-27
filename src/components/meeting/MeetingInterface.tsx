"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useTracks,
  useLocalParticipant,
  useRoomContext,
  ParticipantTile,
} from "@livekit/components-react";

import {
  Track,
} from "livekit-client";

type Props = {
  meetingType: "VIDEO" | "VOICE";
};

export function MeetingInterface({
  meetingType,
}: Props) {
  const room = useRoomContext();

  const tracks =
    useTracks([
      {
        source:
          Track.Source.Camera,
        withPlaceholder: true,
      },
    ]);

  const {
    isMicrophoneEnabled,
    isCameraEnabled,
  } =
    useLocalParticipant();

  const [mic, setMic] =
    useState(isMicrophoneEnabled);

  const [camera, setCamera] =
    useState(isCameraEnabled);

  useEffect(() => {
    setMic(isMicrophoneEnabled);
    setCamera(isCameraEnabled);
  }, [
    isMicrophoneEnabled,
    isCameraEnabled,
  ]);

  async function toggleMic() {
    const enabled =
      !isMicrophoneEnabled;

    await room.localParticipant.setMicrophoneEnabled(
      enabled
    );

    setMic(enabled);
  }

  async function toggleCamera() {
    if (meetingType === "VOICE") {
      return;
    }

    const enabled =
      !isCameraEnabled;

    await room.localParticipant.setCameraEnabled(
      enabled
    );

    setCamera(enabled);
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
          <h1 className="text-lg font-semibold">
            Heal By Nature
          </h1>

          <p className="text-xs text-white/60">
            Private Consultation
          </p>
        </div>

        <div className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300">
          Connected
        </div>
      </header>

      {/* Video area */}
      <main className="flex flex-1 items-center justify-center p-6">

        {meetingType === "VIDEO" ? (
          <div className="grid w-full max-w-6xl gap-4 md:grid-cols-2">
            {tracks.map((track) => (
              <div
                key={track.publication?.trackSid ?? track.participant.identity}
                className="aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl"
              >
                <ParticipantTile
                  trackRef={track}
                  className="h-full w-full"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-white">
            <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-white/10 text-4xl">
              🎙️
            </div>

            <h2 className="text-2xl font-semibold">
              Voice Consultation
            </h2>

            <p className="mt-2 text-sm text-white/60">
              Your audio consultation is in progress
            </p>
          </div>
        )}

      </main>

      {/* Controls */}
      <footer className="flex items-center justify-center gap-4 border-t border-white/10 px-6 py-5">

        <button
          type="button"
          onClick={toggleMic}
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            mic
              ? "bg-white/10 text-white"
              : "bg-red-500 text-white"
          }`}
          title={
            mic
              ? "Mute microphone"
              : "Unmute microphone"
          }
        >
          {mic ? "🎙️" : "🔇"}
        </button>

        {meetingType === "VIDEO" && (
          <button
            type="button"
            onClick={toggleCamera}
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              camera
                ? "bg-white/10 text-white"
                : "bg-red-500 text-white"
            }`}
            title={
              camera
                ? "Turn camera off"
                : "Turn camera on"
            }
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