"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PHARMACIES_SECTION } from "@/src/lib/constants";

type Pharmacy = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  mapsUrl: string | null;
};

export function TrustedPharmaciesClient() {
  const [pharmacies, setPharmacies] = useState<
    Pharmacy[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPharmacies() {
      try {
        const response = await fetch(
          "/api/pharmacies",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load pharmacies"
          );
        }

        const data = await response.json();

        setPharmacies(data.pharmacies || []);
      } catch (error) {
        console.error(
          "Failed to load pharmacies:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadPharmacies();
  }, []);

  return (
    <section className="bg-white pb-12 pt-4 sm:pb-14 sm:pt-6 md:pb-16">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2 className="text-2xl font-bold text-[#11136b] sm:text-3xl md:text-4xl">
            {PHARMACIES_SECTION.title}
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
            {PHARMACIES_SECTION.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
          </div>
        ) : pharmacies.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No trusted pharmacies are currently available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {pharmacies.map((pharmacy) => (
              <div
                key={pharmacy.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-40 w-full overflow-hidden bg-gray-100 sm:h-44">
                  {pharmacy.image ? (
                    <Image
                      src={pharmacy.image}
                      alt={pharmacy.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">
                      🏪
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-bold text-[#11136b] sm:text-base">
                    {pharmacy.name}
                  </h3>

                  {pharmacy.description && (
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                      {pharmacy.description}
                    </p>
                  )}

                  {pharmacy.address && (
                    <p className="mt-3 text-xs leading-relaxed text-gray-600">
                      📍 {pharmacy.address}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {pharmacy.mapsUrl && (
                      <a
                        href={pharmacy.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg bg-[#11136b] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#0d0f57]"
                      >
                        View Location
                      </a>
                    )}

                    {pharmacy.website && (
                      <a
                        href={pharmacy.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Website
                      </a>
                    )}

                    {pharmacy.phone && (
                      <a
                        href={`tel:${pharmacy.phone}`}
                        className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}