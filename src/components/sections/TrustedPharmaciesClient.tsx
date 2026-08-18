import Image from "next/image";
import Link from "next/link";
import { PHARMACIES_SECTION } from "@/src/lib/constants";

export function TrustedPharmaciesClient() {
  return (
    <section className="bg-white pb-12 pt-4 sm:pb-14 sm:pt-6 md:pb-16">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Heading */}
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2 className="text-2xl font-bold text-[#11136b] sm:text-3xl md:text-4xl">
            {PHARMACIES_SECTION.title}
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
            {PHARMACIES_SECTION.subtitle}
          </p>
        </div>

        {/* Pharmacy Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {PHARMACIES_SECTION.pharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative h-40 w-full overflow-hidden sm:h-44">
                <Image
                  src={pharmacy.image}
                  alt={pharmacy.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm font-bold text-[#11136b] sm:text-base">
                  {pharmacy.name}
                </h3>

                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                  {pharmacy.description}
                </p>

                <Link
                  href="/contact"
                  className="mt-3 inline-flex items-center text-[11px] font-semibold text-[#45a94a] transition-colors hover:text-[#38913e]"
                >
                  Learn More
                  <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}