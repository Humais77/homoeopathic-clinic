"use client";

import { createContext, useContext, useState } from "react";

export type MeetingType = "clinic" | "video" | "voice";

type ContactBookingContextType = {
  meetingType: MeetingType;
  setMeetingType: (type: MeetingType) => void;
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

  return (
    <ContactBookingContext.Provider
      value={{
        meetingType,
        setMeetingType,
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