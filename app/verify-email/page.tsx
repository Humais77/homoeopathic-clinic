"use client";

import { useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const token =
    searchParams.get("token");

  const email =
    searchParams.get("email");

  const [status, setStatus] =
    useState<
      "checking" | "success" | "error" | "waiting"
    >("waiting");

  const [message, setMessage] =
    useState("");

  const [resending, setResending] =
    useState(false);

  const [resendMessage, setResendMessage] =
    useState("");

  useEffect(() => {
    if (!token) return;

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    setStatus("checking");

    try {
      const response =
        await fetch(
          "/api/auth/verify-email",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              token,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setStatus("error");

        setMessage(
          data.error ||
            "Verification failed."
        );

        return;
      }

      setStatus("success");

      setMessage(
        "Your email has been verified successfully."
      );

      setTimeout(() => {
        window.location.replace(
          "/login?verified=true"
        );
      }, 1800);
    } catch {
      setStatus("error");

      setMessage(
        "Something went wrong."
      );
    }
  };

  const resendEmail = async () => {
    if (!email) {
      setResendMessage(
        "Please return to registration and enter your email."
      );

      return;
    }

    setResending(true);
    setResendMessage("");

    try {
      const response =
        await fetch(
          "/api/auth/resend-verification",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setResendMessage(
          data.error ||
            "Unable to resend email."
        );

        return;
      }

      setResendMessage(
        "A new verification email has been sent."
      );
    } catch {
      setResendMessage(
        "Unable to send verification email."
      );
    } finally {
      setResending(false);
    }
  };

  /*
   * Token verification mode
   */
  if (token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">

          {status === "checking" && (
            <>
              <div className="w-14 h-14 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />

              <h1 className="text-2xl font-bold mt-6">
                Verifying your email
              </h1>

              <p className="text-gray-500 mt-2">
                Please wait...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">

                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>

              </div>

              <h1 className="text-2xl font-bold mt-6">
                Email Verified!
              </h1>

              <p className="text-gray-500 mt-2">
                {message}
              </p>

              <p className="text-sm text-gray-400 mt-5">
                Redirecting to login...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">

                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>

              </div>

              <h1 className="text-2xl font-bold mt-6">
                Verification Failed
              </h1>

              <p className="text-gray-500 mt-2">
                {message}
              </p>

              <button
                onClick={() =>
                  router.replace(
                    "/login"
                  )
                }
                className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Go to Login
              </button>
            </>
          )}

        </div>

      </div>
    );
  }

  /*
   * Waiting for email mode
   */
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">

        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">

          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>

        </div>

        <h1 className="text-2xl font-bold text-gray-900 mt-6">
          Check your email
        </h1>

        <p className="text-gray-500 mt-3">
          We sent a verification link to:
        </p>

        {email && (
          <p className="font-medium text-gray-900 mt-2 break-all">
            {email}
          </p>
        )}

        <p className="text-sm text-gray-500 mt-4">
          Click the verification link in your email
          to activate your account.
        </p>

        <button
          onClick={resendEmail}
          disabled={resending}
          className="w-full mt-7 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {resending
            ? "Sending..."
            : "Resend Verification Email"}
        </button>

        {resendMessage && (
          <p className="text-sm text-gray-600 mt-4">
            {resendMessage}
          </p>
        )}

        <button
          onClick={() =>
            router.replace("/login")
          }
          className="mt-5 text-sm text-green-600 hover:text-green-700"
        >
          Back to Login
        </button>

      </div>

    </div>
  );
}