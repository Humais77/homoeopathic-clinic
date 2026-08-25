"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

export default function UserDashboardPage() {
  const router = useRouter();

  const {
    user,
    isLoading,
    isAdmin,
  } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    /*
     * Not logged in
     */
    if (!user) {
      router.replace(
        "/login?redirect=/user/dashboard"
      );
      return;
    }

    /*
     * Admin is NOT allowed to use user dashboard
     */
    if (isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [user, isLoading, isAdmin, router]);

  if (
    isLoading ||
    !user ||
    isAdmin
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-gray-600">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Welcome back, {user.name}
          </p>
        </div>
      </section>

      {/* Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* User Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.name}
              </h2>

              <p className="text-gray-500">
                {user.email}
              </p>

              {user.phone && (
                <p className="text-gray-500 text-sm mt-1">
                  {user.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Appointments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold">
              My Appointments
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              View and manage your appointments.
            </p>
          </div>

          {/* Consultations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h8M8 14h5m-8 7l3.5-3.5H18a3 3 0 003-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3h1.5L5 21z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold">
              My Consultations
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              View your consultation requests.
            </p>
          </div>

          {/* Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.121 17.804z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold">
              My Profile
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Manage your account information.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}