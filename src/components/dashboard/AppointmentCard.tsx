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

export function AppointmentCard({
  appointment,
}: Props) {
  const online =
    appointment.meetingType ===
      "VIDEO" ||
    appointment.meetingType ===
      "VOICE";

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3da449]">
            Upcoming Appointment
          </p>

          <h3 className="mt-1 text-xl font-bold text-[#10105c]">
            {appointment.doctor.name}
          </h3>

          <p className="text-sm text-gray-500">
            {appointment.doctor.qualification}
          </p>

          <div className="mt-4 space-y-1 text-sm text-gray-600">
            <p>
              <strong>Date:</strong>{" "}
              {new Date(
                appointment.appointmentDate
              ).toLocaleDateString()}
            </p>

            <p>
              <strong>Time:</strong>{" "}
              {appointment.appointmentTime}
            </p>

            <p>
              <strong>Type:</strong>{" "}
              {appointment.meetingType}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {appointment.status}
            </p>
          </div>
        </div>

        {online &&
          appointment.status ===
            "CONFIRMED" && (
            <JoinMeetingButton
              appointmentId={
                appointment.id
              }
              appointmentDate={
                appointment.appointmentDate
              }
            />
          )}
      </div>
    </article>
  );
}