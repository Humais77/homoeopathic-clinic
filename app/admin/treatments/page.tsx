"use client";

import { useEffect, useState } from "react";

type Treatment = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function AdminTreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadTreatments() {
    try {
      const response = await fetch("/api/admin/treatments");

      if (!response.ok) {
        throw new Error("Failed to load treatments");
      }

      const data = await response.json();
      setTreatments(data.treatments ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTreatments();
  }, []);

  async function createTreatment(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Treatment name is required");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/treatments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create treatment");
      }

      setName("");
      setDescription("");

      await loadTreatments();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create treatment"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleTreatment(treatment: Treatment) {
    try {
      const response = await fetch(
        `/api/admin/treatments/${treatment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !treatment.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update treatment");
      }

      await loadTreatments();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update treatment"
      );
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <p>Loading treatments...</p>
      </main>
    );
  }

  return (
    <main className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Treatments</h1>
        <p className="mt-2 text-gray-600">
          Manage the treatments available on the website and consultation
          forms.
        </p>
      </div>

      {/* Create Treatment */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-semibold">
          Add New Treatment
        </h2>

        <form onSubmit={createTreatment} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Treatment Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Migraine Treatment"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Treatment description..."
              rows={4}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg px-5 py-3 font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Treatment"}
          </button>
        </form>
      </section>

      {/* Treatment List */}
      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">
            All Treatments
          </h2>
        </div>

        {treatments.length === 0 ? (
          <div className="p-6 text-gray-500">
            No treatments found.
          </div>
        ) : (
          <div className="divide-y">
            {treatments.map((treatment) => (
              <div
                key={treatment.id}
                className="flex items-center justify-between gap-6 p-6"
              >
                <div>
                  <h3 className="font-semibold">
                    {treatment.name}
                  </h3>

                  {treatment.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {treatment.description}
                    </p>
                  )}

                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      treatment.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {treatment.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleTreatment(treatment)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium"
                >
                  {treatment.isActive
                    ? "Deactivate"
                    : "Activate"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}