"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

type UserRole = "USER" | "DOCTOR" | "ADMIN";

type UserStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "DISABLED";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  doctor?: {
    id: string;
    name: string;
    isActive: boolean;
  } | null;
  _count: {
    appointments: number;
    notifications: number;
    blogs: number;
    auditLogs: number;
  };
};

type FormData = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
};

const emptyForm: FormData = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "USER",
  status: "ACTIVE",
  emailVerified: true,
};

export default function AdminUsersPage() {
  const router = useRouter();

  const {
    user,
    isLoading: authLoading,
    isAdmin,
  } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState<"ALL" | UserRole>("ALL");

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | UserStatus>("ALL");

  const [showModal, setShowModal] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [form, setForm] =
    useState<FormData>(emptyForm);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace(
        "/login?redirect=/admin/users"
      );
      return;
    }

    if (!isAdmin) {
      router.replace("/user/dashboard");
      return;
    }

    fetchUsers();
  }, [
    user,
    authLoading,
    isAdmin,
    router,
  ]);

  async function fetchUsers() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/users",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace(
          "/login?redirect=/admin/users"
        );
        return;
      }

      if (response.status === 403) {
        router.replace("/");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch users"
        );
      }

      setUsers(data.users ?? []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(user: User) {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone ?? "",
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const isEditing =
        Boolean(editingUser);

      const payload: Record<
        string,
        unknown
      > = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        status: form.status,
        emailVerified:
          form.emailVerified,
      };

      if (form.password) {
        payload.password =
          form.password;
      }

      const response = await fetch(
        isEditing
          ? `/api/admin/users/${editingUser!.id}`
          : "/api/admin/users",
        {
          method: isEditing
            ? "PATCH"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save user"
        );
      }

      setSuccess(
        isEditing
          ? "User updated successfully."
          : "User created successfully."
      );

      await fetchUsers();

      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save user"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(
    selectedUser: User
  ) {
    if (
      selectedUser.id === user?.id
    ) {
      alert(
        "You cannot delete your own administrator account."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedUser.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/users/${selectedUser.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete user"
        );
      }

      setSuccess(
        "User deleted successfully."
      );

      await fetchUsers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete user"
      );
    }
  }

  const filteredUsers =
    users.filter((item) => {
      const searchValue =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        item.name
          .toLowerCase()
          .includes(searchValue) ||
        item.email
          .toLowerCase()
          .includes(searchValue) ||
        item.phone
          ?.toLowerCase()
          .includes(searchValue);

      const matchesRole =
        roleFilter === "ALL" ||
        item.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });

  if (
    authLoading ||
    !user ||
    !isAdmin
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-[#45a94a]" />
          <p className="mt-4 text-sm font-medium text-slate-400">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0d1235] text-white">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">
                Heal By Nature
              </p>
              <p className="text-xs text-slate-400">
                User Management
              </p>
            </div>

            <button
              onClick={() =>
                router.push(
                  "/admin/dashboard"
                )
              }
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 md:py-9 lg:px-8">
        {/* Heading */}
        <section className="mb-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e7f5e8] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#31853a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#45a94a]" />
                Administration
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#10105c] sm:text-4xl">
                Users
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Manage patient, doctor and
                administrator accounts.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="rounded-xl bg-[#45a94a] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#31853a]"
            >
              + Add User
            </button>
          </div>
        </section>

        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* Filters */}
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search name, email or phone..."
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#45a94a] focus:ring-2 focus:ring-[#45a94a]/10"
            />

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value as
                    | "ALL"
                    | UserRole
                )
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#45a94a]"
            >
              <option value="ALL">
                All Roles
              </option>
              <option value="USER">
                Patients / Users
              </option>
              <option value="DOCTOR">
                Doctors
              </option>
              <option value="ADMIN">
                Administrators
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "ALL"
                    | UserStatus
                )
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#45a94a]"
            >
              <option value="ALL">
                All Statuses
              </option>
              <option value="ACTIVE">
                Active
              </option>
              <option value="SUSPENDED">
                Suspended
              </option>
              <option value="DISABLED">
                Disabled
              </option>
            </select>
          </div>
        </section>

        {/* Users table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                User Accounts
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredUsers.length} user
                {filteredUsers.length !== 1
                  ? "s"
                  : ""}{" "}
                displayed
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#45a94a]" />
              <p className="mt-3 text-sm text-slate-500">
                Loading users...
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold text-slate-700">
                No users found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try changing your filters or
                create a new user.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      User
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Role
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Activity
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e7f5e8] font-bold text-[#31853a]">
                              {item.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {item.name}
                              </p>

                              <p className="text-xs text-slate-500">
                                {item.email}
                              </p>

                              {item.phone && (
                                <p className="text-xs text-slate-400">
                                  {item.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                              item.role ===
                              "ADMIN"
                                ? "bg-purple-100 text-purple-700"
                                : item.role ===
                                  "DOCTOR"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.role}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                              item.status ===
                              "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : item.status ===
                                  "SUSPENDED"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.status}
                          </span>

                          <p className="mt-1 text-xs text-slate-400">
                            {item.emailVerified
                              ? "Email verified"
                              : "Email not verified"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1 text-xs text-slate-500">
                            <p>
                              Appointments:{" "}
                              <span className="font-semibold text-slate-700">
                                {
                                  item
                                    ._count
                                    .appointments
                                }
                              </span>
                            </p>

                            <p>
                              Blogs:{" "}
                              <span className="font-semibold text-slate-700">
                                {
                                  item
                                    ._count
                                    .blogs
                                }
                              </span>
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                openEditModal(
                                  item
                                )
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-[#45a94a] hover:text-[#31853a]"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                deleteUser(
                                  item
                                )
                              }
                              disabled={
                                item.id ===
                                user.id
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingUser
                    ? "Edit User"
                    : "Create User"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Manage account details,
                  permissions and status.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>

                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#45a94a] focus:ring-2 focus:ring-[#45a94a]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        email:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#45a94a] focus:ring-2 focus:ring-[#45a94a]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Phone
                  </label>

                  <input
                    value={form.phone}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        phone:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#45a94a] focus:ring-2 focus:ring-[#45a94a]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Password{" "}
                    {editingUser && (
                      <span className="font-normal text-slate-400">
                        (leave empty to keep current)
                      </span>
                    )}
                  </label>

                  <input
                    type="password"
                    minLength={8}
                    required={!editingUser}
                    value={form.password}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        password:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#45a94a] focus:ring-2 focus:ring-[#45a94a]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Role
                  </label>

                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        role: event.target
                          .value as UserRole,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#45a94a]"
                  >
                    <option value="USER">
                      Patient / User
                    </option>
                    <option value="DOCTOR">
                      Doctor
                    </option>
                    <option value="ADMIN">
                      Administrator
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status:
                          event.target
                            .value as UserStatus,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#45a94a]"
                  >
                    <option value="ACTIVE">
                      Active
                    </option>
                    <option value="SUSPENDED">
                      Suspended
                    </option>
                    <option value="DISABLED">
                      Disabled
                    </option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={
                    form.emailVerified
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      emailVerified:
                        event.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-[#45a94a]"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Email verified
                  </p>

                  <p className="text-xs text-slate-500">
                    Mark this account as having a
                    verified email address.
                  </p>
                </div>
              </label>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#45a94a] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#31853a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}