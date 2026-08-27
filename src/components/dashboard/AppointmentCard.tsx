"use client";

import { JoinMeetingButton } from "@/src/components/meeting/JoinMeetingButton";

type Props = {
  appointment: {
    id: string;
    name: string;
    appointmentDate: string;
    appointmentTime: string;
    meetingType: string;
    status: string;
    doctor: {
      name: string;
      qualification: string;
    };
  };
};

export function AppointmentCard({ appointment }: Props) {
  const online =
    appointment.meetingType === "VIDEO" ||
    appointment.meetingType === "VOICE";

  const status = appointment.status.toUpperCase();

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#3da449]">
              Appointment
            </p>

            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                status === "CONFIRMED"
                  ? "bg-green-100 text-green-700"
                  : status === "CANCELLED"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {status}
            </span>
          </div>

          <h3 className="mt-2 text-xl font-bold text-[#10105c]">
            {appointment.doctor.name}
          </h3>

          <p className="text-sm text-gray-500">
            {appointment.doctor.qualification}
          </p>

          <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
            <p>
              <strong>Date:</strong>{" "}
              {new Date(
                appointment.appointmentDate
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <p>
              <strong>Time:</strong>{" "}
              {appointment.appointmentTime}
            </p>

            <p>
              <strong>Type:</strong>{" "}
              {appointment.meetingType}
            </p>
          </div>
        </div>

        {online && status === "CONFIRMED" && (
          <JoinMeetingButton
            appointmentId={appointment.id}
            appointmentDate={appointment.appointmentDate}
          />
        )}
      </div>
    </article>
  );
}