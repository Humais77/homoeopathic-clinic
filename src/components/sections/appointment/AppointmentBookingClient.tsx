"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
  useAppointmentBooking,
  type MeetingType as BookingMeetingType,
} from "./AppointmentBookingProvider";

import { ConnectionMethods } from "./ConnectionMethods";

type Doctor = {
  id: string;
  name: string;
  qualification: string;
  experience: string | null;
  specialization?: string | null;
  description?: string | null;
  image: string | null;
};

type FormData = {
  namePlaceholder: string;
  emailPlaceholder: string;
  concernsPlaceholder: string;
};

type MeetingOption = {
  id: BookingMeetingType;
  title: string;
  description: string;
  type: string;
};

type ConnectionMethodOption = {
  id: string;
  title: string;
  description: string;
  type: string;
};

type AvailableSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BOOKED" | "BLOCKED";
};

type Props = {
  meetingTypes: MeetingOption[];
  doctors: Doctor[];
  form: FormData;
  connectionMethods: ConnectionMethodOption[];
  isAuthenticated: boolean;
};

function ClinicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-9 w-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 21V8l8-5 8 5v13H4Z" />
      <path d="M12 8v7M8.5 11.5h7" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-9 w-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="14" height="14" rx="2" />
      <path d="m17 9 4-2v10l-4-2" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function StarRating() {
  return (
    <div className="flex items-center gap-0.5 text-[#3d9f4b]">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className="text-[10px]">
          ★
        </span>
      ))}
    </div>
  );
}

function formatSlotTime(time: string) {
  const [hoursString, minutes] = time.split(":");
  const hours = Number(hoursString);

  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
}

function getDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
}

