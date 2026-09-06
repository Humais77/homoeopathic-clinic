"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

type AuditUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuditLog = {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: AuditUser | null;
};

type Filters = {
  actions: string[];
  entities: string[];
  users: AuditUser[];
};

const ACTION_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: "Login Successful",
  LOGIN_FAILED: "Login Failed",
  LOGOUT: "Logout",
  PASSWORD_RESET: "Password Reset",

  PHARMACY_CREATED: "Pharmacy Created",
  PHARMACY_UPDATED: "Pharmacy Updated",
  PHARMACY_ACTIVATED: "Pharmacy Activated",
  PHARMACY_DEACTIVATED: "Pharmacy Deactivated",
  PHARMACY_DELETED: "Pharmacy Deleted",

  APPOINTMENT_CREATED: "Appointment Created",
  APPOINTMENT_CONFIRMED: "Appointment Confirmed",
  APPOINTMENT_CANCELLED: "Appointment Cancelled",
  APPOINTMENT_COMPLETED: "Appointment Completed",

  DOCTOR_CREATED: "Doctor Created",
  DOCTOR_UPDATED: "Doctor Updated",
  DOCTOR_DELETED: "Doctor Deleted",

  TREATMENT_CREATED: "Treatment Created",
  TREATMENT_UPDATED: "Treatment Updated",
  TREATMENT_DELETED: "Treatment Deleted",

  BLOG_CREATED: "Blog Created",
  BLOG_UPDATED: "Blog Updated",
  BLOG_DELETED: "Blog Deleted",
};

