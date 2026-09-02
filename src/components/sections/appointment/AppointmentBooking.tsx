import {
  APPOINTMENT_BOOKING,
  ONLINE_CONSULTATION,
} from "@/src/lib/constants";

import { AppointmentBookingClient } from "./AppointmentBookingClient";

import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

export async function AppointmentBooking() {
  const user = await getCurrentUser();

  const doctors = await prisma.doctor.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <section className="bg-white pb-10 md:pb-14">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="rounded-[22px] border border-gray-300 bg-white px-4 py-7 shadow-sm md:px-6 md:py-8">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-[#10105c] md:text-4xl">
              {APPOINTMENT_BOOKING.title}
            </h2>
          </div>

          {!user ? (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <svg
                  className="h-6 w-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3.75m0 3.75h.007M10.29 3.86l-7.1 12.28A2 2 0 004.92 19h14.16a2 2 0 001.73-2.86L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-bold text-gray-800">
                Login Required
              </h3>

              <p className="mx-auto mt-1 max-w-xl text-sm text-gray-600">
                You need to be logged in to book
                an appointment. Please log in or
                create an account to continue.
              </p>

              <a
                href="/login?redirect=/appointment"
                className="mt-4 inline-flex rounded-xl bg-[#3da449] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#328d3e]"
              >
                Login to Book Appointment
              </a>
            </div>
          ) : (
            <div className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
              You are logged in as{" "}
              <strong>{user.name}</strong>. You
              can book your appointment below.
            </div>
          )}

          <AppointmentBookingClient
            meetingTypes={
              APPOINTMENT_BOOKING.meetingTypes
            }
            doctors={doctors}
            slots={APPOINTMENT_BOOKING.slots}
            form={APPOINTMENT_BOOKING.form}
            connectionMethods={
              ONLINE_CONSULTATION.methods
            }
            isAuthenticated={!!user}
          />
        </div>
      </div>
    </section>
  );
}