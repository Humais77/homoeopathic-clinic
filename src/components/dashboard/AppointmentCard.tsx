"use client";

import { useState } from "react";
import { JoinMeetingButton } from "@/src/components/meeting/JoinMeetingButton";
import { TestimonialForm } from "./TestimonialForm";

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

testimonial?: {
  id: string;
  rating: number;
  feedback: string;
  status: "PENDING" | "PUBLISHED" | "REJECTED";
  createdAt: string;
} | null;


};

onAppointmentUpdated?: () => void;
};

export function AppointmentCard({
appointment,
onAppointmentUpdated,
}: Props) {
const [loadingAction, setLoadingAction] = useState<
"cancel" | "remove" | null

> (null);

const [showFeedback, setShowFeedback] = useState(false);

const status = appointment.status.toUpperCase();

const online =
appointment.meetingType === "VIDEO" ||
appointment.meetingType === "VOICE";

const canCancel =
status === "PENDING" || status === "CONFIRMED";

const canRemove =
status === "CANCELLED" ||
status === "COMPLETED" ||
status === "NO_SHOW";

const hasTestimonial = Boolean(appointment.testimonial);

const canGiveFeedback =
status === "COMPLETED" && !hasTestimonial;

async function cancelAppointment() {
const confirmed = window.confirm(
"Are you sure you want to cancel this appointment?"
);


if (!confirmed) return;

try {
  setLoadingAction("cancel");

  const response = await fetch(
    `/api/user/appointments/${appointment.id}/cancel`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to cancel appointment."
    );
  }

  alert("Appointment cancelled successfully.");

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
const confirmed = window.confirm(
"Remove this appointment from your dashboard?\n\nThe appointment will not be permanently deleted. The clinic will still have the appointment record."
);


if (!confirmed) return;

try {
  setLoadingAction("remove");

  const response = await fetch(
    `/api/user/appointments/${appointment.id}/remove`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to remove appointment."
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

return ( <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"> <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"> <div className="flex-1"> <div className="flex flex-wrap items-center gap-2"> <p className="text-xs font-semibold uppercase tracking-wide text-[#3da449]">
Appointment </p>


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
          {appointment.meetingType === "VIDEO"
            ? "Video Call"
            : appointment.meetingType === "VOICE"
              ? "Voice Call"
              : "Clinic Visit"}
        </p>
      </div>

      {appointment.testimonial && (
        <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-800">
              Your Feedback
            </p>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-green-700">
              {appointment.testimonial.status === "PUBLISHED"
                ? "Published"
                : appointment.testimonial.status === "REJECTED"
                  ? "Rejected"
                  : "Under Review"}
            </span>
          </div>

          <div className="mt-2 text-yellow-400">
            {"★".repeat(appointment.testimonial.rating)}
            <span className="text-gray-300">
              {"★".repeat(
                5 - appointment.testimonial.rating
              )}
            </span>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {appointment.testimonial.feedback}
          </p>
        </div>
      )}
    </div>

    <div className="flex flex-wrap items-center gap-2">
      {online && status === "CONFIRMED" && (
        <JoinMeetingButton
          appointmentId={appointment.id}
          appointmentDate={appointment.appointmentDate}
          appointmentTime={appointment.appointmentTime}
        />
      )}

      {canCancel && (
        <button
          type="button"
          onClick={cancelAppointment}
          disabled={loadingAction !== null}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingAction === "cancel"
            ? "Cancelling..."
            : "Cancel Appointment"}
        </button>
      )}

      {canGiveFeedback && (
        <button
          type="button"
          onClick={() =>
            setShowFeedback((current) => !current)
          }
          className="rounded-lg bg-[#3da449] px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
        >
          {showFeedback
            ? "Close Feedback"
            : "Give Feedback"}
        </button>
      )}

      {canRemove && (
        <button
          type="button"
          onClick={removeAppointment}
          disabled={loadingAction !== null}
          className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingAction === "remove"
            ? "Removing..."
            : "Remove from Dashboard"}
        </button>
      )}
    </div>
  </div>

  {showFeedback && canGiveFeedback && (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <TestimonialForm
        appointmentId={appointment.id}
        doctorName={appointment.doctor.name}
        onSuccess={() => {
          setShowFeedback(false);
          onAppointmentUpdated?.();
        }}
      />
    </div>
  )}
</article>


);
}
