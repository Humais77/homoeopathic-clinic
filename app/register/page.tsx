"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    user,
    isLoading: authLoading,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    if (user.role === "ADMIN") {
      router.replace("/admin/dashboard");
    } else if (user.role === "DOCTOR") {
      router.replace("/doctor/dashboard");
    } else {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await register(
        name,
        email,
        password,
        phone
      );

      if (!result.success) {
        setError(
          result.message || "Registration failed."
        );
        return;
      }

      router.replace(
        `/verify-email?email=${encodeURIComponent(
          result.email
        )}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
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

      <div className="absolute inset-0 bg-gradient-to-l from-blue-950/55 via-blue-950/25 to-transparent" />

      <div className="relative z-10 flex min-h-screen items-center">
        <div className="container mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex justify-center lg:justify-start">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8 lg:p-9">
                <div className="mb-7">
                  <p className="mb-2 text-sm font-semibold text-green-600">
                    Start Your Healing Journey
                  </p>

                  <h2 className="text-3xl font-bold text-blue-950">
                    Create Account
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Create your Heal By Nature account and
                    begin your personalized healthcare journey.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      required
                      disabled={loading}
                      autoComplete="name"
                      placeholder="Enter your full name"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

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
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                      disabled={loading}
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      disabled={loading}
                      autoComplete="tel"
                      placeholder="Enter your phone number"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-gray-700"
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
                      autoComplete="new-password"
                      placeholder="Create a strong password"
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
                        Creating account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                <div className="relative my-7">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>

                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-gray-400">
                      Already have an account?
                    </span>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-blue-950 px-4 py-3 text-sm font-semibold text-blue-950 transition-all duration-200 hover:bg-blue-950 hover:text-white"
                >
                  Sign In
                </Link>

                <p className="mt-6 text-center text-xs leading-relaxed text-gray-400">
                  Your information is kept secure and private.
                </p>
              </div>
            </div>

            <div className="text-center text-white lg:text-right">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-green-300 sm:text-base">
                Your Health. Your Journey. Your Care.
              </p>

              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Natural Healing.
                <br />
                <span className="text-white">
                  Trusted Care.
                </span>
                <br />
                <span className="text-green-400">
                  Better Health.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-100 sm:text-lg lg:ml-auto lg:mr-0">
                Join Heal By Nature and experience personalized
                homeopathic care focused on understanding you,
                your needs, and your natural path to better health.
              </p>

              <div className="ml-auto mt-7 h-1 w-16 rounded-full bg-green-500" />

              <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-gray-200 sm:text-base lg:ml-auto lg:mr-0">
                Create your account to manage appointments,
                stay connected with your healthcare team, and
                keep your treatment journey organized.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-7 lg:justify-end">
                <div>
                  <p className="text-2xl font-bold text-white">
                    500+
                  </p>
                  <p className="text-xs uppercase tracking-wide text-gray-200">
                    Happy Patients
                  </p>
                </div>

                <div className="hidden h-10 w-px bg-white/30 sm:block" />

                <div>
                  <p className="text-2xl font-bold text-white">
                    10+
                  </p>
                  <p className="text-xs uppercase tracking-wide text-gray-200">
                    Years Experience
                  </p>
                </div>

                <div className="hidden h-10 w-px bg-white/30 sm:block" />

                <div>
                  <p className="text-2xl font-bold text-white">
                    95%
                  </p>
                  <p className="text-xs uppercase tracking-wide text-gray-200">
                    Satisfaction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}