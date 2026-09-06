"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AuditLog = {
  id: string;
  action: string;
  entity: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
};

const ACTION_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: "Login successful",
  LOGIN_FAILED: "Login failed",
  PASSWORD_RESET: "Password reset",
  LOGOUT: "Logout",

  PHARMACY_CREATED: "Pharmacy created",
  PHARMACY_UPDATED: "Pharmacy updated",
  PHARMACY_DELETED: "Pharmacy deleted",

  APPOINTMENT_CREATED: "Appointment created",
  APPOINTMENT_CONFIRMED: "Appointment confirmed",
  APPOINTMENT_CANCELLED: "Appointment cancelled",

  DOCTOR_CREATED: "Doctor created",
  DOCTOR_UPDATED: "Doctor updated",

  TREATMENT_CREATED: "Treatment created",
  TREATMENT_UPDATED: "Treatment updated",

  BLOG_CREATED: "Blog created",
  BLOG_UPDATED: "Blog updated",
};

function formatAction(action: string) {
  return (
    ACTION_LABELS[action] ||
    action
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function RecentAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch(
        "/api/admin/audit-logs/recent"
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setLogs(data.logs ?? []);
    } catch (error) {
      console.error(
        "Failed to load recent audit logs:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Security & System Activity
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Recent administrative and security events
          </p>
        </div>

        <Link
          href="/admin/audit-logs"
          className="text-sm font-medium text-green-600 hover:text-green-700"
        >
          View All Audit Logs →
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading activity...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No audit activity yet.
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <div
                key={log.id}
                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-semibold">
                    {log.user?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "S"}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatAction(log.action)}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {log.user?.name || "System"}

                      {log.entity && (
                        <>
                          {" • "}
                          {log.entity}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  {formatDate(log.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}