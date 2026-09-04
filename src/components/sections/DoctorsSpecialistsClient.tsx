"use client";

import Image from "next/image";
import Link from "next/link";

export type HomeDoctor = {
  id: string;
  name: string;
  qualification: string;
  specialization: string | null;
  experience: string | null;
  description: string | null;
  image: string | null;
};

type Props = {
  doctors: HomeDoctor[];
};

export function DoctorsSpecialistsClient({
  doctors,
}: Props) {
  return (
    <section className="bg-white py-12 sm:py-14 md:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Heading */}
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2 className="text-2xl font-bold text-[#11136b] sm:text-3xl md:text-4xl">
            Doctors & Specialists
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
            Meet our qualified doctors dedicated to
            providing personalized homeopathic care.
          </p>
        </div>

        {/* Empty State */}
        {doctors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-500">
              Our doctors and specialists will be
              displayed here.
            </p>
          </div>
        ) : (
          /* Doctors Grid */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="overflow-hidden rounded-lg bg-[#f5f8fa] px-4 pb-5 pt-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Doctor Image */}
                <div className="mx-auto mb-3 h-28 w-28 overflow-hidden rounded-full border-[3px] border-[#d8e1ed] bg-white sm:h-32 sm:w-32">
                  <div className="relative h-full w-full">
                    {doctor.image ? (
                      <Image
                        src={doctor.image}
                        alt={doctor.name}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100">
                        <span className="text-xs text-gray-400">
                          No image
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-sm font-bold text-[#11136b] sm:text-base">
                  {doctor.name}
                </h3>

                {/* Qualification */}
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-[#45a94a] sm:text-[10px]">
                  {doctor.qualification}
                </p>

                {/* Specialization */}
                {doctor.specialization && (
                  <p className="mt-1 text-[10px] font-medium text-[#11136b] sm:text-xs">
                    {doctor.specialization}
                  </p>
                )}

                <div className="mt-4">
  <Link
    href={`/doctors/${doctor.id}`}
    className="inline-flex rounded-lg bg-[#11136b] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0d0f59]"
  >
    View Profile
  </Link>
</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}