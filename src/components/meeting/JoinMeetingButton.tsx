"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
};

function getAppointmentDateTime(
  appointmentDate: string,
  appointmentTime: string
) {
  const date = new Date(appointmentDate);

  // appointmentDate is stored as UTC midnight.
  // appointmentTime is the actual local appointment time.
  //
  // Build the appointment datetime in the user's local timezone.
  const [hours, minutes] = appointmentTime.split(":").map(Number);

  date.setHours(hours, minutes, 0, 0);

  return date;
}

export function JoinMeetingButton({
  appointmentId,
  appointmentDate,
  appointmentTime,
}: Props) {
  const appointmentDateTime = useMemo(
    () => getAppointmentDateTime(appointmentDate, appointmentTime),
    [appointmentDate, appointmentTime]
  );

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const diffMs = appointmentDateTime.getTime() - now.getTime();

  const TEN_MINUTES = 10 * 60 * 1000;
  const TWO_HOURS = 2 * 60 * 60 * 1000;

  const canJoin =
    diffMs <= TEN_MINUTES && diffMs >= -TWO_HOURS;

  const minutesUntil = Math.ceil(diffMs / (60 * 1000));

  const handleJoin = () => {
    window.open(
      `/meeting/${appointmentId}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (canJoin) {
    return (
      <button
        type="button"
        onClick={handleJoin}
        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
      >
        <span>🎥</span>
        Join Meeting
      </button>
    );
  }

  if (diffMs > TEN_MINUTES) {
    return (
      <span className="text-xs text-gray-500">
        Available {Math.max(1, minutesUntil - 10)} min before
      </span>
    );
  }

  return (
    <span className="text-xs text-gray-500">
      Meeting window ended
    </span>
  );
}