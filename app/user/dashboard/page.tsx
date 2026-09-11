"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { AppointmentCard } from "@/src/components/dashboard/AppointmentCard";
import { TestimonialForm } from "@/src/components/dashboard/TestimonialForm";
import Link from "next/link";

type Meeting = {
  id: string;
  type: "CLINIC" | "VIDEO" | "VOICE";
  provider: "NONE" | "ZOOM" | "GOOGLE_MEET" | "LIVEKIT";
  status:
    | "CREATED"
    | "WAITING"
    | "LIVE"
    | "ENDED"
    | "CANCELLED";
  roomName: string | null;
  meetingUrl: string | null;
  hostUrl: string | null;
  externalMeetingId: string | null;
};

type Testimonial = {
  id: string;
  rating: number;
  feedback: string;
  status:
    | "PENDING"
    | "PUBLISHED"
    | "REJECTED";
  createdAt: string;
};
type Appointment = {
  id: string;
  name: string;
  email?: string;
  appointmentDate: string;
  appointmentTime: string;
  meetingType: "CLINIC" | "VIDEO" | "VOICE";
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "COMPLETED"
    | "NO_SHOW";

  doctor: {
    id?: string;
    name: string;
    qualification: string;
    specialization?: string | null;
    image?: string | null;
  };

  meeting: Meeting | null;
  testimonial?: Testimonial | null;
};
export default function UserDashboardPage() {
  const router = useRouter();

  const {
    user,
    isLoading,
    isAdmin,
  } = useAuth();

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [appointmentsLoading, setAppointmentsLoading] =
    useState(true);

  const [appointmentsError, setAppointmentsError] =
    useState("");

  /*
   * Redirect / authentication
   */
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace(
        "/login?redirect=/user/dashboard"
      );
      return;
    }

    if (isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [user, isLoading, isAdmin, router]);
 async function loadAppointments() {
  try {
    setAppointmentsLoading(true);
    setAppointmentsError("");

    const response = await fetch(
      "/api/user/appointments",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to load appointments."
      );
    }

    setAppointments(
      data.appointments || []
    );
  } catch (error) {
    console.error(
      "Load appointments error:",
      error
    );

    setAppointmentsError(
      error instanceof Error
        ? error.message
        : "Unable to load appointments."
    );
  } finally {
    setAppointmentsLoading(false);
  }
}
  /*
   * Load user's appointments
   */
  useEffect(() => {
  if (
    isLoading ||
    !user ||
    isAdmin
  ) {
    return;
  }

  loadAppointments();
}, [
  user,
  isLoading,
  isAdmin,
]);

  /*
   * Loading authentication
   */
  if (
    isLoading ||
    !user ||
    isAdmin
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />

          <p className="mt-4 text-gray-600">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Welcome back, {user.name}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* User Card */}

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.name}
              </h2>

              <p className="text-gray-500">
                {user.email}
              </p>

              {user.phone && (
                <p className="mt-1 text-sm text-gray-500">
                  {user.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* =========================================
            MY APPOINTMENTS
        ========================================= */}

        <section className="mb-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#10105c]">
                My Appointments
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View your upcoming and previous appointments.
              </p>
            </div>

            <span className="rounded-full bg-[#151568] px-4 py-2 text-sm font-semibold text-white">
              {appointments.length}
            </span>
          </div>

          {/* Loading */}

          {appointmentsLoading && (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#3da449]" />

              <p className="mt-3 text-sm text-gray-500">
                Loading appointments...
              </p>
            </div>
          )}

          {/* Error */}

          {!appointmentsLoading &&
            appointmentsError && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
                <p className="font-semibold text-red-700">
                  Unable to load appointments
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {appointmentsError}
                </p>
              </div>
            )}

          {/* No appointments */}

          {!appointmentsLoading &&
            !appointmentsError &&
            appointments.length === 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-7 w-7 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No appointments yet
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Your booked appointments will appear here.
                </p>
              </div>
            )}

          {/* Appointment List */}
{!appointmentsLoading &&
  !appointmentsError &&
  appointments.length > 0 && (
    <div className="space-y-4">
      {appointments.map(
        (appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onAppointmentUpdated={
              loadAppointments
            }
          />
        )
      )}
    </div>
  )}
        </section>

        {/* =========================================
            DASHBOARD CARDS
        ========================================= */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {/* Consultations */}

          <Link
  href="/user/consultations"
  className="group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-md"
>
  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 transition group-hover:bg-green-100">
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 10h8M8 14h5m-8 7l3.5-3.5H18a3 3 0 003-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3h1.5L5 21z"
      />
    </svg>
  </div>

  <h3 className="text-lg font-semibold text-gray-900">
    My Consultations
  </h3>

  <p className="mt-1 text-sm text-gray-500">
    View your consultation requests and doctor responses.
  </p>

  <span className="mt-4 inline-block text-sm font-semibold text-[#3da449]">
    View Consultations →
  </span>
</Link>

          {/* Profile */}
            <Link
  href="/user/profile"
  className="group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-md"
>
  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition group-hover:bg-purple-100">
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.121 17.804z"
      />
    </svg>
  </div>

  <h3 className="text-lg font-semibold text-gray-900">
    My Profile
  </h3>

  <p className="mt-1 text-sm text-gray-500">
    Manage your account information.
  </p>

  <span className="mt-4 inline-block text-sm font-semibold text-[#3da449]">
    Manage Profile →
  </span>
</Link>
          </div>
        
      </main>
    </div>
  );
}