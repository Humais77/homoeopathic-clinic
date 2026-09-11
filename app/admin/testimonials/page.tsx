"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

type Testimonial = {
  id: string;
  rating: number;
  feedback: string;
  status:
    | "PENDING"
    | "PUBLISHED"
    | "REJECTED";
  adminNote: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  appointment: {
    id: string;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    doctor: {
      name: string;
    };
  };
};

export default function AdminTestimonialsPage() {
  const router = useRouter();

  const {
    user,
    isLoading: authLoading,
    isAdmin,
  } = useAuth();

  const [testimonials, setTestimonials] =
    useState<Testimonial[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  async function loadTestimonials() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/testimonials",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load testimonials."
        );
      }

      setTestimonials(
        data.testimonials || []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load testimonials."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace(
        "/login?redirect=/admin/testimonials"
      );
      return;
    }

    if (!isAdmin) {
      router.replace("/user/dashboard");
      return;
    }

    loadTestimonials();
  }, [
    authLoading,
    user,
    isAdmin,
    router,
  ]);

  async function updateStatus(
    id: string,
    status:
      | "PUBLISHED"
      | "REJECTED"
      | "PENDING"
  ) {
    try {
      setUpdatingId(id);

      const response = await fetch(
        "/api/admin/testimonials",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update testimonial."
        );
      }

      setTestimonials((current) =>
        current.map((testimonial) =>
          testimonial.id === id
            ? data.testimonial
            : testimonial
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update testimonial."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (
    authLoading ||
    !user ||
    !isAdmin
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />

          <p className="mt-4 text-gray-600">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  const pendingCount =
    testimonials.filter(
      (item) => item.status === "PENDING"
    ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Testimonials
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review and manage verified patient feedback.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900">
              {testimonials.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending Review
            </p>

            <p className="mt-1 text-3xl font-bold text-yellow-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Published
            </p>

            <p className="mt-1 text-3xl font-bold text-green-600">
              {
                testimonials.filter(
                  (item) =>
                    item.status === "PUBLISHED"
                ).length
              }
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

            <p className="mt-3 text-sm text-gray-500">
              Loading testimonials...
            </p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              No testimonials yet
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Verified patient feedback will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {testimonials.map(
              (testimonial) => (
                <article
                  key={testimonial.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {testimonial.user.name}
                      </h2>

                      <p className="text-sm text-gray-500">
                        {testimonial.user.email}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Doctor:{" "}
                        {testimonial.appointment.doctor.name}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        testimonial.status ===
                        "PUBLISHED"
                          ? "bg-green-50 text-green-700"
                          : testimonial.status ===
                              "REJECTED"
                            ? "bg-red-50 text-red-700"
                            : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {testimonial.status}
                    </span>
                  </div>

                  <div className="mt-4 flex">
                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <span
                          key={star}
                          className={
                            star <=
                            testimonial.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      )
                    )}
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-gray-700">
                    {testimonial.feedback}
                  </p>

                  <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                    Appointment:{" "}
                    {new Date(
                      testimonial.appointment.appointmentDate
                    ).toLocaleDateString()}{" "}
                    at{" "}
                    {testimonial.appointment.appointmentTime}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {testimonial.status !==
                      "PUBLISHED" && (
                      <button
                        type="button"
                        disabled={
                          updatingId ===
                          testimonial.id
                        }
                        onClick={() =>
                          updateStatus(
                            testimonial.id,
                            "PUBLISHED"
                          )
                        }
                        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve & Publish
                      </button>
                    )}

                    {testimonial.status !==
                      "REJECTED" && (
                      <button
                        type="button"
                        disabled={
                          updatingId ===
                          testimonial.id
                        }
                        onClick={() =>
                          updateStatus(
                            testimonial.id,
                            "REJECTED"
                          )
                        }
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}

                    {testimonial.status !==
                      "PENDING" && (
                      <button
                        type="button"
                        disabled={
                          updatingId ===
                          testimonial.id
                        }
                        onClick={() =>
                          updateStatus(
                            testimonial.id,
                            "PENDING"
                          )
                        }
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Move to Pending
                      </button>
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}