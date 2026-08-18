"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type MeetingType = {
  id: string;
  title: string;
  description: string;
  type: string;
};

type Specialist = {
  name: string;
  qualification: string;
  experience: string;
  image: string;
};

type FormData = {
  namePlaceholder: string;
  emailPlaceholder: string;
  concernsPlaceholder: string;
};

type Props = {
  meetingTypes: MeetingType[];
  specialist: Specialist;
  slots: string[];
  form: FormData;
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

export function ContactAppointmentClient({
  meetingTypes,
  specialist,
  slots,
  form,
}: Props) {
  const [meetingType, setMeetingType] = useState("clinic");
  const [selectedDate, setSelectedDate] = useState(10);
  const [selectedSlot, setSelectedSlot] = useState("11:45 AM");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [concerns, setConcerns] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const days = useMemo(() => {
    const year = 2026;
    const month = 7;

    const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const totalDays = new Date(
      Date.UTC(year, month + 1, 0)
    ).getUTCDate();

    const previousMonthDays = new Date(
      Date.UTC(year, month, 0)
    ).getUTCDate();

    const result: {
      day: number;
      currentMonth: boolean;
    }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({
        day: previousMonthDays - i,
        currentMonth: false,
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      result.push({
        day,
        currentMonth: true,
      });
    }

    while (result.length < 42) {
      result.push({
        day: result.length - totalDays - firstDay + 1,
        currentMonth: false,
      });
    }

    return result;
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubmitted(true);

    // Connect your API / database here.
    console.log({
      meetingType,
      selectedDate,
      selectedSlot,
      name,
      email,
      concerns,
    });
  }

  return (
    <div>
      {/* Meeting Types */}
      <div className="grid gap-4 md:grid-cols-2">
        {meetingTypes.map((type) => {
          const selected = meetingType === type.id;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setMeetingType(type.id)}
              className={`rounded-[20px] border-2 p-5 text-left transition-all md:min-h-[152px] ${
                selected
                  ? "border-[#151568] bg-[#151568] text-white"
                  : "border-[#151568] bg-[#f8f8fa] text-[#151568]"
              }`}
            >
              <div
                className={`mb-2 ${
                  selected ? "text-white" : "text-[#151568]"
                }`}
              >
                {type.type === "clinic" ? (
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
                  selected ? "text-white/75" : "text-gray-500"
                }`}
              >
                {type.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Calendar + Slots */}
      <div className="mt-6">
        <h3 className="mb-4 text-xl font-bold text-[#10105c]">
          Select your preferred time
        </h3>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          {/* Calendar */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-700">
                August 2026
              </h4>

              <div className="flex gap-1">
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-400"
                >
                  <ChevronLeft />
                </button>

                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-400"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="pb-2 text-center text-[10px] font-semibold text-gray-600"
                >
                  {day}
                </div>
              ))}

              {days.map((item, index) => {
                const selected =
                  item.currentMonth && item.day === selectedDate;

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

            <div className="grid grid-cols-2 gap-3">
              {slots.map((slot, index) => {
                const selected =
                  selectedSlot === slot && index === 1;

                return (
                  <button
                    key={`${slot}-${index}`}
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
          </div>
        </div>
      </div>

      {/* Specialist */}
      <div className="mt-6">
        <h3 className="mb-4 text-xl font-bold text-[#10105c]">
          Choose your specialist
        </h3>

        <div className="mb-3 flex items-center justify-between rounded-full border border-gray-200 bg-[#fafafa] px-4 py-3">
          <span className="text-xs text-gray-600">
            {specialist.name} - {specialist.qualification}
          </span>

          <ChevronDown />
        </div>

        <div className="flex items-center gap-4 rounded-[22px] bg-[#f8f8f7] p-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
            <Image
              src={specialist.image}
              alt={specialist.name}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#10105c]">
              {specialist.name}
            </h4>

            <p className="text-[11px] text-gray-500">
              {specialist.experience}
            </p>

            <StarRating />
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-7">
        <h3 className="mb-5 text-xl font-bold text-[#10105c]">
          Almost there...
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
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

        {submitted && (
          <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            Your appointment request has been received. We will contact you
            shortly.
          </div>
        )}

        <div className="mt-5 flex flex-col justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setName("");
              setEmail("");
              setConcerns("");
              setSubmitted(false);
            }}
            className="h-11 rounded-xl bg-gray-100 px-10 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="h-11 rounded-xl bg-[#3da449] px-8 text-sm font-bold text-white transition hover:bg-[#328d3e]"
          >
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
}