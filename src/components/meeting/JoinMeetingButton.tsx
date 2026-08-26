"use client";

import {
  useEffect,
  useState,
} from "react";

type Props = {
  appointmentId: string;
  appointmentDate: string;
};

export function JoinMeetingButton({
  appointmentId,
  appointmentDate,
}: Props) {
  const [available, setAvailable] =
    useState(false);

  const [checking, setChecking] =
    useState(true);

  useEffect(() => {
    function checkAvailability() {
      const start =
        new Date(
          appointmentDate
        ).getTime();

      const now = Date.now();

      const earliest =
        start - 10 * 60 * 1000;

      const latest =
        start + 2 * 60 * 60 * 1000;

      setAvailable(
        now >= earliest &&
          now <= latest
      );

      setChecking(false);
    }

    checkAvailability();

    const interval =
      window.setInterval(
        checkAvailability,
        1000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [appointmentDate]);

  function join() {
    window.open(
      `/meeting/${appointmentId}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (checking) {
    return (
      <button
        disabled
        className="rounded-xl bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-500"
      >
        Checking...
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={!available}
      onClick={join}
      className="rounded-xl bg-[#3da449] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#328d3e] disabled:cursor-not-allowed disabled:bg-gray-300"
    >
      {available
        ? "Join Meeting"
        : "Available 10 min before"}
    </button>
  );
}