import Image from "next/image";
import { DOCTORS_SECTION } from "@/src/lib/constants";

export function DoctorsSpecialistsClient() {
  return (
    <section className="bg-white py-12 sm:py-14 md:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Heading */}
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2 className="text-2xl font-bold text-[#11136b] sm:text-3xl md:text-4xl">
            {DOCTORS_SECTION.title}
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
            {DOCTORS_SECTION.subtitle}
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
          {DOCTORS_SECTION.doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="overflow-hidden rounded-lg bg-[#f5f8fa] px-4 pb-5 pt-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Doctor Image */}
              <div className="mx-auto mb-3 h-28 w-28 overflow-hidden rounded-full border-[3px] border-[#d8e1ed] bg-white sm:h-32 sm:w-32">
                <div className="relative h-full w-full">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
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

              {/* Description */}
              <p className="mx-auto mt-2 max-w-[240px] text-[9px] leading-relaxed text-gray-500 sm:text-[10px]">
                {doctor.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}