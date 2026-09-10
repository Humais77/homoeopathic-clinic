"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

type Message = {
  id: string;
  message: string;
  senderType: "USER" | "DOCTOR";
  createdAt: string;
  doctor?: {
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
  status: string;
  createdAt: string;
  treatment: {
    id: string;
    name: string;
    description: string | null;
  };
  doctor: {
    id: string;
    name: string;
    qualification: string;
    specialization: string | null;
    image: string | null;
  } | null;
  messages: Message[];
};

export default function UserConsultationPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [consultation, setConsultation] =
    useState<Consultation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadConsultation() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/user/consultations/${id}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
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
      router.replace(
        `/login?redirect=/user/consultations/${id}`
      );
      return;
    }

    loadConsultation();
  }, [user, isLoading, id]);

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading consultation...
        </p>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-red-600">
            {error || "Consultation not found"}
          </p>

          <Link
            href="/user/dashboard"
            className="mt-4 inline-block font-semibold text-green-600"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/user/dashboard"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#10105c]">
                My Consultation
              </h1>

              <p className="mt-2 text-gray-500">
                {consultation.treatment.name}
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

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Doctor */}
        {consultation.doctor && (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Assigned Doctor
            </h2>

            <div className="mt-4">
              <p className="text-xl font-semibold text-gray-900">
                {consultation.doctor.name}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {consultation.doctor.qualification}
              </p>

              {consultation.doctor
                .specialization && (
                <p className="mt-1 text-sm text-gray-500">
                  {consultation.doctor.specialization}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Original request */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Your Request
          </h2>

          <div className="mt-4 rounded-xl bg-gray-50 p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
              {consultation.message}
            </p>
          </div>
        </section>

        {/* Conversation */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Consultation Response
          </h2>

          {consultation.messages.length ===
            0 ? (
            <div className="mt-5 rounded-xl bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-500">
                Your doctor has not responded yet.
              </p>

              <p className="mt-1 text-xs text-gray-400">
                You&apos;ll be notified when there is
                an update.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {consultation.messages.map(
                (item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl p-5 ${
                      item.senderType === "DOCTOR"
                        ? "bg-green-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-gray-900">
                        {item.senderType === "DOCTOR"
                          ? item.doctor?.name ||
                            "Doctor"
                          : "You"}
                      </p>

                      <span className="text-xs text-gray-400">
                        {new Date(
                          item.createdAt
                        ).toLocaleString()}
                      </span>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">
                      {item.message}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}