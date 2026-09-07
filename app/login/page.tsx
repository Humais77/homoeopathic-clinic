"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { login, user, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = searchParams.get("reset");

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

  function getSafeClientRedirect(value: string | null) {
    if (!value) return null;

    if (!value.startsWith("/")) {
      return null;
    }

    if (value.startsWith("//")) {
      return null;
    }

    if (value.includes("://")) {
      return null;
    }

    return value;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await login(email, password);

      if (!result.success) {
        throw new Error(result.message || "Login failed");
      }

      const loggedInUser = result.user;

      if (!loggedInUser) {
        throw new Error(
          "Login successful but user information was not returned."
        );
      }

      const redirect = getSafeClientRedirect(
        searchParams.get("redirect")
      );

      if (loggedInUser.role === "ADMIN") {
        router.replace(redirect || "/admin/dashboard");
      } else if (loggedInUser.role === "DOCTOR") {
        router.replace(redirect || "/doctor/dashboard");
      } else {
        router.replace(redirect || "/user/dashboard");
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/image.png')",
        }}
      />

      <div className="absolute inset-0 bg-blue-950/45" />

      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/55 via-blue-950/25 to-transparent" />

      <div className="relative z-10 flex min-h-screen items-center">
        <div className="container mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="text-center text-white lg:text-left">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-green-300 sm:text-base">
                The Natural Way To Better Health
              </p>

              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Natural Healing.
                <br />
                <span className="text-white">Trusted Care.</span>
                <br />
                <span className="text-green-400">Better Health.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-100 sm:text-lg lg:mx-0">
                Welcome to Heal By Nature. Experience personalized
                homeopathic care designed around your individual needs
                and your body's natural healing process.
              </p>

              <div className="mx-auto mt-7 h-1 w-16 rounded-full bg-green-500 lg:mx-0" />

              <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-gray-200 sm:text-base lg:mx-0">
                Sign in to access your account, manage your appointments,
                view your treatment information, and stay connected with
                your healthcare journey.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-7 lg:justify-start">
                <div>
                  <p className="text-2xl font-bold text-white">500+</p>
                  <p className="text-xs uppercase tracking-wide text-gray-200">
                    Happy Patients
                  </p>
                </div>

                <div className="hidden h-10 w-px bg-white/30 sm:block" />

                <div>
                  <p className="text-2xl font-bold text-white">10+</p>
                  <p className="text-xs uppercase tracking-wide text-gray-200">
                    Years Experience
                  </p>
                </div>

                <div className="hidden h-10 w-px bg-white/30 sm:block" />

                <div>
                  <p className="text-2xl font-bold text-white">95%</p>
                  <p className="text-xs uppercase tracking-wide text-gray-200">
                    Satisfaction
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8 lg:p-9">
                <div className="mb-7">
                  <p className="mb-2 text-sm font-semibold text-green-600">
                    Welcome Back
                  </p>

                  <h2 className="text-3xl font-bold text-blue-950">
                    Sign In
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Sign in to your Heal By Nature account to continue.
                  </p>
                </div>

                {reset === "true" && (
                  <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm leading-relaxed text-green-700">
                    Your password has been reset successfully.
                    You can now sign in.
                  </div>
                )}

                {error && (
                  <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        Password
                      </label>

                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-green-600 transition hover:text-green-700"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-green-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                <div className="relative my-7">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>

                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-gray-400">
                      New to Heal By Nature?
                    </span>
                  </div>
                </div>

                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-blue-950 px-4 py-3 text-sm font-semibold text-blue-950 transition-all duration-200 hover:bg-blue-950 hover:text-white"
                >
                  Create an Account
                </Link>

                <p className="mt-6 text-center text-xs leading-relaxed text-gray-400">
                  Your information is kept secure and private.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}