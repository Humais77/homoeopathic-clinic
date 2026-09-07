"use client";

import { useState } from "react";

import {
  JoinMeetingButton,
} from "@/src/components/meeting/JoinMeetingButton";

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

  onAppointmentUpdated?: () => void;
};

export function AppointmentCard({
  appointment,
  onAppointmentUpdated,
}: Props) {
  const [loadingAction, setLoadingAction] =
    useState<
      "cancel" | "remove" | null
    >(null);

  const status =
    appointment.status.toUpperCase();

  const online =
    appointment.meetingType ===
      "VIDEO" ||
    appointment.meetingType ===
      "VOICE";

  const canCancel =
    status === "PENDING" ||
    status === "CONFIRMED";

  const canRemove =
    status === "CANCELLED" ||
    status === "COMPLETED" ||
    status === "NO_SHOW";

  async function cancelAppointment() {
    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this appointment?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingAction("cancel");

      const response =
        await fetch(
          `/api/user/appointments/${appointment.id}/cancel`,
          {
            method: "POST",
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to cancel appointment."
        );
      }

      alert(
        "Appointment cancelled successfully."
      );

      onAppointmentUpdated?.();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to cancel appointment."
      );
    } finally {
      setLoadingAction(null);
    }
  }

  async function removeAppointment() {
    const confirmed =
      window.confirm(
        "Remove this appointment from your dashboard?\n\nThe appointment will not be permanently deleted. The clinic will still have the appointment record."
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingAction("remove");

      const response =
        await fetch(
          `/api/user/appointments/${appointment.id}/remove`,
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
            "Unable to remove appointment."
        );
      }

      onAppointmentUpdated?.();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to remove appointment."
      );
    } finally {
      setLoadingAction(null);
    }
  }

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
                    : status === "COMPLETED"
                      ? "bg-blue-100 text-blue-700"
                      : status === "NO_SHOW"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {status.replace("_", " ")}
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
              ).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>

            <p>
              <strong>Time:</strong>{" "}
              {appointment.appointmentTime}
            </p>

            <p>
              <strong>Type:</strong>{" "}
              {appointment.meetingType ===
              "VIDEO"
                ? "Video Call"
                : appointment.meetingType ===
                    "VOICE"
                  ? "Voice Call"
                  : "Clinic Visit"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Join meeting */}
          {online &&
            status === "CONFIRMED" && (
              <JoinMeetingButton
                appointmentId={
                  appointment.id
                }
                appointmentDate={
                  appointment.appointmentDate
                }
                 appointmentTime={appointment.appointmentTime}
              />
            )}

          {/* Cancel */}
          {canCancel && (
            <button
              type="button"
              onClick={
                cancelAppointment
              }
              disabled={
                loadingAction !== null
              }
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingAction ===
              "cancel"
                ? "Cancelling..."
                : "Cancel Appointment"}
            </button>
          )}

          {/* Remove from dashboard */}
          {canRemove && (
            <button
              type="button"
              onClick={
                removeAppointment
              }
              disabled={
                loadingAction !== null
              }
              className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingAction ===
              "remove"
                ? "Removing..."
                : "Remove from Dashboard"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}