function formatAction(action: string) {
  if (ACTION_LABELS[action]) {
    return ACTION_LABELS[action];
  }

  return action
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getActionClass(action: string) {
  if (
    action.includes("FAILED") ||
    action.includes("DELETED") ||
    action.includes("REJECTED")
  ) {
    return "bg-red-100 text-red-700";
  }

  if (
    action.includes("LOGIN") ||
    action.includes("PASSWORD")
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (
    action.includes("CREATED") ||
    action.includes("CONFIRMED") ||
    action.includes("ACTIVATED")
  ) {
    return "bg-green-100 text-green-700";
  }

  if (
    action.includes("UPDATED") ||
    action.includes("COMPLETED")
  ) {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-gray-100 text-gray-700";
}

export default function AdminAuditLogsPage() {
  const router = useRouter();

  const {
    user,
    isLoading: authLoading,
    isAdmin,
  } = useAuth();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState<Filters>({
    actions: [],
    entities: [],
    users: [],
  });

  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
  const [userId, setUserId] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] =
    useState<AuditLog | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace(
        "/login?redirect=/admin/audit-logs"
      );
      return;
    }

    if (!isAdmin) {
      router.replace("/user/dashboard");
      return;
    }

    fetchFilters();
  }, [user, authLoading, isAdmin, router]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    fetchLogs();
  }, [user, isAdmin, page, search, action, entity, userId]);

  const fetchFilters = async () => {
    try {
      const response = await fetch(
        "/api/admin/audit-logs/filters"
      );

      if (!response.ok) return;

      const data = await response.json();

      setFilters({
        actions: data.actions ?? [],
        entities: data.entities ?? [],
        users: data.users ?? [],
      });
    } catch (error) {
      console.error(
        "Failed to fetch audit filters:",
        error
      );
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", "20");

      if (search) {
        params.set("search", search);
      }

      if (action) {
        params.set("action", action);
      }

      if (entity) {
        params.set("entity", entity);
      }

      if (userId) {
        params.set("userId", userId);
      }

      const response = await fetch(
        `/api/admin/audit-logs?${params.toString()}`
      );

      if (response.status === 401) {
        router.replace(
          "/login?redirect=/admin/audit-logs"
        );
        return;
      }

      if (response.status === 403) {
        router.replace("/user/dashboard");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const data = await response.json();

      setLogs(data.logs ?? []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(
        Math.max(data.pagination?.totalPages ?? 1, 1)
      );
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setAction("");
    setEntity("");
    setUserId("");
    setPage(1);
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
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Link
                  href="/admin/dashboard"
                  className="hover:text-green-600"
                >
                  Admin Dashboard
                </Link>

                <span>/</span>

                <span>Audit Logs</span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Audit Logs
              </h1>

              <p className="text-sm text-gray-600 mt-1">
                Security and administrative activity
              </p>
            </div>

            <div className="text-sm text-gray-500">
              {total} total events
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search activity, user, IP..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>

              <select
                value={action}
                onChange={(e) => {
                  setAction(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white"
              >
                <option value="">All actions</option>

                {filters.actions.map((item) => (
                  <option key={item} value={item}>
                    {formatAction(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entity
              </label>

              <select
                value={entity}
                onChange={(e) => {
                  setEntity(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white"
              >
                <option value="">All entities</option>

                {filters.entities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User
              </label>

              <select
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white"
              >
                <option value="">All users</option>

                {filters.users.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-green-600"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No audit logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Activity
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                      User
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Entity
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                      IP Address
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Date
                    </th>

                    <th className="text-right px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Details
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getActionClass(
                            log.action
                          )}`}
                        >
                          {formatAction(log.action)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {log.user ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {log.user.name}
                            </div>

                            <div className="text-xs text-gray-500">
                              {log.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            System
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-900">
                          {log.entity || "—"}
                        </div>

                        {log.entityId && (
                          <div
                            className="text-xs text-gray-400 max-w-[180px] truncate"
                            title={log.entityId}
                          >
                            {log.entityId}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {log.ipAddress || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() =>
                            setSelectedLog(log)
                          }
                          className="text-sm font-medium text-green-600 hover:text-green-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              No audit logs found.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getActionClass(
                      log.action
                    )}`}
                  >
                    {formatAction(log.action)}
                  </span>

                  <button
                    onClick={() =>
                      setSelectedLog(log)
                    }
                    className="text-sm text-green-600 font-medium"
                  >
                    View
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">
                      User:
                    </span>{" "}
                    <span className="font-medium">
                      {log.user?.name || "System"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">
                      Entity:
                    </span>{" "}
                    {log.entity || "—"}
                  </div>

                  <div>
                    <span className="text-gray-500">
                      IP:
                    </span>{" "}
                    {log.ipAddress || "—"}
                  </div>

                  <div>
                    <span className="text-gray-500">
                      Date:
                    </span>{" "}
                    {formatDate(log.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              disabled={page <= 1}
              onClick={() =>
                setPage((current) =>
                  Math.max(current - 1, 1)
                )
              }
              className="px-4 py-2 rounded-lg border bg-white text-sm disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(current + 1, totalPages)
                )
              }
              className="px-4 py-2 rounded-lg border bg-white text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Audit Log Details
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(selectedLog.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs uppercase font-semibold text-gray-500">
                  Action
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {formatAction(selectedLog.action)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase font-semibold text-gray-500">
                  User
                </p>

                {selectedLog.user ? (
                  <div className="mt-1">
                    <p className="font-medium">
                      {selectedLog.user.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {selectedLog.user.email}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Role: {selectedLog.user.role}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-gray-500">
                    System
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase font-semibold text-gray-500">
                    Entity
                  </p>

                  <p className="mt-1 text-sm">
                    {selectedLog.entity || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase font-semibold text-gray-500">
                    Entity ID
                  </p>

                  <p className="mt-1 text-sm break-all">
                    {selectedLog.entityId || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase font-semibold text-gray-500">
                    IP Address
                  </p>

                  <p className="mt-1 text-sm">
                    {selectedLog.ipAddress || "—"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase font-semibold text-gray-500">
                  User Agent
                </p>

                <p className="mt-1 text-sm text-gray-600 break-all">
                  {selectedLog.userAgent || "—"}
                </p>
              </div>

              {selectedLog.metadata && (
                <div>
                  <p className="text-xs uppercase font-semibold text-gray-500 mb-2">
                    Metadata
                  </p>

                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
                    {JSON.stringify(
                      selectedLog.metadata,
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}