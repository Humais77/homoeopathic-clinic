"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Pharmacy = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  imagePublicId: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  mapsUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  name: string;
  description: string;
  image: string;
  imagePublicId: string;
  address: string;
  phone: string;
  website: string;
  mapsUrl: string;
  isActive: boolean;
};

const emptyForm: FormData = {
  name: "",
  description: "",
  image: "",
  imagePublicId: "",
  address: "",
  phone: "",
  website: "",
  mapsUrl: "",
  isActive: true,
};

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [form, setForm] = useState<FormData>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadPharmacies();
  }, []);

  async function loadPharmacies() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/pharmacies"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load pharmacies"
        );
      }

      setPharmacies(data.pharmacies || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load pharmacies"
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(pharmacy: Pharmacy) {
    setEditingId(pharmacy.id);

    setForm({
      name: pharmacy.name,
      description: pharmacy.description || "",
      image: pharmacy.image || "",
      imagePublicId:
        pharmacy.imagePublicId || "",
      address: pharmacy.address || "",
      phone: pharmacy.phone || "",
      website: pharmacy.website || "",
      mapsUrl: pharmacy.mapsUrl || "",
      isActive: pharmacy.isActive,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving || uploading) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function updateField(
    field: keyof FormData,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function uploadImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("file", file);

      formData.append(
        "folder",
        "heal-by-nature/pharmacies"
      );

      const response = await fetch(
        "/api/admin/media/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to upload image"
        );
      }

      setForm((current) => ({
        ...current,
        image: data.image,
        imagePublicId:
          data.imagePublicId,
      }));

      setSuccess("Image uploaded successfully.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload image"
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  }

  async function savePharmacy(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Pharmacy name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url = editingId
        ? `/api/admin/pharmacies/${editingId}`
        : "/api/admin/pharmacies";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save pharmacy"
        );
      }

      setSuccess(
        editingId
          ? "Pharmacy updated successfully."
          : "Pharmacy created successfully."
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadPharmacies();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save pharmacy"
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(
    pharmacy: Pharmacy
  ) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/pharmacies/${pharmacy.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...pharmacy,
            isActive: !pharmacy.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update status"
        );
      }

      setSuccess(
        pharmacy.isActive
          ? "Pharmacy deactivated."
          : "Pharmacy activated."
      );

      await loadPharmacies();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update status"
      );
    }
  }

  async function deletePharmacy(
    pharmacy: Pharmacy
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${pharmacy.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/pharmacies/${pharmacy.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete pharmacy"
        );
      }

      setSuccess(
        "Pharmacy deleted successfully."
      );

      await loadPharmacies();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete pharmacy"
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              Pharmacies
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage trusted pharmacy locations.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
          >
            + Add Pharmacy
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {showForm && (
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId
                    ? "Edit Pharmacy"
                    : "Add Pharmacy"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter pharmacy information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={savePharmacy}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Pharmacy Name *
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      updateField(
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="e.g. ABC Homeopathic Pharmacy"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Phone
                  </label>

                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value
                      )
                    }
                    placeholder="+92 300 1234567"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Short description about this pharmacy..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Address
                </label>

                <textarea
                  value={form.address}
                  onChange={(e) =>
                    updateField(
                      "address",
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Complete pharmacy address..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Website
                  </label>

                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) =>
                      updateField(
                        "website",
                        e.target.value
                      )
                    }
                    placeholder="https://example.com"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Google Maps URL
                  </label>

                  <input
                    type="url"
                    value={form.mapsUrl}
                    onChange={(e) =>
                      updateField(
                        "mapsUrl",
                        e.target.value
                      )
                    }
                    placeholder="https://maps.google.com/..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Pharmacy Image
                </label>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={uploadImage}
                  disabled={uploading}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                />

                <p className="mt-1 text-xs text-gray-500">
                  JPG, PNG or WebP. Maximum 5MB.
                </p>

                {uploading && (
                  <p className="mt-2 text-sm text-green-600">
                    Uploading image...
                  </p>
                )}

                {form.image && (
                  <div className="relative mt-4 h-48 w-full max-w-md overflow-hidden rounded-xl border">
                    <Image
                      src={form.image}
                      alt="Pharmacy preview"
                      fill
                      className="object-cover"
                      sizes="448px"
                    />
                  </div>
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    updateField(
                      "isActive",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />

                <span className="text-sm font-medium text-gray-700">
                  Display this pharmacy on the website
                </span>
              </label>

              <div className="flex flex-wrap gap-3 border-t pt-5">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Pharmacy"
                    : "Create Pharmacy"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold text-gray-900">
              All Pharmacies
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {pharmacies.length} pharmacy
              {pharmacies.length !== 1
                ? "ies"
                : ""}
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
            </div>
          ) : pharmacies.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl">🏪</div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No pharmacies yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add your first trusted pharmacy.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                Add Pharmacy
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {pharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 gap-4">
                    <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {pharmacy.image ? (
                        <Image
                          src={pharmacy.image}
                          alt={pharmacy.name}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl">
                          🏪
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-gray-900">
                          {pharmacy.name}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            pharmacy.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {pharmacy.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      {pharmacy.description && (
                        <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-gray-500">
                          {pharmacy.description}
                        </p>
                      )}

                      {pharmacy.address && (
                        <p className="mt-2 text-sm text-gray-600">
                          📍 {pharmacy.address}
                        </p>
                      )}

                      {pharmacy.phone && (
                        <p className="mt-1 text-sm text-gray-600">
                          ☎ {pharmacy.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        toggleStatus(pharmacy)
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {pharmacy.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(pharmacy)
                      }
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deletePharmacy(pharmacy)
                      }
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}