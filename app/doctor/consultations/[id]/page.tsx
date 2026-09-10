"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

type Message = {
  id: string;
  message: string;
  senderType: "USER" | "DOCTOR";
  createdAt: string;
  doctor?: {
    id: string;
    name: string;
    qualification: string;
  } | null;
};

type Consultation = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status:
    | "PENDING"
    | "ASSIGNED"
    | "IN_REVIEW"
    | "CONTACTED"
    | "APPOINTMENT_CREATED"
    | "COMPLETED"
    | "REJECTED";
  createdAt: string;

  treatment: {
    id: string;
    name: string;
    description?: string | null;
  };

  doctor: {
    id: string;
    name: string;
    qualification: string;
    specialization: string | null;
    experience: string | null;
    image: string | null;
  };

  messages: Message[];
};

export default function DoctorConsultationPage() {
  const params = useParams();
  const router = useRouter();

  const { user, isLoading } = useAuth();

  const id = params.id as string;

  const [consultation, setConsultation] =
    useState<Consultation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [response, setResponse] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [startingReview, setStartingReview] =
    useState(false);

  async function loadConsultation() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `/api/doctor/consultations/${id}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to load consultation"
        );
      }

      setConsultation(data.consultation);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load consultation"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "DOCTOR") {
      router.replace("/user/dashboard");
      return;
    }

    loadConsultation();
  }, [user, isLoading, id]);

  async function startReview() {
    try {
      setStartingReview(true);

      const res = await fetch(
        `/api/doctor/consultations/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: "IN_REVIEW",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to start review"
        );
      }

      await loadConsultation();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start review"
      );
    } finally {
      setStartingReview(false);
    }
  }

  async function sendResponse(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!response.trim()) return;

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch(
        `/api/doctor/consultations/${id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            message: response.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to send response"
        );
      }

      setResponse("");

      await loadConsultation();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send response"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function markCompleted() {
    try {
      setSubmitting(true);

      const res = await fetch(
        `/api/doctor/consultations/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: "COMPLETED",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to complete consultation"
        );
      }

      await loadConsultation();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete consultation"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">
          Loading consultation...
        </div>
      </div>
    );
  }

  if (error && !consultation) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-red-600">{error}</p>

          <Link
            href="/doctor/consultations"
            className="mt-4 inline-block text-sm font-semibold text-green-600"
          >
            ← Back to Consultations
          </Link>
        </div>
      </div>
    );
  }

  if (!consultation) return null;

  const canStartReview =
    consultation.status === "ASSIGNED";

  const canRespond =
    consultation.status === "IN_REVIEW" ||
    consultation.status === "CONTACTED";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/doctor/consultations"
            className="text-sm font-medium text-gray-500 hover:text-gray-800"
          >
            ← Back to Consultations
          </Link>

          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#10105c]">
                Consultation Review
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Review the patient's consultation request
                and provide your response.
              </p>
            </div>

            <span className="w-fit rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
              {consultation.status.replaceAll(
                "_",
                " "
              )}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Patient */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Patient Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Name
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {consultation.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Email
              </p>
              <p className="mt-1 text-gray-700">
                {consultation.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Phone
              </p>
              <p className="mt-1 text-gray-700">
                {consultation.phone || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Treatment
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {consultation.treatment.name}
              </p>
            </div>
          </div>
        </section>

        {/* Patient request */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Patient&apos;s Request
          </h2>

          <div className="mt-4 rounded-xl bg-gray-50 p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
              {consultation.message}
            </p>
          </div>
        </section>

        {/* Start review */}
        {canStartReview && (
          <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="font-bold text-blue-900">
              Ready to review?
            </h2>

            <p className="mt-1 text-sm text-blue-700">
              Start the review to let the patient know
              their request is being reviewed.
            </p>

            <button
              type="button"
              onClick={startReview}
              disabled={startingReview}
              className="mt-5 rounded-full bg-[#10105c] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {startingReview
                ? "Starting Review..."
                : "Start Review"}
            </button>
          </section>
        )}

        {/* Conversation */}
        {consultation.messages.length > 0 && (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Consultation Conversation
            </h2>

            <div className="mt-5 space-y-4">
              {consultation.messages.map(
                (item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl p-4 ${
                      item.senderType === "DOCTOR"
                        ? "ml-6 bg-green-50"
                        : "mr-6 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.senderType === "DOCTOR"
                          ? item.doctor?.name ||
                            "Doctor"
                          : consultation.name}
                      </p>

                      <span className="text-xs text-gray-400">
                        {new Date(
                          item.createdAt
                        ).toLocaleString()}
                      </span>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                      {item.message}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* Doctor response */}
        {canRespond && (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Doctor Response
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Provide a clear response based on the
              information available in the consultation.
            </p>

            <form
              onSubmit={sendResponse}
              className="mt-5"
            >
              <textarea
                value={response}
                onChange={(e) =>
                  setResponse(e.target.value)
                }
                rows={7}
                maxLength={5000}
                placeholder="Write your response to the patient..."
                disabled={submitting}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !response.trim()
                  }
                  className="rounded-full bg-[#43aa48] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#37933c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Sending..."
                    : "Send Response"}
                </button>

                {consultation.status ===
                  "CONTACTED" && (
                  <button
                    type="button"
                    onClick={markCompleted}
                    disabled={submitting}
                    className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}