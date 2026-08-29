"use client";

import { CONTACT_CONNECTION } from "@/src/lib/constants";
import { ContactConnectionClient } from "./ContactConnectionClient";
import { useContactBooking } from "./ContactBookingProvider";

export function ContactConnection() {
  const { meetingType } = useContactBooking();

  // Hide the entire section for Clinic Visit
  if (meetingType === "clinic") {
    return null;
  }

  return (
    <section className="bg-white py-10 md:py-12">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#10105c] md:text-4xl">
              {CONTACT_CONNECTION.title}
            </h2>

            <p className="mt-2 text-xs text-gray-400 md:text-sm">
              {CONTACT_CONNECTION.subtitle}
            </p>
          </div>

          <ContactConnectionClient
            methods={CONTACT_CONNECTION.methods}
          />
        </div>
      </div>
    </section>
  );
}