"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/src/context/AuthContext";

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsappOptIn: boolean;
  emailVerified: boolean;
  nameChangeCount: number;
  phoneChangeCount: number;
  createdAt: string;
};

type Limits = {
  maxNameChanges: number;
  maxPhoneChanges: number;
  remainingNameChanges: number;
  remainingPhoneChanges: number;
};

export default function UserProfilePage() {
  const router = useRouter();

  const {
    user,
    isLoading: authLoading,
    isAdmin,
    refreshUser,
  } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [limits, setLimits] = useState<Limits | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login?redirect=/user/profile");
      return;
    }

    if (isAdmin) {
      router.replace("/admin/dashboard");
      return;
    }

    loadProfile();
  }, [user, authLoading, isAdmin, router]);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/user/profile", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load profile."
        );
      }

      setProfile(data.profile);
      setLimits(data.limits);

      setName(data.profile.name);
      setPhone(data.profile.phone || "");
      setWhatsappOptIn(data.profile.whatsappOptIn);
    } catch (error) {
      console.error("Load profile error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          phone: phone.trim() || null,
          whatsappOptIn,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update profile."
        );
      }

      setProfile(data.profile);

      if (data.limits) {
        setLimits(data.limits);
      }

      setName(data.profile.name);
      setPhone(data.profile.phone || "");
      setWhatsappOptIn(data.profile.whatsappOptIn);

      setSuccess("Your profile has been updated successfully.");

      await refreshUser();
    } catch (error) {
      console.error("Update profile error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (
    authLoading ||
    loading ||
    !user ||
    isAdmin
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#3da449]" />

          <p className="mt-4 text-gray-600">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/user/dashboard"
            className="mb-4 inline-flex text-sm font-medium text-[#3da449] hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold text-[#10105c]">
            My Profile
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your personal account information.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="font-medium text-green-700">
              {success}
            </p>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-700">
                {profile?.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile?.name}
                </h2>

                <p className="text-sm text-gray-500">
                  {profile?.email}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 p-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#3da449] focus:ring-2 focus:ring-green-100"
                />

                {limits && (
                  <p className="mt-2 text-xs text-gray-500">
                    Name changes remaining:{" "}
                    <span className="font-semibold">
                      {limits.remainingNameChanges}
                    </span>{" "}
                    of {limits.maxNameChanges}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Email address cannot be changed from your
                  profile.
                </p>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  maxLength={30}
                  placeholder="+92 300 1234567"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#3da449] focus:ring-2 focus:ring-green-100"
                />

                {limits && (
                  <p className="mt-2 text-xs text-gray-500">
                    Phone changes remaining:{" "}
                    <span className="font-semibold">
                      {limits.remainingPhoneChanges}
                    </span>{" "}
                    of {limits.maxPhoneChanges}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={whatsappOptIn}
                    onChange={(event) =>
                      setWhatsappOptIn(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />

                  <span>
                    <span className="block font-medium text-gray-900">
                      WhatsApp notifications
                    </span>

                    <span className="mt-1 block text-sm text-gray-500">
                      Allow the clinic to send appointment
                      confirmations, reminders, cancellations,
                      and meeting notifications through
                      WhatsApp.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex justify-end border-t border-gray-100 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#3da449] px-6 py-3 font-semibold text-white transition hover:bg-[#31853a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <h3 className="font-semibold text-blue-900">
            Profile change limits
          </h3>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            To protect your account and appointment records,
            your name and phone number can only be changed a
            limited number of times. If you need to make
            another change after reaching the limit, please
            contact the clinic.
          </p>
        </div>
      </main>
    </div>
  );
}