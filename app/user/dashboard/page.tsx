"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { AppointmentCard } from "@/src/components/dashboard/AppointmentCard";
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#3da449]" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const upcomingAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "PENDING" ||
        appointment.status === "CONFIRMED"
    ).length;

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "COMPLETED"
    ).length;

  return (
    <div className="min-h-screen bg-[#f6f8f7]">

      {/* =====================================================
          TOP HEADER / HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">

        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-green-100/50 blur-3xl" />

        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-[#31853a]">
                <span className="h-2 w-2 rounded-full bg-[#3da449]" />
                Patient Dashboard
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#11136b] sm:text-4xl">
                Welcome back, {user.name}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage your appointments, consultations,
                and personal information from one place.
              </p>
            </div>

            <Link
              href="/user/profile"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-[#31853a]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M4 20h4l10.732-10.732a2.5 2.5 0 00-3.536-3.536L4.464 16.464A2 2 0 004 17.878V20z"
                />
              </svg>
              Edit Profile
            </Link>

          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 md:py-10 lg:px-8">

        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <section className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="h-1.5 bg-gradient-to-r from-[#3da449] via-[#55b85f] to-[#11136b]" />

          <div className="flex flex-col gap-6 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-green-100 text-[#3da449] ring-1 ring-green-100">

                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>

              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="truncate text-lg font-bold text-slate-900">
                    {user.name}
                  </h2>

                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-[#31853a]">
                    Patient
                  </span>

                </div>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {user.email}
                </p>

                {user.phone && (
                  <p className="mt-1 text-xs text-slate-400">
                    {user.phone}
                  </p>
                )}

              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:w-auto">

              <div className="rounded-xl bg-slate-50 px-5 py-3">
                <p className="text-xs font-medium text-slate-400">
                  Total
                </p>
                <p className="mt-1 text-xl font-bold text-[#11136b]">
                  {appointments.length}
                </p>
              </div>

              <div className="rounded-xl bg-green-50 px-5 py-3">
                <p className="text-xs font-medium text-green-600">
                  Upcoming
                </p>
                <p className="mt-1 text-xl font-bold text-[#31853a]">
                  {upcomingAppointments}
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* =================================================
            QUICK STATS
        ================================================= */}

        <section className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Total */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Appointments
                </p>

                <p className="mt-2 text-3xl font-bold text-[#11136b]">
                  {appointments.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#11136b]">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

            </div>
          </div>

          {/* Upcoming */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Upcoming
                </p>

                <p className="mt-2 text-3xl font-bold text-[#3da449]">
                  {upcomingAppointments}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#3da449]">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 6v6l4 2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    strokeWidth={1.8}
                  />
                </svg>
              </div>

            </div>
          </div>

          {/* Completed */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-800">
                  {completedAppointments}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

            </div>
          </div>

        </section>

        {/* =================================================
            APPOINTMENTS
        ================================================= */}

        <section className="mb-10">

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="flex items-center gap-3">

                <h2 className="text-2xl font-bold tracking-tight text-[#11136b]">
                  My Appointments
                </h2>

                <span className="rounded-full bg-[#11136b] px-2.5 py-1 text-xs font-bold text-white">
                  {appointments.length}
                </span>

              </div>

              <p className="mt-1 text-sm text-slate-500">
                Keep track of your upcoming and previous appointments.
              </p>
            </div>

            {appointments.length > 0 && (
              <div className="hidden text-xs font-medium text-slate-400 sm:block">
                Your appointment history
              </div>
            )}

          </div>

          {/* Loading */}

          {appointmentsLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#3da449]" />

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading your appointments...
              </p>

            </div>
          )}

          {/* Error */}

          {!appointmentsLoading &&
            appointmentsError && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-6">

                <div className="flex gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="font-semibold text-red-700">
                      Unable to load appointments
                    </p>

                    <p className="mt-1 text-sm text-red-600">
                      {appointmentsError}
                    </p>
                  </div>

                </div>

              </div>
            )}

          {/* Empty */}

          {!appointmentsLoading &&
            !appointmentsError &&
            appointments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-[#3da449]">

                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>

                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  No appointments yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Your booked appointments will appear here.
                  Once you schedule an appointment, you can
                  manage it from this dashboard.
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

        {/* =================================================
            QUICK ACCESS
        ================================================= */}

        <section>

          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight text-[#11136b]">
              Quick Access
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your healthcare journey from here.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Consultations */}

            <Link
              href="/user/consultations"
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
            >

              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-green-50 transition duration-300 group-hover:scale-150" />

              <div className="relative">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#3da449] transition group-hover:bg-[#3da449] group-hover:text-white">

                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M8 10h8M8 14h5m-8 7l3.5-3.5H18a3 3 0 003-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3h1.5L5 21z"
                    />
                  </svg>

                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  My Consultations
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  View your consultation requests and
                  doctor responses in one place.
                </p>

                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#3da449]">
                  View Consultations

                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>

              </div>

            </Link>

            {/* Profile */}

            <Link
              href="/user/profile"
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg"
            >

              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-purple-50 transition duration-300 group-hover:scale-150" />

              <div className="relative">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white">

                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M15 19a4 4 0 00-6 0m3-8a3 3 0 100-6 3 3 0 000 6zm7 8a4 4 0 00-3-3.87M18 8a3 3 0 00-1-2.24M3 19a4 4 0 013-3.87M6 8a3 3 0 011-2.24"
                    />
                  </svg>

                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  My Profile
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Keep your personal information and
                  account details up to date.
                </p>

                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-purple-600">
                  Manage Profile

                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>

              </div>

            </Link>

          </div>
        </section>

      </main>
    </div>
  );
}