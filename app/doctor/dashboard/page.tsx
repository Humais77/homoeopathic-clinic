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

type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  image: string | null;
  status:
    | "DRAFT"
    | "PENDING_REVIEW"
    | "PUBLISHED"
    | "REJECTED"
    | "ARCHIVED";
  authorId: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type DashboardData = {
  doctor: Doctor;
  appointments: Appointment[];
  notifications?: unknown[];
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

  const [blogs, setBlogs] =
    useState<Blog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [blogsLoading, setBlogsLoading] =
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

  async function loadBlogs() {
    try {
      setBlogsLoading(true);

      const response = await fetch(
        "/api/doctor/blogs",
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to load blogs"
        );
      }

      setBlogs(result.blogs || []);
    } catch (error) {
      console.error(
        "Failed to load doctor blogs:",
        error
      );
    } finally {
      setBlogsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    loadBlogs();
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

  async function deleteBlog(blogId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this blog?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/doctor/blogs/${blogId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to delete blog"
        );
      }

      setBlogs((previousBlogs) =>
        previousBlogs.filter(
          (blog) => blog.id !== blogId
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete blog"
      );
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

        {/* My Blogs */}
        <div className="mt-8 rounded-2xl bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-gray-100 p-6 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                My Blogs
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Create and manage your health-related articles.
              </p>
            </div>

            <a
              href="/doctor/blogs/create"
              className="inline-flex w-fit items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
            >
              + Create Blog
            </a>

          </div>

          <div className="p-6">

            {blogsLoading ? (
              <p className="text-sm text-gray-500">
                Loading blogs...
              </p>
            ) : blogs.length === 0 ? (

              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">

                <h3 className="font-semibold text-gray-900">
                  No blogs yet
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Create your first health article.
                </p>

                <a
                  href="/doctor/blogs/create"
                  className="mt-4 inline-flex rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Create Your First Blog
                </a>

              </div>

            ) : (

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {blogs.map((blog) => (

                  <div
                    key={blog.id}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white"
                  >

                    {/* Image */}
                    {blog.image ? (
                      <div className="h-40 overflow-hidden bg-gray-100">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-40 items-center justify-center bg-gray-100">
                        <span className="text-sm text-gray-400">
                          No image
                        </span>
                      </div>
                    )}

                    <div className="p-5">

                      {/* Status */}
                      <div className="mb-3">
                        <BlogStatusBadge
                          status={blog.status}
                        />
                      </div>

                      <h3 className="line-clamp-2 font-semibold text-gray-900">
                        {blog.title}
                      </h3>

                      {blog.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                          {blog.excerpt}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-gray-400">
                        {new Date(
                          blog.createdAt
                        ).toLocaleDateString()}
                      </p>

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">

                        {blog.status ===
                          "PUBLISHED" && (
                          <a
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </a>
                        )}

                        {blog.status !==
                          "PUBLISHED" && (
                          <a
                            href={`/doctor/blogs/${blog.id}/edit`}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                          >
                            Edit
                          </a>
                        )}

                        {blog.status !==
                          "PUBLISHED" && (
                          <button
                            onClick={() =>
                              deleteBlog(
                                blog.id
                              )
                            }
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        )}

                      </div>

                    </div>
                  </div>

                ))}

              </div>

            )}

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

                {data.appointments.length === 0 ? (

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

function BlogStatusBadge({
  status,
}: {
  status: Blog["status"];
}) {
  const classes: Record<
    Blog["status"],
    string
  > = {
    DRAFT:
      "bg-gray-100 text-gray-700",

    PENDING_REVIEW:
      "bg-yellow-100 text-yellow-700",

    PUBLISHED:
      "bg-green-100 text-green-700",

    REJECTED:
      "bg-red-100 text-red-700",

    ARCHIVED:
      "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${classes[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}