"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Treatment = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  category: string | null;
};

type Props = {
  treatments: Treatment[];
};

export function TreatmentsContentClient({
  treatments,
}: Props) {
  const [searchTerm, setSearchTerm] =
    useState("");

  const filteredTreatments = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return treatments;
    }

    return treatments.filter((treatment) => {
      return (
        treatment.name
          .toLowerCase()
          .includes(search) ||
        treatment.category
          ?.toLowerCase()
          .includes(search) ||
        treatment.description
          ?.toLowerCase()
          .includes(search)
      );
    });
  }, [searchTerm, treatments]);

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Search */}
        <div className="mx-auto mb-10 max-w-xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search treatments..."
            className="w-full rounded-xl border border-gray-300 px-5 py-4 text-gray-800 outline-none transition focus:border-[#151568] focus:ring-2 focus:ring-[#151568]/10"
          />
        </div>

        {filteredTreatments.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center">
            <h3 className="text-xl font-bold text-[#151568]">
              No treatments found
            </h3>

            <p className="mt-2 text-gray-600">
              Try searching for a different
              treatment.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTreatments.map(
              (treatment) => (
                <article
                  key={treatment.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-56 w-full bg-gray-100">
                    {treatment.image ? (
                      <Image
                        src={treatment.image}
                        alt={treatment.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {treatment.category && (
                      <span className="mb-3 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        {treatment.category}
                      </span>
                    )}

                    <h2 className="text-xl font-bold text-[#151568]">
                      {treatment.name}
                    </h2>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                      {treatment.description ||
                        "Learn more about this treatment and how it can support your wellness."}
                    </p>

                    <Link
                      href={`/treatments/${treatment.slug}`}
                      className="mt-5 inline-flex rounded-xl bg-[#151568] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#10104f]"
                    >
                      Learn More
                    </Link>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}