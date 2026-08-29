"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    login,
    user,
    isLoading: authLoading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verified = searchParams.get("verified");

  /*
   * Redirect already authenticated users
   * to the correct dashboard based on role.
   */
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      if (user.role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else if (user.role === "DOCTOR") {
        router.replace("/doctor/dashboard");
      } else {
        router.replace("/user/dashboard");
      }
    }
  }, [user, authLoading, router]);

  /*
   * Login
   */
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await login(email, password);

      /*
       * login() returns:
       *
       * {
       *   success: boolean;
       *   message?: string;
       *   user?: AuthUser;
       * }
       */

      if (!result.success) {
        throw new Error(
          result.message || "Login failed"
        );
      }

      /*
       * IMPORTANT:
       * Do not use result.role.
       *
       * The role is inside result.user.
       */
      const loggedInUser = result.user;

      if (!loggedInUser) {
        throw new Error(
          "Login successful but user information was not returned."
        );
      }

      /*
       * Redirect according to role.
       */
      const redirect =
        searchParams.get("redirect");

      if (loggedInUser.role === "ADMIN") {
        router.replace(
          redirect || "/admin/dashboard"
        );
      } else if (
        loggedInUser.role === "DOCTOR"
      ) {
        router.replace(
          redirect || "/doctor/dashboard"
        );
      } else {
        router.replace(
          redirect || "/user/dashboard"
        );
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Loading state
   */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /*
   * If already logged in, don't show login form
   */
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">

        {/* Header */}
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign In
          </h2>

          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your Heal By Nature account
          </p>
        </div>

        {/* Verification message */}
        {verified === "true" && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            Your email has been verified successfully.
            You can now sign in.
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

          {/* Register */}
          <div className="text-center">
            <Link
              href="/register"
              className="text-sm text-green-600 hover:text-green-500"
            >
              Don't have an account? Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
