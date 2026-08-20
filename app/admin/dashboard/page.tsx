'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appointments: 0,
    consultations: 0,
    doctors: 0,
    services: 0,
    blogs: 0,
  });

  useEffect(() => {
    fetchAdmin();
    fetchStats();
  }, []);

  const fetchAdmin = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await response.json();
      setAdmin(data.admin);
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {admin?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500">Appointments</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.appointments}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500">Consultations</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.consultations}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500">Doctors</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.doctors}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500">Services</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.services}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500">Blogs</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.blogs}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/appointments"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow text-center"
          >
            <div className="text-lg font-semibold text-gray-900">Appointments</div>
            <div className="text-sm text-gray-500 mt-1">Manage bookings</div>
          </Link>
          <Link
            href="/admin/consultations"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow text-center"
          >
            <div className="text-lg font-semibold text-gray-900">Consultations</div>
            <div className="text-sm text-gray-500 mt-1">View requests</div>
          </Link>
          <Link
            href="/admin/doctors"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow text-center"
          >
            <div className="text-lg font-semibold text-gray-900">Doctors</div>
            <div className="text-sm text-gray-500 mt-1">Manage doctors</div>
          </Link>
          <Link
            href="/admin/services"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow text-center"
          >
            <div className="text-lg font-semibold text-gray-900">Services</div>
            <div className="text-sm text-gray-500 mt-1">Manage services</div>
          </Link>
        </div>
      </main>
    </div>
  );
}