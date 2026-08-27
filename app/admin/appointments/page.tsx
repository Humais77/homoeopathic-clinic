"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Appointment = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  concerns?: string | null;

  appointmentDate: string;
  appointmentTime: string;

  meetingType:
    | "VIDEO"
    | "VOICE"
    | "CLINIC";

  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | string;

  doctor: {
    id: string;
    name: string;
  };

  meeting?: {
    id: string;
    roomName: string;
    type: string;
    status: string;
  } | null;
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionId, setActionId] =
    useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/admin/appointments",
          {
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load appointments."
        );
      }

      setAppointments(
        data.appointments || []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load appointments."
      );
    } finally {
      setLoading(false);
    }
  }

  async function confirmAppointment(
    appointmentId: string
  ) {
    try {
      setActionId(appointmentId);

      const response =
        await fetch(
          `/api/admin/appointments/${appointmentId}/confirm`,
          {
            method: "POST",
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to confirm appointment."
        );
      }

      await fetchAppointments();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to confirm appointment."
      );
    } finally {
      setActionId(null);
    }
  }

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }

  function meetingLabel(
    type: Appointment["meetingType"]
  ) {
    switch (type) {
      case "VIDEO":
        return "Video Call";

      case "VOICE":
        return "Voice Call";

      case "CLINIC":
        return "Clinic Visit";

      default:
        return type;
    }
  }

  function statusClass(
    status: string
  ) {
    if (status === "CONFIRMED") {
      return "bg-green-100 text-green-700";
    }

    if (status === "CANCELLED") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

          <p className="mt-4 text-gray-600">
            Loading appointments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#050d32]">
                Appointments
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Manage patient appointments and online meetings.
              </p>
            </div>

            <Link
              href="/admin/dashboard"
              className="rounded-lg bg-[#050d32] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl bg-white shadow-sm border overflow-hidden">
          {appointments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No appointments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Patient
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Doctor
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Date & Time
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Type
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {appointments.map(
                    (appointment) => (
                      <tr
                        key={
                          appointment.id
                        }
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-5">
                          <div className="font-semibold text-gray-900">
                            {
                              appointment.name
                            }
                          </div>

                          <div className="text-gray-500">
                            {
                              appointment.email
                            }
                          </div>

                          {appointment.phone && (
                            <div className="text-gray-500">
                              {
                                appointment.phone
                              }
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <span className="font-medium">
                            {
                              appointment
                                .doctor
                                ?.name
                            }
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="font-medium">
                            {formatDate(
                              appointment.appointmentDate
                            )}
                          </div>

                          <div className="text-gray-500">
                            {
                              appointment.appointmentTime
                            }
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="font-medium">
                            {meetingLabel(
                              appointment.meetingType
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                              appointment.status
                            )}`}
                          >
                            {
                              appointment.status
                            }
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            {appointment.status ===
                              "PENDING" && (
                              <button
                                onClick={() =>
                                  confirmAppointment(
                                    appointment.id
                                  )
                                }
                                disabled={
                                  actionId ===
                                  appointment.id
                                }
                                className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                {actionId ===
                                appointment.id
                                  ? "Confirming..."
                                  : "Confirm"}
                              </button>
                            )}

                            {appointment.status ===
                              "CONFIRMED" &&
                              appointment.meetingType !==
                                "CLINIC" && (
                                <Link
                                  href={`/meeting/${appointment.id}`}
                                  target="_blank"
                                  className="rounded-lg bg-[#050d32] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                                >
                                  Join Meeting
                                </Link>
                              )}

                            {appointment.status ===
                              "CONFIRMED" &&
                              appointment.meetingType ===
                                "CLINIC" && (
                                <span className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500">
                                  Clinic Visit
                                </span>
                              )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}