"use client";

import { createContext, useContext, useState } from "react";

export type MeetingType =
  | "clinic"
  | "video"
  | "voice";

export type ConnectionMethod =
  | "zoom"
  | "google_meet"
  | "livekit"
  | "phone"
  | "message"
  | "whatsapp";

type ContactBookingContextType = {
  meetingType: MeetingType;
  setMeetingType: (type: MeetingType) => void;

  connectionMethod: ConnectionMethod | null;
  setConnectionMethod: (
    method: ConnectionMethod | null
  ) => void;
};

const ContactBookingContext =
  createContext<ContactBookingContextType | null>(null);

export function ContactBookingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [meetingType, setMeetingType] =
    useState<MeetingType>("video");

  const [connectionMethod, setConnectionMethod] =
    useState<ConnectionMethod | null>("google_meet");

  return (
    <ContactBookingContext.Provider
      value={{
        meetingType,
        setMeetingType,
        connectionMethod,
        setConnectionMethod,
      }}
    >
      {children}
    </ContactBookingContext.Provider>
  );
}

export function useContactBooking() {
  const context = useContext(ContactBookingContext);

  if (!context) {
    throw new Error(
      "useContactBooking must be used inside ContactBookingProvider"
    );
  }

  return context;
}