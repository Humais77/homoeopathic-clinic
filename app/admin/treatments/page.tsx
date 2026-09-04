"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Treatment = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  author?: {
    name: string;
    email: string;
    role: string;
  } | null;
};

export default function AdminTreatmentsPage() {
  const [treatments, setTreatments] =
    useState<Treatment[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function loadTreatments() {
    try {
      const response = await fetch(
        "/api/admin/treatments"
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
      alert(
        "Failed to load treatments"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTreatments();
  }, []);

  async function updateStatus(
    id: string,
    status: string
  ) {
    try {
      const response = await fetch(
        `/api/admin/treatments/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status,
            isActive:
              status === "PUBLISHED",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update status"
        );
      }

      loadTreatments();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update"
      );
    }
  }

  async function deleteTreatment(
    id: string
  ) {
    if (
      !confirm(
        "Are you sure you want to delete this treatment?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/treatments/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete"
        );
      }

      loadTreatments();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Delete failed"
      );
    }
  }

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
            Treatments
          </h1>

          <p className="mt-1 text-gray-600">
            Manage treatments displayed on
            the website.
          </p>
        </div>

        <Link
          href="/admin/treatments/create"
          className="rounded-xl bg-[#151568] px-5 py-3 font-semibold text-white"
        >
          + Create Treatment
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left">
                  Treatment
                </th>

                <th className="px-5 py-4 text-left">
                  Author
                </th>

                <th className="px-5 py-4 text-left">
                  Status
                </th>

                <th className="px-5 py-4 text-left">
                  Active
                </th>

                <th className="px-5 py-4 text-left">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {treatments.map(
                (treatment) => (
                  <tr
                    key={treatment.id}
                    className="border-t"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#151568]">
                        {treatment.name}
                      </div>

                      {treatment.category && (
                        <div className="text-sm text-gray-500">
                          {treatment.category}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {treatment.author
                        ?.name || "Admin"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                        {treatment.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {treatment.isActive
                        ? "Yes"
                        : "No"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {treatment.status ===
                          "PUBLISHED" ? (
                          <button
                            onClick={() =>
                              updateStatus(
                                treatment.id,
                                "DRAFT"
                              )
                            }
                            className="rounded-lg border px-3 py-2 text-sm"
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              updateStatus(
                                treatment.id,
                                "PUBLISHED"
                              )
                            }
                            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white"
                          >
                            Publish
                          </button>
                        )}

                        <Link
                          href={`/admin/treatments/${treatment.id}`}
                          className="rounded-lg border px-3 py-2 text-sm"
                        >
                          Edit
                        </Link>

                        {treatment.status ===
                          "PENDING_REVIEW" && (
                          <Link
                            href={`/admin/treatments/${treatment.id}/review`}
                            className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-white"
                          >
                            Review
                          </Link>
                        )}

                        <button
                          onClick={() =>
                            deleteTreatment(
                              treatment.id
                            )
                          }
                          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {treatments.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No treatments found.
          </div>
        )}
      </div>
    </div>
  );
}