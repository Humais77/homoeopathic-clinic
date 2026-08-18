'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ABOUT_HOME } from '@/src/lib/constants';

export function FounderCeoClient() {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 xl:gap-16">

          {/* =========================================================
              LEFT — FOUNDER IMAGE
          ========================================================== */}
          <div className="relative mx-auto w-full max-w-[560px] lg:mx-0">
            <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px]">
              <Image
                src="/images/Founder&Ceo.png"
                alt="Founder and CEO - Heal By Nature"
                width={600}
                height={650}
                priority
                className="h-auto w-full object-cover"
              />

              {/* Subtle image overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
            </div>
          </div>

          {/* =========================================================
              RIGHT — FOUNDER CONTENT
          ========================================================== */}
          <div className="relative">

            

            {/* Small Title */}
            <span className="block text-sm font-semibold tracking-wide text-[#45a94a]">
              Founder & Ceo
            </span>

            {/* Main Heading */}
            <h2
              className="
                mt-2
                max-w-[620px]
                text-[34px]
                font-extrabold
                leading-[1.08]
                tracking-[-1px]
                text-[#151515]

                sm:text-[40px]
                md:text-[44px]
                lg:text-[46px]
                xl:text-[48px]
              "
            >
              <span className="block">
                Our Founder Message
              </span>
            </h2>

            {/* Description */}
            <p
              className="
                mt-4
                max-w-[640px]
                text-[14px]
                leading-[1.48]
                text-[#555]

                sm:mt-5
                sm:text-[15px]
                md:text-base
              "
            >
              {ABOUT_HOME.description}
            </p>

            {/* =====================================================
                FOUNDER NAME
            ====================================================== */}
            <div className="mt-7 sm:mt-8">
              <p className="mt-1 text-xl font-medium text-[#45a94a]">
               Doctor Irfan Iqbal
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}