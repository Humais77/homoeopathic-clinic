"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/auth/forgot-password",
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

      setMessage(
        data.message ||
          "If an account exists, a password reset email has been sent."
      );
    } catch {
      setMessage(
        "If an account exists, a password reset email has been sent."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-2xl font-bold text-center">
          Forgot Password?
        </h1>

        <p className="text-gray-500 text-center mt-2">
          Enter your email and we'll send
          you a password reset link.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          <input
            type="email"
            required
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Email Address"
            className="w-full px-4 py-3 border rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-green-600 text-white disabled:opacity-50"
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>

          {message && (
            <p className="text-sm text-gray-600 text-center">
              {message}
            </p>
          )}

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-green-600"
            >
              Back to Login
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}