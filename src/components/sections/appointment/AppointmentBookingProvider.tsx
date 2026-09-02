"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

export type MeetingType = "clinic" | "video";

export type ConnectionMethod =
  | "zoom"
  | "google_meet"
  | "livekit";

type AppointmentBookingContextType = {
  meetingType: MeetingType;
  setMeetingType: (type: MeetingType) => void;

  connectionMethod: ConnectionMethod | null;
  setConnectionMethod: (
    method: ConnectionMethod | null
  ) => void;
};

const AppointmentBookingContext =
  createContext<AppointmentBookingContextType | null>(null);

export function AppointmentBookingProvider({
  children,
  initialMeetingType = "video",
}: {
  children: React.ReactNode;
  initialMeetingType?: MeetingType;
}) {
  const [meetingType, setMeetingType] =
    useState<MeetingType>(initialMeetingType);

  const [connectionMethod, setConnectionMethod] =
    useState<ConnectionMethod | null>(
      initialMeetingType === "video"
        ? "google_meet"
        : null
    );

  return (
    <AppointmentBookingContext.Provider
      value={{
        meetingType,
        setMeetingType,
        connectionMethod,
        setConnectionMethod,
      }}
    >
      {children}
    </AppointmentBookingContext.Provider>
  );
}

export function useAppointmentBooking() {
  const context = useContext(
    AppointmentBookingContext
  );

  if (!context) {
    throw new Error(
      "useAppointmentBooking must be used inside AppointmentBookingProvider"
    );
  }

  return context;
}