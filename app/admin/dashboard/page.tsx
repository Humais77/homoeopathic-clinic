
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import RecentAuditLogs from "@/src/components/admin/RecentAuditLogs";

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
    pharmacies: 0,
    testimonials: 0,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login?redirect=/admin/dashboard");
      return;
    }

    if (!isAdmin) {
      router.replace("/user/dashboard");
      return;
    }

    fetchStats();
  }, [user, authLoading, isAdmin, router]);

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
        pharmacies: data.pharmacies ?? 0,
        testimonials: data.testimonials ?? 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-[#45a94a]" />
          <p className="mt-4 text-sm font-medium text-slate-400">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Appointments",
      value: stats.appointments,
      description: "Patient bookings",
      href: "/admin/appointments",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Consultations",
      value: stats.consultations,
      description: "Patient requests",
      href: "/admin/consultations",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 10h8M8 14h5m-8 7l3.5-3.5H18a3 3 0 003-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3h1.5L5 21z"
          />
        </svg>
      ),
    },
    {
      title: "Doctors",
      value: stats.doctors,
      description: "Medical professionals",
      href: "/admin/doctors",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm9-2v6m-3-3h6"
          />
        </svg>
      ),
    },
    {
      title: "Treatments",
      value: stats.services,
      description: "Available treatments",
      href: "/admin/treatments",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 3h6m-7 4h8m-9 4h10m-8 10h4a2 2 0 002-2V5H7v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Blogs",
      value: stats.blogs,
      description: "Published content",
      href: "/admin/blogs",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm4 3h8m-8 4h8m-8 4h5"
          />
        </svg>
      ),
    },
    {
      title: "Pharmacies",
      value: stats.pharmacies,
      description: "Trusted pharmacies",
      href: "/admin/pharmacies",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 3h6v4h4v6h-4v4H9v-4H5V7h4V3z"
          />
        </svg>
      ),
    },
    {
      title: "Testimonials",
      value: stats.testimonials,
      description: "Patient feedback",
      href: "/admin/testimonials",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3z"
          />
        </svg>
      ),
    },
  ];

  const managementLinks = [
    {
      title: "Appointments",
      description: "Manage patient bookings and appointment status.",
      href: "/admin/appointments",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Consultations",
      description: "Review and manage patient consultation requests.",
      href: "/admin/consultations",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 10h8M8 14h5m-8 7l3.5-3.5H18a3 3 0 003-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3h1.5L5 21z"
          />
        </svg>
      ),
    },
    {
      title: "Doctors",
      description: "Manage doctors, qualifications and specializations.",
      href: "/admin/doctors",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm9-2v6m-3-3h6"
          />
        </svg>
      ),
    },
    {
      title: "Treatments",
      description: "Create and manage the clinic's treatments.",
      href: "/admin/treatments",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 3h6m-7 4h8m-9 4h10m-8 10h4a2 2 0 002-2V5H7v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Blogs",
      description: "Create, edit and manage educational content.",
      href: "/admin/blogs",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm4 3h8m-8 4h8m-8 4h5"
          />
        </svg>
      ),
    },
    {
      title: "Schedules",
      description: "Manage doctor working hours and appointment slots.",
      href: "/admin/schedules",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Pharmacies",
      description: "Manage trusted pharmacy information.",
      href: "/admin/pharmacies",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 3h6v4h4v6h-4v4H9v-4H5V7h4V3z"
          />
        </svg>
      ),
    },
    {
      title: "Testimonials",
      description: "Review and manage patient feedback.",
      href: "/admin/testimonials",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      {/* =====================================================
          ADMIN HEADER
      ===================================================== */}
      <header className="border-b border-slate-800 bg-[#0d1235] text-white">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#45a94a] shadow-lg shadow-green-950/20">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Heal By Nature
                </p>
                <p className="text-xs text-slate-400">
                  Administration Panel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">
                  {user.name}
                </p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white ring-1 ring-white/10">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}
      <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 md:py-9 lg:px-8">
        {/* =================================================
            PAGE INTRO
        ================================================= */}
        <section className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e7f5e8] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#31853a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#45a94a]" />
                Admin Overview
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#10105c] sm:text-4xl">
                Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Monitor clinic activity, manage healthcare content, and
                oversee your patient services.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                System Status
              </p>

              <div className="mt-1.5 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#45a94a]" />
                <span className="text-sm font-semibold text-slate-700">
                  Administration Active
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            KPI CARDS
        ================================================= */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              Clinic Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Current platform statistics
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {statCards.map((stat) => (
              <Link
                key={stat.title}
                href={stat.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#45a94a]/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#10105c] transition group-hover:bg-[#e7f5e8] group-hover:text-[#31853a]">
                    {stat.icon}
                  </div>

                  <svg
                    className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#45a94a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {stat.title}
                </p>

                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {stat.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* =================================================
            MANAGEMENT CENTER
        ================================================= */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">
              Management Center
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Access and manage the core areas of your clinic.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {managementLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#45a94a]/30 hover:shadow-md"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-slate-50 transition duration-300 group-hover:scale-150 group-hover:bg-[#e7f5e8]" />

                <div className="relative">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#10105c] transition duration-200 group-hover:bg-[#e7f5e8] group-hover:text-[#31853a]">
                      {item.icon}
                    </div>

                    <span className="text-lg text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-[#45a94a]">
                      →
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 min-h-[40px] text-sm leading-5 text-slate-500">
                    {item.description}
                  </p>

                  <div className="mt-4 text-xs font-semibold text-[#45a94a] opacity-0 transition duration-200 group-hover:opacity-100">
                    Open Management →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =================================================
            SECURITY & SYSTEM ACTIVITY
        ================================================= */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e7f5e8] text-[#31853a]">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M9 12l2 2 4-4"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Security & System Activity
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                Recent administrative actions and system events.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Recent Activity
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Latest administrative actions
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 8v4l3 2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="8.5"
                    strokeWidth={1.8}
                  />
                </svg>
              </div>
            </div>

            <div className="p-1">
              <RecentAuditLogs />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