function getTodayKey() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getInitialCalendarDate() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function AppointmentBookingClient({
  meetingTypes,
  doctors,
  form,
  connectionMethods,
  isAuthenticated,
}: Props) {
  const {
    meetingType,
    setMeetingType,
    connectionMethod,
    setConnectionMethod,
  } = useAppointmentBooking();

  const [selectedDoctorId, setSelectedDoctorId] = useState(
    doctors[0]?.id || ""
  );

  const selectedDoctor = doctors.find(
    (doctor) => doctor.id === selectedDoctorId
  );

  const todayKey = getTodayKey();

  const [selectedDate, setSelectedDate] = useState(todayKey);

  const [calendarDate, setCalendarDate] = useState(
    getInitialCalendarDate()
  );

  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [concerns, setConcerns] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();

  /*
   * Load real available slots whenever
   * doctor or date changes.
   */
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setSlots([]);
      setSelectedSlotId("");
      return;
    }

    let cancelled = false;

    async function loadAvailableSlots() {
      try {
        setSlotsLoading(true);
        setSlotsError("");
        setSelectedSlotId("");
        setSlots([]);

        const response = await fetch(
          `/api/appointments/available-slots?doctorId=${encodeURIComponent(
            selectedDoctorId
          )}&date=${encodeURIComponent(selectedDate)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        let data: {
          slots?: AvailableSlot[];
          error?: string;
          message?: string;
        };

        try {
          data = await response.json();
        } catch {
          throw new Error(
            "Unable to read the available slots response."
          );
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Failed to load available slots."
          );
        }

        if (cancelled) return;

        const availableSlots: AvailableSlot[] = (
          data.slots || []
        ).filter(
          (slot: AvailableSlot) =>
            slot.status === "AVAILABLE"
        );

        setSlots(availableSlots);

        /*
         * Automatically select the first available slot.
         */
        if (availableSlots.length > 0) {
          setSelectedSlotId(availableSlots[0].id);
        }
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Available slots error:",
          error
        );

        setSlots([]);
        setSelectedSlotId("");

        setSlotsError(
          error instanceof Error
            ? error.message
            : "Unable to load available slots."
        );
      } finally {
        if (!cancelled) {
          setSlotsLoading(false);
        }
      }
    }

    loadAvailableSlots();

    return () => {
      cancelled = true;
    };
  }, [selectedDoctorId, selectedDate]);

  /*
   * Calendar days.
   */
  const days = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    ).getDay();

    const totalDays = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const previousMonthDays = new Date(
      year,
      month,
      0
    ).getDate();

    const result: {
      day: number;
      currentMonth: boolean;
      dateKey: string;
    }[] = [];

    /*
     * Previous month days.
     */
    for (
      let i = firstDay - 1;
      i >= 0;
      i--
    ) {
      const day = previousMonthDays - i;

      result.push({
        day,
        currentMonth: false,
        dateKey: "",
      });
    }

    /*
     * Current month days.
     */
    for (
      let day = 1;
      day <= totalDays;
      day++
    ) {
      result.push({
        day,
        currentMonth: true,
        dateKey: getDateKey(
          year,
          month,
          day
        ),
      });
    }

    /*
     * Next month days.
     */
    let nextMonthDay = 1;

    while (result.length < 42) {
      result.push({
        day: nextMonthDay,
        currentMonth: false,
        dateKey: "",
      });

      nextMonthDay++;
    }

    return result;
  }, [calendarDate]);

  function selectDate(
    year: number,
    month: number,
    day: number
  ) {
    const dateKey = getDateKey(
      year,
      month,
      day
    );

    /*
     * Don't allow booking dates in the past.
     */
    if (dateKey < todayKey) {
      return;
    }

    setSelectedDate(dateKey);
    setErrorMessage("");
  }

  function goPreviousMonth() {
    const previousMonth = new Date(
      calendarYear,
      calendarMonth - 1,
      1
    );

    /*
     * Don't allow navigation before
     * the current month.
     */
    const currentMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    if (previousMonth < currentMonth) {
      return;
    }

    setCalendarDate(previousMonth);
  }

  function goNextMonth() {
    setCalendarDate(
      new Date(
        calendarYear,
        calendarMonth + 1,
        1
      )
    );
  }

  /*
   * Submit appointment.
   *
   * Flow:
   *
   * 1. Validate form
   * 2. Create appointment
   * 3. Create Safepay payment
   * 4. Redirect patient to Safepay
   */
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setErrorMessage("");

    /*
     * Authentication check.
     */
    if (!isAuthenticated) {
      window.location.href =
        "/login?redirect=/appointment";

      return;
    }

    /*
     * Basic validation.
     */
    if (!selectedDoctorId) {
      setErrorMessage(
        "Please select a specialist."
      );
      return;
    }

    if (!selectedDate) {
      setErrorMessage(
        "Please select an appointment date."
      );
      return;
    }

    if (!selectedSlotId) {
      setErrorMessage(
        "Please select an available time slot."
      );
      return;
    }

    if (
      meetingType === "video" &&
      !connectionMethod
    ) {
      setErrorMessage(
        "Please select an online consultation platform."
      );
      return;
    }

    if (!name.trim()) {
      setErrorMessage(
        "Please enter your name."
      );
      return;
    }

    if (!email.trim()) {
      setErrorMessage(
        "Please enter your email."
      );
      return;
    }

    if (!concerns.trim()) {
      setErrorMessage(
        "Please briefly describe your concerns."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       *
       * We only send slotId.
       *
       * The server must derive the real
       * appointment date and time from
       * AvailableSlot.
       */
      const response = await fetch(
        "/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),

            meetingType,

            connectionMethod:
              meetingType === "clinic"
                ? null
                : connectionMethod,

            concerns: concerns.trim(),

            doctorId:
              selectedDoctorId,

            slotId:
              selectedSlotId,
          }),
        }
      );

      let data: {
        success?: boolean;
        message?: string;
        error?: string;
        appointment?: {
          id: string;
        };
        payment?: {
          id?: string;
          checkoutUrl?: string;
          status?: string;
        };
      };

      /*
       * Safely parse response.
       */
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error(
          "JSON parse error:",
          jsonError
        );

        throw new Error(
          "Server returned an invalid response. Please try again."
        );
      }

      /*
       * API error.
       */
      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to create appointment."
        );
      }

      /*
       * Safepay checkout URL.
       *
       * Your appointment API should return:
       *
       * {
       *   success: true,
       *   appointment: {...},
       *   payment: {
       *     id: "...",
       *     checkoutUrl: "https://..."
       *   }
       * }
       */
      const checkoutUrl =
        data.payment?.checkoutUrl;

      if (!checkoutUrl) {
        console.error(
          "Appointment API response:",
          data
        );

        throw new Error(
          "Payment checkout URL was not returned. Please try again."
        );
      }

      /*
       * Redirect to Safepay hosted checkout.
       *
       * Do NOT mark the appointment as
       * confirmed here.
       *
       * The webhook will mark the Payment
       * as PAID after Safepay confirms payment.
       */
      window.location.href =
        checkoutUrl;

      /*
       * Nothing below this point should
       * execute during normal checkout.
       */
      return;
    } catch (error) {
      console.error(
        "Appointment booking error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* =====================================================
          MEETING TYPES
          ===================================================== */}
      <div className="grid gap-4 md:grid-cols-2">
        {meetingTypes
          .filter(
            (type) =>
              type.id === "clinic" ||
              type.id === "video"
          )
          .map((type) => {
            const selected =
              meetingType === type.id;

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setMeetingType(
                    type.id
                  );

                  if (
                    type.id === "clinic"
                  ) {
                    setConnectionMethod(
                      null
                    );
                  } else if (
                    type.id === "video"
                  ) {
                    /*
                     * Default online method.
                     */
                    setConnectionMethod(
                      "google_meet"
                    );
                  }

                  setErrorMessage("");
                }}
                className={`rounded-[20px] border-2 p-5 text-left transition-all md:min-h-[152px] ${
                  selected
                    ? "border-[#151568] bg-[#151568] text-white"
                    : "border-[#151568] bg-[#f8f8fa] text-[#151568]"
                }`}
              >
                <div
                  className={`mb-2 ${
                    selected
                      ? "text-white"
                      : "text-[#151568]"
                  }`}
                >
                  {type.id === "clinic" ? (
                    <ClinicIcon />
                  ) : (
                    <VideoIcon />
                  )}
                </div>

                <h3 className="text-base font-bold md:text-lg">
                  {type.title}
                </h3>

                <p
                  className={`mt-1 max-w-md text-xs leading-5 ${
                    selected
                      ? "text-white/75"
                      : "text-gray-500"
                  }`}
                >
                  {type.description}
                </p>
              </button>
            );
          })}
      </div>

      {/* =====================================================
          ONLINE CONNECTION METHODS
          ===================================================== */}
      {meetingType === "video" && (
        <div className="mt-6">
          <ConnectionMethods
            methods={connectionMethods}
          />
        </div>
      )}

      {/* =====================================================
          CALENDAR + SLOTS
          ===================================================== */}
      <div className="mt-6">
        <h3 className="mb-4 text-xl font-bold text-[#10105c]">
          Select your preferred time
        </h3>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          {/* Calendar */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-700">
                {calendarDate.toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </h4>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={
                    goPreviousMonth
                  }
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:bg-gray-50"
                  aria-label="Previous month"
                >
                  <ChevronLeft />
                </button>

                <button
                  type="button"
                  onClick={goNextMonth}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:bg-gray-50"
                  aria-label="Next month"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7">
              {[
                "Su",
                "Mo",
                "Tu",
                "We",
                "Th",
                "Fr",
                "Sa",
              ].map((day) => (
                <div
                  key={day}
                  className="pb-2 text-center text-[10px] font-semibold text-gray-600"
                >
                  {day}
                </div>
              ))}

              {days.map(
                (item, index) => {
                  const disabled =
                    !item.currentMonth ||
                    item.dateKey <
                      todayKey;

                  const selected =
                    item.currentMonth &&
                    item.dateKey ===
                      selectedDate;

                  return (
                    <button
                      key={`${item.day}-${index}`}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (
                          item.currentMonth &&
                          !disabled
                        ) {
                          selectDate(
                            calendarYear,
                            calendarMonth,
                            item.day
                          );
                        }
                      }}
                      className={`flex h-9 items-center justify-center rounded-lg text-xs transition ${
                        selected
                          ? "bg-[#151568] font-bold text-white"
                          : disabled
                            ? "cursor-not-allowed text-gray-300"
                            : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.day}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Available slots */}
          <div className="rounded-[20px] bg-[#3da449] p-4">
            <h4 className="mb-1 text-center text-sm font-bold text-white">
              Available Slots
            </h4>

            <p className="mb-3 text-center text-[10px] text-white/70">
              {selectedDate}
            </p>

            {slotsLoading ? (
              <div className="py-6 text-center text-xs text-white">
                Loading available times...
              </div>
            ) : slotsError ? (
              <div className="rounded-lg bg-white/10 p-4 text-center text-xs text-white">
                {slotsError}
              </div>
            ) : slots.length === 0 ? (
              <div className="py-6 text-center text-xs text-white/80">
                No available slots for this date.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {slots.map((slot) => {
                  const selected =
                    selectedSlotId ===
                    slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setSelectedSlotId(
                          slot.id
                        );
                        setErrorMessage("");
                      }}
                      className={`rounded-full border px-3 py-2 text-[10px] font-medium transition ${
                        selected
                          ? "border-white bg-white text-[#151568]"
                          : "border-white/70 text-white hover:bg-white/10"
                      }`}
                    >
                      {formatSlotTime(
                        slot.startTime
                      )}{" "}
                      -{" "}
                      {formatSlotTime(
                        slot.endTime
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          DOCTORS
          ===================================================== */}
      <div className="mt-6">
        <h3 className="mb-4 text-xl font-bold text-[#10105c]">
          Choose your specialist
        </h3>

        {doctors.length === 0 ? (
          <div className="rounded-[20px] bg-gray-50 p-5 text-sm text-gray-500">
            No specialists are
            currently available.
          </div>
        ) : (
          <>
            {/* Doctor Dropdown */}
            <div className="relative mb-3">
              <select
                value={
                  selectedDoctorId
                }
                onChange={(e) => {
                  setSelectedDoctorId(
                    e.target.value
                  );
                  setErrorMessage("");
                }}
                className="h-12 w-full appearance-none rounded-full border border-gray-200 bg-[#fafafa] px-4 pr-10 text-xs text-gray-700 outline-none transition focus:border-[#3da449]"
              >
                {doctors.map(
                  (doctor) => (
                    <option
                      key={doctor.id}
                      value={doctor.id}
                    >
                      {doctor.name} -{" "}
                      {
                        doctor.qualification
                      }
                    </option>
                  )
                )}
              </select>

              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <ChevronDown />
              </div>
            </div>

            {/* Selected Doctor */}
            {selectedDoctor && (
              <div className="flex items-center gap-4 rounded-[22px] bg-[#f8f8f7] p-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
                  {selectedDoctor.image ? (
                    <Image
                      src={
                        selectedDoctor.image
                      }
                      alt={
                        selectedDoctor.name
                      }
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#151568] text-lg font-bold text-white">
                      {selectedDoctor.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#10105c]">
                    {
                      selectedDoctor.name
                    }
                  </h4>

                  <p className="text-[11px] text-gray-500">
                    {
                      selectedDoctor.qualification
                    }
                  </p>

                  {selectedDoctor.experience && (
                    <p className="text-[11px] text-gray-500">
                      {
                        selectedDoctor.experience
                      }
                    </p>
                  )}

                  {selectedDoctor.specialization && (
                    <p className="text-[11px] text-gray-500">
                      {
                        selectedDoctor.specialization
                      }
                    </p>
                  )}

                  <StarRating />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* =====================================================
          PATIENT FORM
          ===================================================== */}
      <form
        onSubmit={handleSubmit}
        className="mt-7"
      >
        <h3 className="mb-5 text-xl font-bold text-[#10105c]">
          Almost there...
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Full Name */}
          <div>
            <label className="mb-2 block text-[9px] font-semibold text-gray-600">
              FULL NAME
            </label>

            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(
                  e.target.value
                );
                setErrorMessage("");
              }}
              placeholder={
                form.namePlaceholder
              }
              className="h-11 w-full rounded-full border border-gray-200 bg-[#fafafa] px-4 text-xs text-gray-700 outline-none transition focus:border-[#3da449]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-[9px] font-semibold text-gray-600">
              EMAIL ADDRESS
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(
                  e.target.value
                );
                setErrorMessage("");
              }}
              placeholder={
                form.emailPlaceholder
              }
              className="h-11 w-full rounded-full border border-gray-200 bg-[#fafafa] px-4 text-xs text-gray-700 outline-none transition focus:border-[#3da449]"
            />
          </div>
        </div>

        {/* Concerns */}
        <div className="mt-4">
          <label className="mb-2 block text-[9px] font-semibold text-gray-600">
            BRIEFLY DESCRIBE YOUR CONCERNS
          </label>

          <textarea
            required
            value={concerns}
            onChange={(e) => {
              setConcerns(
                e.target.value
              );
              setErrorMessage("");
            }}
            placeholder={
              form.concernsPlaceholder
            }
            rows={4}
            className="w-full resize-none rounded-[20px] border border-gray-200 bg-[#fafafa] px-4 py-3 text-xs leading-5 text-gray-700 outline-none transition focus:border-[#3da449]"
          />
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Payment information */}
        <div className="mt-4 rounded-xl bg-[#f5f7ff] px-4 py-3 text-xs leading-5 text-[#151568]">
          <p className="font-semibold">
            Secure payment
          </p>

          <p className="mt-1 text-gray-600">
            After submitting your
            appointment request, you will
            be redirected to our secure
            payment page to complete your
            consultation payment.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex flex-col justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setName("");
              setEmail("");
              setConcerns("");
              setErrorMessage("");
            }}
            disabled={loading}
            className="h-11 rounded-xl bg-gray-100 px-10 text-sm font-bold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              loading ||
              slotsLoading ||
              doctors.length === 0 ||
              !selectedDoctorId ||
              !selectedSlotId
            }
            className="h-11 rounded-xl bg-[#3da449] px-8 text-sm font-bold text-white transition hover:bg-[#328d3e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating Payment..."
              : isAuthenticated
                ? "Continue to Payment"
                : "Login to Book Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}