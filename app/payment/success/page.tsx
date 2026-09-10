"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();

  const tracker = searchParams.get("tracker");

  const [status, setStatus] = useState(
    "We're verifying your payment..."
  );

  useEffect(() => {
    let cancelled = false;

    async function checkPayment() {
      if (!tracker) {
        setStatus(
          "Payment information could not be found."
        );
        return;
      }

      for (let i = 0; i < 10; i++) {
        try {
          const response = await fetch(
            `/api/payments/status?tracker=${encodeURIComponent(
              tracker
            )}`,
            {
              cache: "no-store",
            }
          );

          const data = await response.json();

          if (cancelled) return;

          if (data.status === "PAID") {
            setStatus(
              "Payment successful. Your appointment is now awaiting clinic confirmation."
            );
            return;
          }

          if (data.status === "FAILED") {
            setStatus(
              "Payment failed. Please try again."
            );
            return;
          }
        } catch {
          // Continue polling.
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 2000)
        );
      }

      if (!cancelled) {
        setStatus(
          "Your payment is still being verified. Please check your appointments shortly."
        );
      }
    }

    checkPayment();

    return () => {
      cancelled = true;
    };
  }, [tracker]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">
            ✓
          </div>

          <h1 className="text-2xl font-bold">
            Payment Received
          </h1>

          <p className="mt-4 text-gray-600">
            {status}
          </p>

          <Link
            href="/appointments"
            className="mt-6 inline-flex rounded-lg bg-black px-5 py-3 text-white"
          >
            View My Appointments
          </Link>
        </div>
      </div>
    </main>
  );
}