"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Treatment = {
  id: string;
  name: string;
  category: string | null;
  status: string;
  createdAt: string;
};

export default function DoctorTreatmentsPage() {
  const [treatments, setTreatments] =
    useState<Treatment[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function loadTreatments() {
    try {
      const response = await fetch(
        "/api/doctor/treatments"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load treatments"
        );
      }

      setTreatments(data.treatments);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTreatments();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        Loading treatments...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#151568]">
            My Treatments
          </h1>

          <p className="mt-1 text-gray-600">
            Manage treatments you have created.
          </p>
        </div>

        <Link
          href="/doctor/treatments/create"
          className="rounded-xl bg-[#151568] px-5 py-3 font-semibold text-white"
        >
          + Create Treatment
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {treatments.map((treatment) => (
          <div
            key={treatment.id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-bold text-[#151568]">
              {treatment.name}
            </h2>

            {treatment.category && (
              <p className="mt-1 text-sm text-gray-500">
                {treatment.category}
              </p>
            )}

            <div className="mt-4">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                {treatment.status}
              </span>
            </div>

            <Link
              href={`/doctor/treatments/${treatment.id}`}
              className="mt-5 inline-block rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              Edit
            </Link>
          </div>
        ))}
      </div>

      {treatments.length === 0 && (
        <div className="rounded-2xl border bg-gray-50 p-10 text-center text-gray-500">
          You have not created any treatments yet.
        </div>
      )}
    </div>
  );
}