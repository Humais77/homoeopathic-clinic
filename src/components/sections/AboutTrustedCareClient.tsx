'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ABOUT_TRUSTED_CARE } from '@/src/lib/constants';

export function AboutTrustedCareClient() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-12">

          {/* LEFT CONTENT */}
          <div className="max-w-[500px]">
            <span className="block text-sm font-semibold text-[#45a94a]">
              {ABOUT_TRUSTED_CARE.title}
            </span>

            <h2 className="mt-2 text-[34px] font-bold leading-[1.02] tracking-tight text-[#292929] sm:text-[40px] lg:text-[46px]">
              <span className="block">
                {ABOUT_TRUSTED_CARE.subtitle}
              </span>

              <span className="block text-[#11136b]">
                {ABOUT_TRUSTED_CARE.subtitleHighlight}
              </span>
            </h2>

            <p className="mt-5 max-w-[430px] text-[15px] leading-[1.5] text-[#555] sm:text-[16px]">
              {ABOUT_TRUSTED_CARE.description}
            </p>

            {/* STATS */}
            <div className="mt-6 grid max-w-[395px] grid-cols-2 gap-3">
              {ABOUT_TRUSTED_CARE.stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex h-[81px] flex-col justify-center rounded-[14px] bg-[#eef0f6] px-5"
                >
                  <span className="text-[12px] font-medium text-[#666] sm:text-[13px]">
                    {stat.label}
                  </span>

                  <span className="mt-1 text-[24px] font-bold leading-none text-[#11136b] sm:text-[27px]">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-5">
              <Link
                href={ABOUT_TRUSTED_CARE.ctaLink}
                className="inline-flex h-[47px] min-w-[263px] items-center justify-center rounded-[13px] bg-[#45a94a] px-7 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#38913e] hover:shadow-md"
              >
                {ABOUT_TRUSTED_CARE.ctaText}
              </Link>
            </div>
          </div>

          {/* RIGHT IMAGE COMPOSITION */}
          <div className="relative mx-auto h-[500px] w-full max-w-[500px]">

            {/* BACK / DOCTOR IMAGE */}
            <div className="absolute right-0 top-[5px] h-[307px] w-[280px] overflow-hidden rounded-[17px]">
              <Image
                src="/images/AboutUs/Doctor2.png"
                alt="Doctor providing professional healthcare"
                fill
                priority
                className="object-cover"
                sizes="280px"
              />
            </div>

            {/* FRONT / CONSULTATION IMAGE */}
            <div className="absolute bottom-[0px] left-[0px] z-10 h-[283px] w-[258px] overflow-hidden rounded-[17px]">
              <Image
                src="/images/AboutUs/Doctor1.png"
                alt="Patient receiving a healthcare consultation"
                fill
                className="object-cover"
                sizes="258px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}