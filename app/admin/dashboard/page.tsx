"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

export default function AdminDashboardPage() {
  const router = useRouter();

  const {
    user,
    isLoading: authLoading,
    isAdmin,
  } = useAuth();

  const [stats, setStats] = useState({
    appointments: 0,
    consultations: 0,
    doctors: 0,
    services: 0,
    blogs: 0,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login?redirect=/admin/dashboard");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
      return;
    }

    fetchStats();
  }, [user, authLoading, isAdmin]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard");

      if (response.status === 401) {
        router.replace("/login?redirect=/admin/dashboard");
        return;
      }

      if (response.status === 403) {
        router.replace("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard");
      }

      const data = await response.json();

      setStats({
        appointments: data.appointments ?? 0,
        consultations: data.consultations ?? 0,
        doctors: data.doctors ?? 0,
        services: data.services ?? 0,
        blogs: data.blogs ?? 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  if (
    authLoading ||
    !user ||
    !isAdmin
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-gray-600">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="text-sm text-gray-600">
            Welcome, {user.name}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500">
              Appointments
            </div>

            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats.appointments}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500">
              Consultations
            </div>

            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats.consultations}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500">
              Doctors
            </div>

            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats.doctors}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500">
              Services
            </div>

            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats.services}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500">
              Blogs
            </div>

            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats.blogs}
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          <Link
            href="/admin/appointments"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow text-center"
          >
            <div className="text-lg font-semibold text-gray-900">
              Appointments
            </div>

            <div className="text-sm text-gray-500 mt-1">
              Manage bookings
            </div>
          </Link>

          <Link
            href="/admin/consultations"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow text-center"
          >
            <div className="text-lg font-semibold text-gray-900">
              Consultations
            </div>

            <div className="text-sm text-gray-500 mt-1">
              View requests
            </div>
          </Link>

          <Link
            href="/admin/doctors"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow text-center"
          >
            <div className="text-lg font-semibold text-gray-900">
              Doctors
            </div>

            <div className="text-sm text-gray-500 mt-1">
              Manage doctors
            </div>
          </Link>

          <Link
            href="/admin/services"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow text-center"
          >
            <div className="text-lg font-semibold text-gray-900">
              Services
            </div>

            <div className="text-sm text-gray-500 mt-1">
              Manage services
            </div>
          </Link>

        </div>

      </main>
    </div>
  );
}