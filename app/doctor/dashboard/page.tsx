"use client";

import { useEffect, useState } from "react";

type Appointment = {
  id: string;
  name: string;
  email: string;
  concerns: string;
  meetingType: "CLINIC" | "VIDEO" | "VOICE";
  appointmentDate: string;
  appointmentTime: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "COMPLETED"
    | "NO_SHOW";
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
};

type Doctor = {
  id: string;
  name: string;
  qualification: string;
  specialization: string | null;
  experience: string | null;
  description: string | null;
  image: string | null;
  isActive: boolean;
};

type DashboardData = {
  doctor: Doctor;
  appointments: Appointment[];
  stats: {
    totalAppointments: number;
    pendingAppointments: number;
    confirmedAppointments: number;
    completedAppointments: number;
  };
};

export default function DoctorDashboardPage() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/doctor/dashboard",
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to load dashboard"
        );
      }

      setData(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function updateAppointmentStatus(
    appointmentId: string,
    status: Appointment["status"]
  ) {
    try {
      setUpdatingId(appointmentId);

      const response = await fetch(
        `/api/doctor/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to update appointment"
        );
      }

      await loadDashboard();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update appointment"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">
          Loading doctor dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <p className="font-medium text-red-700">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Doctor Dashboard
          </h1>

          <p className="mt-1 text-gray-500">
            Welcome, {data.doctor.name}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Appointments"
            value={
              data.stats.totalAppointments
            }
          />

          <StatCard
            title="Pending"
            value={
              data.stats.pendingAppointments
            }
          />

          <StatCard
            title="Confirmed"
            value={
              data.stats.confirmedAppointments
            }
          />

          <StatCard
            title="Completed"
            value={
              data.stats.completedAppointments
            }
          />
        </div>

        {/* Doctor Profile */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                My Professional Profile
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage your professional information.
              </p>
            </div>

            <a
              href="/doctor/profile"
              className="inline-flex w-fit rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              Edit Profile
            </a>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ProfileItem
              label="Name"
              value={data.doctor.name}
            />

            <ProfileItem
              label="Qualification"
              value={data.doctor.qualification}
            />

            <ProfileItem
              label="Specialization"
              value={
                data.doctor.specialization ||
                "Not added"
              }
            />

            <ProfileItem
              label="Experience"
              value={
                data.doctor.experience ||
                "Not added"
              }
            />
          </div>
        </div>

        {/* Appointments */}
        <div className="mt-8 rounded-2xl bg-white shadow-sm">

          <div className="border-b border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              My Appointments
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Appointments booked with you.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                  <th className="px-6 py-4">
                    Patient
                  </th>

                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4">
                    Time
                  </th>

                  <th className="px-6 py-4">
                    Meeting
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.appointments.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  data.appointments.map(
                    (appointment) => (
                      <tr
                        key={appointment.id}
                        className="border-b border-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {
                                appointment.user
                                  ?.name ||
                                appointment.name
                              }
                            </p>

                            <p className="text-xs text-gray-500">
                              {
                                appointment.user
                                  ?.email ||
                                appointment.email
                              }
                            </p>

                            {appointment.user
                              ?.phone && (
                              <p className="text-xs text-gray-500">
                                {
                                  appointment
                                    .user.phone
                                }
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(
                            appointment.appointmentDate
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {
                            appointment.appointmentTime
                          }
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {
                            appointment.meetingType
                          }
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            status={
                              appointment.status
                            }
                          />
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={
                              appointment.status
                            }
                            disabled={
                              updatingId ===
                              appointment.id
                            }
                            onChange={(e) =>
                              updateAppointmentStatus(
                                appointment.id,
                                e.target
                                  .value as Appointment["status"]
                              )
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                          >
                            <option value="PENDING">
                              Pending
                            </option>

                            <option value="CONFIRMED">
                              Confirmed
                            </option>

                            <option value="CANCELLED">
                              Cancelled
                            </option>

                            <option value="COMPLETED">
                              Completed
                            </option>

                            <option value="NO_SHOW">
                              No Show
                            </option>
                          </select>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Appointment["status"];
}) {
  const classes: Record<
    Appointment["status"],
    string
  > = {
    PENDING:
      "bg-yellow-100 text-yellow-700",
    CONFIRMED:
      "bg-blue-100 text-blue-700",
    CANCELLED:
      "bg-red-100 text-red-700",
    COMPLETED:
      "bg-green-100 text-green-700",
    NO_SHOW:
      "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${classes[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}