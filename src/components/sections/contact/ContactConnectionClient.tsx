"use client";

import { useContactBooking } from "./ContactBookingProvider";
import type { ConnectionMethod } from "./ContactBookingProvider";

type ConnectionMethodOption = {
  id: string;
  title: string;
  description: string;
  type: string;
};

type Props = {
  methods: ConnectionMethodOption[];
};

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="14" height="14" rx="2" />
      <path d="m17 9 4-2v10l-4-2" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="14" height="14" rx="2" />
      <path d="m17 9 4-2v10l-4-2" />
      <circle cx="10" cy="12" r="2" />
    </svg>
  );
}

export function ContactConnectionClient({ methods }: Props) {
  const { meetingType, connectionMethod, setConnectionMethod } = useContactBooking();

  // Hide for clinic visits
  if (meetingType === "clinic") {
    return null;
  }

  const allowedMethods = methods.filter((method) => {
    if (meetingType === "video") {
      // For video: allow Zoom, Google Meet, and LiveKit (direct)
      return (
        method.id === "zoom" ||
        method.id === "google_meet" ||
        method.id === "livekit"
      );
    }

    if (meetingType === "voice") {
      // For voice: allow Zoom and LiveKit
      return method.id === "zoom" || method.id === "livekit";
    }

    return false;
  });

  // If no methods available, don't render
  if (allowedMethods.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {allowedMethods.map((method) => {
        const isSelected = connectionMethod === method.id;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => {
              setConnectionMethod(method.id as ConnectionMethod);
            }}
            className={`min-h-[142px] rounded-xl border px-3 py-4 text-center transition-all duration-200 ${
              isSelected
                ? "border-[#151568] bg-[#151568] text-white shadow-sm"
                : "border-gray-300 bg-white text-[#123c31] hover:border-[#151568]"
            }`}
          >
            <div
              className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                isSelected ? "bg-white text-[#151568]" : "bg-[#f6f6f9] text-[#151568]"
              }`}
            >
              {method.type === "phone" ? (
                <PhoneIcon />
              ) : method.type === "zoom" ? (
                <ZoomIcon />
              ) : (
                <VideoIcon />
              )}
            </div>

            <h3 className="text-base font-semibold md:text-lg">{method.title}</h3>

            <p className={`mt-1 text-[10px] leading-4 md:text-xs ${
              isSelected ? "text-white/75" : "text-gray-500"
            }`}>
              {method.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}