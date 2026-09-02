"use client";

import {
  useAppointmentBooking,
  type ConnectionMethod,
} from "./AppointmentBookingProvider";

type ConnectionMethodOption = {
  id: string;
  title: string;
  description: string;
  type: string;
};

type Props = {
  methods: ConnectionMethodOption[];
};

function VideoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="5"
        width="14"
        height="14"
        rx="2"
      />

      <path d="m17 9 4-2v10l-4-2" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="5"
        width="14"
        height="14"
        rx="2"
      />

      <path d="m17 9 4-2v10l-4-2" />

      <circle
        cx="10"
        cy="12"
        r="2"
      />
    </svg>
  );
}

export function ConnectionMethods({
  methods,
}: Props) {
  const {
    meetingType,
    connectionMethod,
    setConnectionMethod,
  } = useAppointmentBooking();

  // Only show connection methods
  // for online video consultations.
  if (meetingType !== "video") {
    return null;
  }

  const allowedMethods =
    methods.filter(
      (method) =>
        method.id === "zoom" ||
        method.id === "google_meet" ||
        method.id === "livekit"
    );

  if (allowedMethods.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {allowedMethods.map((method) => {
        const isSelected =
          connectionMethod === method.id;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => {
              setConnectionMethod(
                method.id as ConnectionMethod
              );
            }}
            className={`min-h-[142px] rounded-xl border px-3 py-4 text-center transition-all duration-200 ${
              isSelected
                ? "border-[#151568] bg-[#151568] text-white shadow-sm"
                : "border-gray-300 bg-white text-[#123c31] hover:border-[#151568]"
            }`}
          >
            <div
              className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                isSelected
                  ? "bg-white text-[#151568]"
                  : "bg-[#f6f6f9] text-[#151568]"
              }`}
            >
              {method.type === "zoom" ? (
                <ZoomIcon />
              ) : (
                <VideoIcon />
              )}
            </div>

            <h3 className="text-base font-semibold md:text-lg">
              {method.title}
            </h3>

            <p
              className={`mt-1 text-[10px] leading-4 md:text-xs ${
                isSelected
                  ? "text-white/75"
                  : "text-gray-500"
              }`}
            >
              {method.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}