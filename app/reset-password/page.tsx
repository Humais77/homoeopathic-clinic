"use client";

import {
  useSearchParams,
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

export default function ResetPasswordPage() {
  const searchParams =
    useSearchParams();

  const router = useRouter();

  const token =
    searchParams.get("token");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError(
        "Invalid password reset link."
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/auth/reset-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              token,
              password,
              confirmPassword,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to reset password."
        );

        return;
      }

      setMessage(
        "Password reset successfully. Redirecting to login..."
      );

      setTimeout(() => {
        router.replace(
          "/login?reset=true"
        );
      }, 1500);
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-2xl font-bold text-center">
          Reset Password
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="New Password"
            className="w-full px-4 py-3 border rounded-lg"
          />

          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            placeholder="Confirm Password"
            className="w-full px-4 py-3 border rounded-lg"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-green-600 text-white disabled:opacity-50"
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>
      </div>
    </div>
  );
}