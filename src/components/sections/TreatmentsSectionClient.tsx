"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { TREATMENTS_SECTION } from "@/src/lib/constants";

export type HomeTreatment = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  category: string | null;
};

type Props = {
  treatments: HomeTreatment[];
};

export function TreatmentsSectionClient({
  treatments,
}: Props) {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
            {TREATMENTS_SECTION.title}
          </h2>

          <p className="text-lg text-gray-600">
            {TREATMENTS_SECTION.subtitle}
          </p>
        </div>

        {/* Treatments Grid */}
        {treatments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
            <p className="text-gray-500">
              No treatments are currently available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {treatments.map((treatment) => (
              <div
                key={treatment.id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100 md:h-56">
                  {treatment.image ? (
                    <Image
                      src={treatment.image}
                      alt={treatment.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-sm text-gray-400">
                        No image available
                      </span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Category */}
                  {treatment.category && (
                    <div className="absolute left-4 top-4">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm backdrop-blur-sm">
                        {treatment.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-primary-600">
                    {treatment.name}
                  </h3>

                  {treatment.description && (
                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-600">
                      {treatment.description}
                    </p>
                  )}

                  <Link
                    href={`/treatments/${treatment.slug}`}
                    className="group/link inline-flex items-center gap-2 font-semibold text-primary-600 transition-colors hover:text-primary-700"
                  >
                    <span>Learn More</span>

                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Explore All Button */}
        <div className="mt-12 text-center">
          <Link
            href="/treatments"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-3.5 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-primary-700 hover:shadow-primary-500/30"
          >
            {TREATMENTS_SECTION.exploreAllText}

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}