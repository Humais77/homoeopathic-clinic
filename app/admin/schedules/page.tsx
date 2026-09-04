"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

type Doctor = {
  id: string;
  name: string;
  qualification: string;
  specialization?: string | null;
  isActive: boolean;

  schedule?: {
    id: string;
    timezone: string;
    slotDuration: number;
    isActive: boolean;
  } | null;

  _count: {
    slots: number;
    appointments: number;
  };
};

type WorkingHour = {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type Schedule = {
  id?: string;
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

function today() {
  return new Date().toISOString().split("T")[0];
}

function plusDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return date.toISOString().split("T")[0];
}

export default function AdminSchedulesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [selectedDate, setSelectedDate] = useState(today());
  const [fromDate, setFromDate] = useState(today());
  const [toDate, setToDate] = useState(plusDays(30));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showBlock, setShowBlock] = useState(false);

  const [newSlot, setNewSlot] = useState({
    startTime: "09:00",
    endTime: "09:30",
  });

  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace(
        `/login?redirect=${encodeURIComponent("/admin/schedules")}`
      );
      return;
    }

    loadDoctors();
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!selectedDoctorId) return;

    loadSchedule();
  }, [selectedDoctorId]);

  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;

    loadSlots();
  }, [selectedDoctorId, selectedDate]);

  async function loadDoctors() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/schedules", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load doctors");
      }

      const list = data.doctors || [];

      setDoctors(list);

      if (list.length > 0) {
        setSelectedDoctorId(list[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load doctors"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSchedule() {
    try {
      setError("");

      const response = await fetch(
        `/api/admin/schedules/${selectedDoctorId}`,
        {
          cache: "no-store",
        }
      );

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
    }
  }

  async function loadSlots() {
    try {
      const response = await fetch(
        `/api/admin/schedules/${selectedDoctorId}/slots?date=${selectedDate}`,
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
      setError(
        err instanceof Error ? err.message : "Failed to load slots"
      );
    }
  }

  function getHoursForDay(day: number) {
    return workingHours.filter(
      (hour) => hour.dayOfWeek === day
    );
  }

  function updateHour(
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

  function addPeriod(dayOfWeek: number) {
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

  function removeHour(index: number) {
    setWorkingHours((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function saveSchedule() {
    if (!selectedDoctorId) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/admin/schedules/${selectedDoctorId}`,
        {
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save schedule");
      }

      setSchedule(data.schedule);
      setWorkingHours(data.schedule?.workingHours || []);

      setMessage("Doctor schedule saved successfully.");
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
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/admin/schedules/${selectedDoctorId}/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromDate,
            to: toDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate slots");
      }

      setMessage(
        `Slot generation completed. ${
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
      const response = await fetch(
        `/api/admin/schedules/${selectedDoctorId}/slots`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: selectedDate,
            startTime: newSlot.startTime,
            endTime: newSlot.endTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create slot");
      }

      setShowAddSlot(false);
      setMessage("Slot created successfully.");

      await loadSlots();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create slot"
      );
    }
  }

  async function deleteSlot(slotId: string) {
    if (!confirm("Delete this available slot?")) return;

    try {
      const response = await fetch(
        `/api/admin/schedules/${selectedDoctorId}/slots/${slotId}`,
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
      setError(
        err instanceof Error ? err.message : "Failed to delete slot"
      );
    }
  }

  async function blockDate() {
    try {
      const response = await fetch(
        `/api/admin/schedules/${selectedDoctorId}/block`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: selectedDate,
            reason: blockReason || "Doctor unavailable",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to block date");
      }

      setShowBlock(false);
      setBlockReason("");

      setMessage("Doctor date blocked successfully.");

      await loadSlots();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to block date"
      );
    }
  }

  async function unblockDate() {
    try {
      const response = await fetch(
        `/api/admin/schedules/${selectedDoctorId}/block?date=${selectedDate}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to unblock date");
      }

      setMessage("Doctor date unblocked.");

      await loadSlots();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to unblock date"
      );
    }
  }

  const selectedDoctor = doctors.find(
    (doctor) => doctor.id === selectedDoctorId
  );

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">
          Loading schedules...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="text-sm text-primary-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Doctor Schedules
          </h1>

          <p className="mt-1 text-gray-600">
            Manage working hours and appointment availability.
          </p>
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

        {doctors.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              No doctors found
            </h2>

            <p className="mt-2 text-gray-500">
              Create a doctor before configuring schedules.
            </p>

            <Link
              href="/admin/doctors"
              className="mt-5 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-white"
            >
              Manage Doctors
            </Link>
          </div>
        ) : (
          <>
            {/* Doctor Selector */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <label className="mb-2 block text-sm font-medium">
                Select Doctor
              </label>

              <select
                value={selectedDoctorId}
                onChange={(e) =>
                  setSelectedDoctorId(e.target.value)
                }
                className="w-full max-w-xl rounded-lg border px-3 py-3"
              >
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} — {doctor.specialization || doctor.qualification}
                  </option>
                ))}
              </select>

              {selectedDoctor && (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Schedule
                    </p>
                    <p className="mt-1 font-semibold">
                      {selectedDoctor.schedule?.isActive
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Generated Slots
                    </p>
                    <p className="mt-1 font-semibold">
                      {selectedDoctor._count.slots}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Appointments
                    </p>
                    <p className="mt-1 font-semibold">
                      {selectedDoctor._count.appointments}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Working Hours */}
            <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Working Hours
                  </h2>

                  <p className="text-sm text-gray-500">
                    Configure this doctor's recurring availability.
                  </p>
                </div>

                <button
                  onClick={saveSchedule}
                  disabled={saving}
                  className="rounded-lg bg-primary-600 px-5 py-2.5 text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Schedule"}
                </button>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Timezone
                  </label>

                  <input
                    value={schedule?.timezone || "Asia/Karachi"}
                    onChange={(e) =>
                      setSchedule((current) =>
                        current
                          ? {
                              ...current,
                              timezone: e.target.value,
                            }
                          : current
                      )
                    }
                    className="w-full rounded-lg border px-3 py-2.5"
                  />
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
                  <label className="flex items-center gap-3">
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
                        <h3 className="font-semibold">
                          {day.label}
                        </h3>

                        <button
                          type="button"
                          onClick={() =>
                            addPeriod(day.value)
                          }
                          className="text-sm text-primary-600 hover:underline"
                        >
                          + Add period
                        </button>
                      </div>

                      {dayHours.length === 0 ? (
                        <p className="text-sm text-gray-400">
                          Closed
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {dayHours.map((hour) => {
                            const index =
                              workingHours.indexOf(hour);

                            return (
                              <div
                                key={`${day.value}-${index}`}
                                className="flex flex-wrap items-center gap-3"
                              >
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={hour.isActive}
                                    onChange={(e) =>
                                      updateHour(
                                        index,
                                        "isActive",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  Active
                                </label>

                                <input
                                  type="time"
                                  value={hour.startTime}
                                  onChange={(e) =>
                                    updateHour(
                                      index,
                                      "startTime",
                                      e.target.value
                                    )
                                  }
                                  className="rounded-lg border px-3 py-2"
                                />

                                <span>to</span>

                                <input
                                  type="time"
                                  value={hour.endTime}
                                  onChange={(e) =>
                                    updateHour(
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
                                    removeHour(index)
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

            {/* Generate */}
            <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">
                Generate Slots
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Automatically create appointment slots from the
                doctor's working hours.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    From
                  </label>

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) =>
                      setFromDate(e.target.value)
                    }
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
                    onChange={(e) =>
                      setToDate(e.target.value)
                    }
                    className="w-full rounded-lg border px-3 py-2.5"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={generateSlots}
                    disabled={generating}
                    className="w-full rounded-lg bg-gray-900 px-5 py-2.5 text-white disabled:opacity-50"
                  >
                    {generating
                      ? "Generating..."
                      : "Generate Slots"}
                  </button>
                </div>
              </div>
            </section>

            {/* Slots */}
            <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Appointment Slots
                  </h2>

                  <p className="text-sm text-gray-500">
                    Manage slots for the selected date.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) =>
                      setSelectedDate(e.target.value)
                    }
                    className="rounded-lg border px-3 py-2"
                  />

                  <button
                    onClick={() => setShowBlock(true)}
                    className="rounded-lg border border-red-300 px-4 py-2 text-red-600"
                  >
                    Block Date
                  </button>

                  <button
                    onClick={unblockDate}
                    className="rounded-lg border px-4 py-2"
                  >
                    Unblock
                  </button>

                  <button
                    onClick={() => setShowAddSlot(true)}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-white"
                  >
                    + Add Slot
                  </button>
                </div>
              </div>

              {showAddSlot && (
                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                  <div className="flex flex-wrap items-end gap-3">
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
                  <h3 className="mb-3 font-semibold text-red-800">
                    Block Doctor's Date
                  </h3>

                  <input
                    value={blockReason}
                    onChange={(e) =>
                      setBlockReason(e.target.value)
                    }
                    placeholder="Reason"
                    className="mb-3 w-full rounded-lg border px-3 py-2"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={blockDate}
                      className="rounded-lg bg-red-600 px-4 py-2 text-white"
                    >
                      Block Date
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
                  No slots found for this date.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px] text-left">
                    <thead>
                      <tr className="border-b text-sm text-gray-500">
                        <th className="px-4 py-3">
                          Time
                        </th>
                        <th className="px-4 py-3">
                          Status
                        </th>
                        <th className="px-4 py-3">
                          Patient
                        </th>
                        <th className="px-4 py-3">
                          Appointment
                        </th>
                        <th className="px-4 py-3 text-right">
                          Action
                        </th>
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
                                slot.status ===
                                "AVAILABLE"
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
                            {slot.appointment?.name || "—"}
                          </td>

                          <td className="px-4 py-4">
                            {slot.appointment ? (
                              <span className="text-sm">
                                {slot.appointment.status}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="px-4 py-4 text-right">
                            {slot.status === "AVAILABLE" ? (
                              <button
                                onClick={() =>
                                  deleteSlot(slot.id)
                                }
                                className="text-sm text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            ) : (
                              <span className="text-sm text-gray-400">
                                Locked
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
          </>
        )}
      </div>
    </main>
  );
}