"use client";

import { FormEvent, useEffect, useState } from "react";

export default function DoctorProfilePage() {
  const [form, setForm] = useState({
    name: "",
    qualification: "",
    specialization: "",
    experience: "",
    description: "",
    image: "",
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(
          "/api/doctor/profile"
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to load profile"
          );
        }

        setForm({
          name: result.doctor.name || "",
          qualification:
            result.doctor.qualification || "",
          specialization:
            result.doctor.specialization || "",
          experience:
            result.doctor.experience || "",
          description:
            result.doctor.description || "",
          image: result.doctor.image || "",
        });
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(
    e: FormEvent
  ) {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        "/api/doctor/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to update profile"
        );
      }

      setMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Doctor Profile
          </h1>

          <p className="mt-1 text-gray-500">
            Manage your professional information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Doctor Name
            </label>

            <input
              value={form.name}
              onChange={(e) =>
                updateField(
                  "name",
                  e.target.value
                )
              }
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Qualification
            </label>

            <input
              value={form.qualification}
              onChange={(e) =>
                updateField(
                  "qualification",
                  e.target.value
                )
              }
              required
              placeholder="BHMS, MD (Homeopathy)"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Specialization
            </label>

            <input
              value={form.specialization}
              onChange={(e) =>
                updateField(
                  "specialization",
                  e.target.value
                )
              }
              placeholder="Chronic Diseases & General Homeopathy"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Experience
            </label>

            <input
              value={form.experience}
              onChange={(e) =>
                updateField(
                  "experience",
                  e.target.value
                )
              }
              placeholder="10+ Years Experience"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Profile Image URL
            </label>

            <input
              value={form.image}
              onChange={(e) =>
                updateField(
                  "image",
                  e.target.value
                )
              }
              placeholder="/images/doctors/doctor.jpg"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Professional Description
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                updateField(
                  "description",
                  e.target.value
                )
              }
              rows={5}
              placeholder="Describe your professional experience..."
              className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
            />
          </div>

          {message && (
            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}