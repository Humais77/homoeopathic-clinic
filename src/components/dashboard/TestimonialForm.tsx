"use client";

import { useState } from "react";

type TestimonialFormProps = {
    appointmentId: string;
    doctorName: string;
    onSuccess?: () => void;
    onCancel?: () => void;
};

export function TestimonialForm({
    appointmentId,
    doctorName,
    onSuccess,
    onCancel,
}: TestimonialFormProps) {
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();


        setError("");
        setSuccess("");

        const trimmedFeedback = feedback.trim();

        if (trimmedFeedback.length < 10) {
            setError("Please write at least 10 characters.");
            return;
        }

        if (trimmedFeedback.length > 1000) {
            setError("Feedback cannot exceed 1000 characters.");
            return;
        }

        if (rating < 1 || rating > 5) {
            setError("Please select a rating between 1 and 5 stars.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/user/testimonials", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    appointmentId,
                    rating,
                    feedback: trimmedFeedback,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to submit feedback."
                );
            }

            setSuccess(
                "Thank you! Your feedback has been submitted and is awaiting review."
            );

            setFeedback("");
            setRating(5);

            onSuccess?.();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to submit feedback."
            );
        } finally {
            setLoading(false);
        }


    }

    return (<div className="mt-4 rounded-2xl border border-green-100 bg-green-50/50 p-5"> <div className="mb-4"> <h4 className="text-lg font-semibold text-gray-900">
        Leave Feedback </h4>


        <p className="mt-1 text-sm text-gray-500">
            Share your experience with {doctorName}.
        </p>

        <p className="mt-2 text-xs text-gray-500">
            Your name is automatically taken from your account.
        </p>
    </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Rating */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Your Rating
                </label>

                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            disabled={loading}
                            className={`text-3xl transition disabled:cursor-not-allowed ${star <= rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                            aria-label={`${star} star${star > 1 ? "s" : ""
                                }`}
                            aria-pressed={star === rating}
                        >
                            ★
                        </button>
                    ))}
                </div>

                <p className="mt-1 text-xs text-gray-500">
                    {rating} out of 5 stars
                </p>
            </div>

            {/* Feedback */}
            <div>
                <label
                    htmlFor={`feedback-${appointmentId}`}
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Your Feedback
                </label>

                <textarea
                    id={`feedback-${appointmentId}`}
                    value={feedback}
                    onChange={(event) =>
                        setFeedback(event.target.value)
                    }
                    rows={5}
                    maxLength={1000}
                    disabled={loading}
                    placeholder="Tell us about your experience..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                <div className="mt-1 text-right text-xs text-gray-400">
                    {feedback.length}/1000
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Success */}
            {success && (
                <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-[#3da449] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Submitting..." : "Submit Feedback"}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <p className="text-xs text-gray-500">
                Only patients with a completed appointment can submit
                feedback. Your feedback will be reviewed by our team
                before it appears publicly.
            </p>
        </form>
    </div>


    );
}
