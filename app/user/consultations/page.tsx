"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

type Consultation = {
  id: string;
  name: string;
  status: string;
  createdAt: string;

  treatment: {
    id: string;
    name: string;
  };

  doctor: {
    id: string;
    name: string;
    qualification: string;
  } | null;

  messages: {
    id: string;
    message: string;
    senderType: "USER" | "DOCTOR";
    createdAt: string;
  }[];
};

export default function UserConsultationsPage() {
  const router = useRouter();

  const { user, isLoading } = useAuth();

  const [consultations, setConsultations] =
    useState<Consultation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadConsultations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/user/consultations",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load consultations"
        );
      }

      setConsultations(
        data.consultations || []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load consultations"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace(
        "/login?redirect=/user/consultations"
      );
      return;
    }

    loadConsultations();
  }, [user, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading consultations...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/user/dashboard"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-[#10105c]">
            My Consultations
          </h1>

          <p className="mt-2 text-gray-500">
            View your consultation requests and doctor
            responses.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-xl bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!error &&
          consultations.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                No consultation requests yet
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Submit a consultation request to get
                started.
              </p>
            </div>
          )}

        <div className="space-y-5">
          {consultations.map(
            (consultation) => {
              const latestMessage =
                consultation.messages[
                  consultation.messages.length - 1
                ];

              return (
                <Link
                  key={consultation.id}
                  href={`/user/consultations/${consultation.id}`}
                  className="block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {consultation.treatment.name}
                      </p>

                      <h2 className="mt-2 text-xl font-bold text-gray-900">
                        Consultation Request
                      </h2>

                      {consultation.doctor && (
                        <p className="mt-2 text-sm text-gray-500">
                          Doctor:{" "}
                          <span className="font-medium text-gray-700">
                            {consultation.doctor.name}
                          </span>
                        </p>
                      )}

                      {latestMessage && (
                        <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                          {latestMessage.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start">
                      <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-700">
                        {consultation.status.replaceAll(
                          "_",
                          " "
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            }
          )}
        </div>
      </main>
    </div>
  );
}