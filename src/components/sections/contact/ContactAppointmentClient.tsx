"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useContactBooking } from "./ContactBookingProvider";
import type { MeetingType as BookingMeetingType } from "./ContactBookingProvider";
type MeetingType = {
  id: string;
  title: string;
  description: string;
  type: string;
};

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
type Props = {
  meetingTypes: MeetingOption[];
  doctors: Doctor[];
  slots: string[];
  form: FormData;
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
function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-9 w-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
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

export function ContactAppointmentClient({
  meetingTypes,
  doctors,
  slots,
  form,
   isAuthenticated,
}: Props) {
  const {
  meetingType,
  setMeetingType,
  connectionMethod,
} = useContactBooking();

  const [selectedDoctorId, setSelectedDoctorId] = useState(
    doctors[0]?.id || ""
  );

  const selectedDoctor = doctors.find(
    (doctor) => doctor.id === selectedDoctorId
  );

  const [selectedDate, setSelectedDate] = useState(10);

  const [selectedSlot, setSelectedSlot] = useState(
    slots[0] || ""
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [concerns, setConcerns] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
const [calendarDate, setCalendarDate] =
  useState(() => new Date());
  /*
   * Calendar
   */
  const calendarYear =
  calendarDate.getFullYear();

const calendarMonth =
  calendarDate.getMonth();
  const days = useMemo(() => {
  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();

  const firstDay = new Date(
    Date.UTC(year, month, 1)
  ).getUTCDay();

  const totalDays = new Date(
    Date.UTC(year, month + 1, 0)
  ).getUTCDate();

  const previousMonthDays =
    new Date(
      Date.UTC(year, month, 0)
    ).getUTCDate();

  const result: {
    day: number;
    currentMonth: boolean;
  }[] = [];

  for (
    let i = firstDay - 1;
    i >= 0;
    i--
  ) {
    result.push({
      day:
        previousMonthDays - i,
      currentMonth: false,
    });
  }

  for (
    let day = 1;
    day <= totalDays;
    day++
  ) {
    result.push({
      day,
      currentMonth: true,
    });
  }

  let nextMonthDay = 1;

  while (result.length < 42) {
    result.push({
      day: nextMonthDay,
      currentMonth: false,
    });

    nextMonthDay++;
  }

  return result;
}, [calendarDate]);
  function createAppointmentDate(
  year: number,
  month: number,
  day: number,
  time: string
) {
  const [timePart, modifier] = time.split(" ");

  let [hours, minutes] = timePart
    .split(":")
    .map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return new Date(
    year,
    month,
    day,
    hours,
    minutes,
    0,
    0
  ).toISOString();
}
  /*
   * Submit appointment
   */
  async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault();
if (!isAuthenticated) {
    window.location.href =
      "/login?redirect=/contact";
    return;
  }
  setSubmitted(false);

  if (!selectedDoctorId) {
    alert("Please select a specialist.");
    return;
  }

  if (!selectedSlot) {
    alert("Please select an available time slot.");
    return;
  }

  setLoading(true);

  try {
   const appointmentDate = createAppointmentDate(
  calendarYear,
  calendarMonth,
  selectedDate,
  selectedSlot
);

    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
     body: JSON.stringify({
  name: name.trim(),
  email: email.trim(),
  meetingType,
  connectionMethod:
    meetingType === "clinic"
      ? null
      : connectionMethod,
  appointmentDate,
  appointmentTime: selectedSlot,
  concerns: concerns.trim(),
  doctorId: selectedDoctorId,
}),
    });

    // Handle non-JSON responses
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("JSON parse error:", jsonError);
      throw new Error(
        "Server returned an invalid response. Please try again."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to book appointment"
      );
    }

    setSubmitted(true);

    // Clear patient form
    setName("");
    setEmail("");
    setConcerns("");

    console.log("Appointment created:", data.appointment);
  } catch (error) {
    console.error("Appointment booking error:", error);

    alert(
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
        {meetingTypes.map((type) => {
          const selected = meetingType === type.id;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                setMeetingType(type.id);
                setSubmitted(false);
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
               {type.type === "clinic" ? (
  <ClinicIcon />
) : type.type === "video" ? (
  <VideoIcon />
) : (
  <PhoneIcon />
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
  onClick={() => {
    setCalendarDate(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1
        )
    );

    setSelectedDate(1);
    setSubmitted(false);
  }}
  className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-400"
>
  <ChevronLeft />
</button>

<button
  type="button"
  onClick={() => {
    setCalendarDate(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1
        )
    );

    setSelectedDate(1);
    setSubmitted(false);
  }}
  className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-400"
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

              {days.map((item, index) => {
                const selected =
                  item.currentMonth &&
                  item.day === selectedDate;

                return (
                  <button
                    key={`${item.day}-${index}`}
                    type="button"
                    disabled={!item.currentMonth}
                    onClick={() => {
                      if (item.currentMonth) {
                        setSelectedDate(item.day);
                        setSubmitted(false);
                      }
                    }}
                    className={`flex h-9 items-center justify-center rounded-lg text-xs transition ${
                      selected
                        ? "bg-[#151568] font-bold text-white"
                        : item.currentMonth
                          ? "text-gray-700 hover:bg-gray-100"
                          : "text-gray-300"
                    }`}
                  >
                    {item.day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Available Slots */}

          <div className="rounded-[20px] bg-[#3da449] p-4">
            <h4 className="mb-3 text-center text-sm font-bold text-white">
              Available Slots
            </h4>

            {slots.length === 0 ? (
              <p className="py-4 text-center text-xs text-white/80">
                No slots available.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {slots.map((slot) => {
                  const selected =
                    selectedSlot === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setSelectedSlot(slot);
                        setSubmitted(false);
                      }}
                      className={`rounded-full border px-3 py-2 text-[10px] font-medium transition ${
                        selected
                          ? "border-white bg-white text-[#151568]"
                          : "border-white/70 text-white hover:bg-white/10"
                      }`}
                    >
                      {slot}
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
            No specialists are currently available.
          </div>
        ) : (
          <>
            {/* Doctor Dropdown */}

            <div className="relative mb-3">
              <select
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  setSubmitted(false);
                }}
                className="h-12 w-full appearance-none rounded-full border border-gray-200 bg-[#fafafa] px-4 pr-10 text-xs text-gray-700 outline-none focus:border-[#3da449]"
              >
                {doctors.map((doctor) => (
                  <option
                    key={doctor.id}
                    value={doctor.id}
                  >
                    {doctor.name} -{" "}
                    {doctor.qualification}
                  </option>
                ))}
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
                      src={selectedDoctor.image}
                      alt={selectedDoctor.name}
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
                    {selectedDoctor.name}
                  </h4>

                  <p className="text-[11px] text-gray-500">
                    {selectedDoctor.qualification}
                  </p>

                  {selectedDoctor.experience && (
                    <p className="text-[11px] text-gray-500">
                      {selectedDoctor.experience}
                    </p>
                  )}

                  {selectedDoctor.specialization && (
                    <p className="text-[11px] text-gray-500">
                      {selectedDoctor.specialization}
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
                setName(e.target.value);
                setSubmitted(false);
              }}
              placeholder={form.namePlaceholder}
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
                setEmail(e.target.value);
                setSubmitted(false);
              }}
              placeholder={form.emailPlaceholder}
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
              setConcerns(e.target.value);
              setSubmitted(false);
            }}
            placeholder={form.concernsPlaceholder}
            rows={4}
            className="w-full resize-none rounded-[20px] border border-gray-200 bg-[#fafafa] px-4 py-3 text-xs leading-5 text-gray-700 outline-none transition focus:border-[#3da449]"
          />
        </div>

        {/* Success Message */}

        {submitted && (
          <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            Your appointment request has been received.
            We will contact you shortly.
          </div>
        )}

        {/* Buttons */}

        <div className="mt-5 flex flex-col justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setName("");
              setEmail("");
              setConcerns("");
              setSubmitted(false);
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
    doctors.length === 0 ||
    !selectedDoctorId ||
    !selectedSlot
  }
            className="h-11 rounded-xl bg-[#3da449] px-8 text-sm font-bold text-white transition hover:bg-[#328d3e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
  ? "Booking..."
  : isAuthenticated
    ? "Book Appointment"
    : "Login to Book Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}