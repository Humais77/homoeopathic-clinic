"use client";

import { useEffect, useState } from "react";

type Testimonial = {
  id: string;
  rating: number;
  feedback: string;
  createdAt: string;
  user: {
    name: string;
  };
};

export function TestimonialsClient() {
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const response = await fetch(
          "/api/testimonials",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load testimonials."
          );
        }

        const data = await response.json();

        setTestimonials(
          data.testimonials || []
        );
      } catch (error) {
        console.error(
          "Testimonials error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadTestimonials();
  }, []);

  if (
    !loading &&
    testimonials.length === 0
  ) {
    return null;
  }

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#3da449]">
            Patient Experiences
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#10105c] sm:text-4xl">
            What Our Patients Say
          </h2>

          <p className="mt-4 text-gray-600">
            Hear from patients who have experienced
            our care.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials
              .slice(0, 6)
              .map((testimonial) => (
                <article
                  key={testimonial.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm"
                >
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <span
                          key={star}
                          className={
                            star <=
                            testimonial.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      )
                    )}
                  </div>

                  <p className="mt-4 text-gray-700">
                    “{testimonial.feedback}”
                  </p>

                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <p className="font-semibold text-gray-900">
                      {testimonial.user.name}
                    </p>

                    <p className="mt-1 text-xs font-medium text-green-600">
                      Verified Patient
                    </p>
                  </div>
                </article>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}