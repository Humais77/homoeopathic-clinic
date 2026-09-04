"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

type WorkingHour = {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type Schedule = {
  id: string;
  doctorId: string;
  timezone: string;
  slotDuration: number;
  isActive: boolean;
  workingHours: WorkingHour[];
};

type Slot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BOOKED" | "BLOCKED";
  blockedReason?: string | null;
  appointment?: {
    id: string;
    name: string;
    email: string;
    status: string;
  } | null;
};

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

function getDateString(date: Date) {
  return date.toISOString().split("T")[0];
}

function getFutureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return getDateString(date);
}

export default function DoctorSchedulePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);

  const [selectedDate, setSelectedDate] = useState(getDateString(new Date()));
  const [fromDate, setFromDate] = useState(getDateString(new Date()));
  const [toDate, setToDate] = useState(getFutureDate(30));

  const [slots, setSlots] = useState<Slot[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [newSlot, setNewSlot] = useState({
    startTime: "09:00",
    endTime: "09:30",
  });

  const [showAddSlot, setShowAddSlot] = useState(false);

  const [blockReason, setBlockReason] = useState("");
  const [showBlock, setShowBlock] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace(
        `/login?redirect=${encodeURIComponent("/doctor/schedule")}`
      );
      return;
    }

    loadSchedule();
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !selectedDate) return;

    loadSlots();
  }, [selectedDate, isAuthenticated]);

  async function loadSchedule() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/doctor/schedule", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load schedule");
      }

      setSchedule(data.schedule || null);
      setWorkingHours(data.schedule?.workingHours || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load schedule"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSlots() {
    try {
      const response = await fetch(
        `/api/doctor/schedule/slots?date=${selectedDate}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load slots");
      }

      setSlots(data.slots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load slots");
    }
  }

  function getHoursForDay(day: number) {
    return workingHours.filter((hour) => hour.dayOfWeek === day);
  }

  function updateWorkingHour(
    index: number,
    field: keyof WorkingHour,
    value: string | boolean
  ) {
    setWorkingHours((current) =>
      current.map((hour, i) =>
        i === index ? { ...hour, [field]: value } : hour
      )
    );
  }

  function addWorkingHour(dayOfWeek: number) {
    setWorkingHours((current) => [
      ...current,
      {
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
        isActive: true,
      },
    ]);
  }

  function removeWorkingHour(index: number) {
    setWorkingHours((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function saveSchedule() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/doctor/schedule", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timezone: schedule?.timezone || "Asia/Karachi",
          slotDuration: schedule?.slotDuration || 30,
          isActive: schedule?.isActive ?? true,
          workingHours: workingHours.map((hour) => ({
            dayOfWeek: hour.dayOfWeek,
            startTime: hour.startTime,
            endTime: hour.endTime,
            isActive: hour.isActive,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save schedule");
      }

      setSchedule(data.schedule);
      setWorkingHours(data.schedule?.workingHours || []);

      setMessage("Schedule saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save schedule"
      );
    } finally {
      setSaving(false);
    }
  }

  async function generateSlots() {
    try {
      setGenerating(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/doctor/schedule/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromDate,
          to: toDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate slots");
      }

      setMessage(
        `Slots generated successfully. ${
          data.created ?? 0
        } new slots created.`
      );

      await loadSlots();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate slots"
      );
    } finally {
      setGenerating(false);
    }
  }

  async function addSlot() {
    try {
      setError("");
      setMessage("");

      const response = await fetch("/api/doctor/schedule/slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create slot");
      }

      setShowAddSlot(false);
      setMessage("Slot created successfully.");

      await loadSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create slot");
    }
  }

  async function deleteSlot(slotId: string) {
    if (!confirm("Delete this available slot?")) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/doctor/schedule/slots/${slotId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete slot");
      }

      setMessage("Slot deleted.");
      await loadSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete slot");
    }
  }

  async function blockDate() {
    try {
      setError("");
      setMessage("");

      const response = await fetch("/api/doctor/schedule/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          reason: blockReason || "Doctor unavailable",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to block date");
      }

      setShowBlock(false);
      setBlockReason("");
      setMessage("Date blocked successfully.");

      await loadSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to block date");
    }
  }

  async function unblockDate() {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/doctor/schedule/block?date=${selectedDate}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to unblock date");
      }

      setMessage("Date unblocked successfully.");
      await loadSlots();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to unblock date"
      );
    }
  }

  const selectedDateLabel = useMemo(() => {
    const date = new Date(`${selectedDate}T00:00:00`);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [selectedDate]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading schedule...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/doctor/dashboard"
              className="text-sm text-primary-600 hover:underline"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              My Schedule
            </h1>

            <p className="mt-1 text-gray-600">
              Manage your working hours, availability and appointment slots.
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Schedule Settings */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Working Hours
              </h2>
              <p className="text-sm text-gray-500">
                Define when patients can book appointments.
              </p>
            </div>

            <button
              onClick={saveSchedule}
              disabled={saving}
              className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Schedule"}
            </button>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Timezone
              </label>

              <select
                value={schedule?.timezone || "Asia/Karachi"}
                onChange={(e) =>
                  setSchedule((current) =>
                    current
                      ? { ...current, timezone: e.target.value }
                      : {
                          id: "",
                          doctorId: "",
                          timezone: e.target.value,
                          slotDuration: 30,
                          isActive: true,
                          workingHours: [],
                        }
                  )
                }
                className="w-full rounded-lg border px-3 py-2.5"
              >
                <option value="Asia/Karachi">Asia/Karachi</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
                <option value="Asia/Riyadh">Asia/Riyadh</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Slot Duration
              </label>

              <select
                value={schedule?.slotDuration || 30}
                onChange={(e) =>
                  setSchedule((current) =>
                    current
                      ? {
                          ...current,
                          slotDuration: Number(e.target.value),
                        }
                      : current
                  )
                }
                className="w-full rounded-lg border px-3 py-2.5"
              >
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={schedule?.isActive ?? true}
                  onChange={(e) =>
                    setSchedule((current) =>
                      current
                        ? {
                            ...current,
                            isActive: e.target.checked,
                          }
                        : current
                    )
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium">
                  Schedule Active
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            {DAYS.map((day) => {
              const dayHours = getHoursForDay(day.value);

              return (
                <div
                  key={day.value}
                  className="rounded-lg border p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {day.label}
                    </h3>

                    <button
                      type="button"
                      onClick={() => addWorkingHour(day.value)}
                      className="text-sm font-medium text-primary-600 hover:underline"
                    >
                      + Add period
                    </button>
                  </div>

                  {dayHours.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      No working hours
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {dayHours.map((hour) => {
                        const index = workingHours.indexOf(hour);

                        return (
                          <div
                            key={`${day.value}-${index}`}
                            className="flex flex-col gap-3 sm:flex-row sm:items-center"
                          >
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={hour.isActive}
                                onChange={(e) =>
                                  updateWorkingHour(
                                    index,
                                    "isActive",
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="text-sm">Active</span>
                            </label>

                            <input
                              type="time"
                              value={hour.startTime}
                              onChange={(e) =>
                                updateWorkingHour(
                                  index,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="rounded-lg border px-3 py-2"
                            />

                            <span className="text-gray-400">to</span>

                            <input
                              type="time"
                              value={hour.endTime}
                              onChange={(e) =>
                                updateWorkingHour(
                                  index,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              className="rounded-lg border px-3 py-2"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeWorkingHour(index)
                              }
                              className="text-sm text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Generate Slots */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Generate Appointment Slots
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Generate slots automatically from your working hours.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">
                From
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                To
              </label>

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={generateSlots}
                disabled={generating}
                className="w-full rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Slots"}
              </button>
            </div>
          </div>
        </section>

        {/* Daily Slots */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Slots
              </h2>

              <p className="text-sm text-gray-500">
                {selectedDateLabel}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border px-3 py-2"
              />

              <button
                onClick={() => setShowBlock(true)}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Block Date
              </button>

              <button
                onClick={unblockDate}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Unblock
              </button>

              <button
                onClick={() => setShowAddSlot(true)}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                + Add Slot
              </button>
            </div>
          </div>

          {showAddSlot && (
            <div className="mb-6 rounded-lg border bg-gray-50 p-4">
              <h3 className="mb-4 font-semibold">
                Add Manual Slot
              </h3>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div>
                  <label className="mb-1 block text-sm">
                    Start
                  </label>

                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) =>
                      setNewSlot((current) => ({
                        ...current,
                        startTime: e.target.value,
                      }))
                    }
                    className="rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">
                    End
                  </label>

                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) =>
                      setNewSlot((current) => ({
                        ...current,
                        endTime: e.target.value,
                      }))
                    }
                    className="rounded-lg border px-3 py-2"
                  />
                </div>

                <button
                  onClick={addSlot}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-white"
                >
                  Create
                </button>

                <button
                  onClick={() => setShowAddSlot(false)}
                  className="rounded-lg border px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showBlock && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="mb-4 font-semibold text-red-800">
                Block {selectedDateLabel}
              </h3>

              <input
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Reason"
                className="mb-3 w-full rounded-lg border px-3 py-2"
              />

              <div className="flex gap-3">
                <button
                  onClick={blockDate}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white"
                >
                  Confirm Block
                </button>

                <button
                  onClick={() => setShowBlock(false)}
                  className="rounded-lg border px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {slots.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-gray-500">
              No slots available for this date.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {slots.map((slot) => (
                    <tr
                      key={slot.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-4 py-4 font-medium">
                        {slot.startTime} - {slot.endTime}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            slot.status === "AVAILABLE"
                              ? "bg-green-100 text-green-700"
                              : slot.status === "BOOKED"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {slot.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {slot.appointment ? (
                          <div>
                            <div className="font-medium">
                              {slot.appointment.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {slot.appointment.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {slot.status === "AVAILABLE" && (
                          <button
                            onClick={() => deleteSlot(slot.id)}
                            className="text-sm font-medium text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        )}

                        {slot.status === "BOOKED" && (
                          <span className="text-sm text-gray-400">
                            Booked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}