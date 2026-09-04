"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Treatment = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  content: string | null;
  image: string | null;
  status: string;
  author?: {
    name: string;
    email: string;
  } | null;
};

export default function ReviewTreatmentPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [treatment, setTreatment] =
    useState<Treatment | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function loadTreatment() {
    try {
      const response = await fetch(
        `/api/admin/treatments/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load treatment"
        );
      }

      setTreatment(data.treatment);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to load treatment"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadTreatment();
    }
  }, [id]);

  async function updateStatus(
    status: "PUBLISHED" | "REJECTED"
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
            "Failed to update treatment"
        );
      }

      alert(
        status === "PUBLISHED"
          ? "Treatment published successfully."
          : "Treatment rejected."
      );

      router.push("/admin/treatments");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="p-6">
        Treatment not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#151568]">
          Review Treatment
        </h1>

        <p className="mt-2 text-gray-600">
          Submitted by{" "}
          <strong>
            {treatment.author?.name ||
              "Doctor"}
          </strong>
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        {treatment.image && (
          <img
            src={treatment.image}
            alt={treatment.name}
            className="mb-8 h-72 w-full rounded-2xl object-cover"
          />
        )}

        <h2 className="text-3xl font-bold text-[#151568]">
          {treatment.name}
        </h2>

        {treatment.category && (
          <p className="mt-2 font-medium text-green-700">
            {treatment.category}
          </p>
        )}

        {treatment.description && (
          <p className="mt-6 text-lg text-gray-600">
            {treatment.description}
          </p>
        )}

        {treatment.content && (
          <div className="mt-8 whitespace-pre-line leading-8 text-gray-700">
            {treatment.content}
          </div>
        )}

        <div className="mt-10 flex gap-3 border-t pt-6">
          <button
            onClick={() =>
              updateStatus("PUBLISHED")
            }
            className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white"
          >
            Approve & Publish
          </button>

          <button
            onClick={() =>
              updateStatus("REJECTED")
            }
            className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white"
          >
            Reject
          </button>

          <button
            onClick={() =>
              router.push(
                "/admin/treatments"
              )
            }
            className="rounded-xl border px-6 py-3 font-semibold"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}