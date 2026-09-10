import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">
            !
          </div>

          <h1 className="text-2xl font-bold">
            Payment Cancelled
          </h1>

          <p className="mt-4 text-gray-600">
            Your payment was cancelled. Your appointment
            has not been confirmed.
          </p>

          <Link
            href="/appointments"
            className="mt-6 inline-flex rounded-lg bg-black px-5 py-3 text-white"
          >
            Back to Appointments
          </Link>
        </div>
      </div>
    </main>
  );
}