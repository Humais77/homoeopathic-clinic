"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Brain,
  Droplets,
  ShieldCheck,
} from "lucide-react";

import { WHY_HEAL_BY_NATURE } from "@/src/lib/constants";

export function WhyHealByNatureClient() {
  const holistic = WHY_HEAL_BY_NATURE.features.find(
    (feature) => feature.type === "holistic"
  );

  const natural = WHY_HEAL_BY_NATURE.features.find(
    (feature) => feature.type === "natural"
  );

  const doctors = WHY_HEAL_BY_NATURE.features.find(
    (feature) => feature.type === "doctors"
  );

  const personalized = WHY_HEAL_BY_NATURE.features.find(
    (feature) => feature.type === "personalized"
  );

  return (
    <section className="bg-white py-14 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-6 lg:px-8">

        {/* ================= HEADER ================= */}
        <div className="mx-auto mb-9 max-w-3xl text-center md:mb-11">
          <h2 className="text-[34px] font-bold leading-tight tracking-[-1.5px] text-[#10185C] sm:text-[40px] md:text-[46px]">
            {WHY_HEAL_BY_NATURE.title}
          </h2>

          <p className="mt-2 text-[13px] leading-relaxed text-[#858585] sm:text-[14px]">
            {WHY_HEAL_BY_NATURE.subtitle}
          </p>
        </div>

        {/* ================= MAIN GRID ================= */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">

          {/* =====================================================
              LEFT - EXPERT DOCTORS
          ====================================================== */}
          {doctors && (
            <div className="relative min-h-[430px] overflow-hidden rounded-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.08)] md:min-h-[500px] lg:col-span-6 lg:row-span-2">

              <Image
                src="/images/Hero-bg.png"
                alt="Expert Doctors"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              {/* Bottom dark gradient */}
              <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#11145f] via-[#11145f]/75 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7 md:p-8">

                <h3 className="text-[25px] font-medium leading-tight text-white sm:text-[28px]">
                  {doctors.title}
                </h3>

                <p className="mt-2 max-w-[390px] text-[13px] leading-[1.5] text-white/80 sm:text-[14px]">
                  {doctors.description}
                </p>

                <Link
                  href={doctors.linkHref}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-[13px] font-medium text-[#172060] transition-all duration-300 hover:bg-gray-100"
                >
                  {doctors.linkText}
                </Link>
              </div>
            </div>
          )}

          {/* =====================================================
              TOP RIGHT - HOLISTIC
          ====================================================== */}
          {holistic && (
            <div className="rounded-[18px] border border-[#eeeeee] bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] md:p-7 lg:col-span-3">

              {/* Icon */}
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-[9px] bg-[#f0f0f8]">
                <Brain
                  className="h-5 w-5 text-[#151b68]"
                  strokeWidth={1.8}
                />
              </div>

              <h3 className="text-[19px] font-semibold leading-tight text-[#123d35]">
                {holistic.title}
              </h3>

              <p className="mt-2 text-[12.5px] leading-[1.55] text-[#707070]">
                {holistic.description}
              </p>

              <Link
                href={holistic.linkHref}
                className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-[#41695e] transition-colors hover:text-[#182060]"
              >
                {holistic.linkText}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* =====================================================
              TOP RIGHT - NATURAL
          ====================================================== */}
          {natural && (
            <div className="rounded-[18px] border border-[#eeeeee] bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] md:p-7 lg:col-span-3">

              {/* Icon */}
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-[9px] bg-[#f0f0f8]">
                <Droplets
                  className="h-5 w-5 text-[#151b68]"
                  strokeWidth={1.8}
                />
              </div>

              <h3 className="text-[19px] font-semibold leading-tight text-[#123d35]">
                {natural.title}
              </h3>

              <p className="mt-2 text-[12.5px] leading-[1.55] text-[#707070]">
                {natural.description}
              </p>

              <Link
                href={natural.linkHref}
                className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-[#41695e] transition-colors hover:text-[#182060]"
              >
                {natural.linkText}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* =====================================================
              BOTTOM RIGHT - PERSONALIZED CARE
          ====================================================== */}
          {personalized && (
            <div className="relative overflow-hidden rounded-[18px] bg-[#3eaa4b] p-6 shadow-[0_5px_20px_rgba(0,0,0,0.08)] md:p-7 lg:col-span-6">

              {/* Text */}
              <div className="relative z-10 max-w-[58%]">

                <h3 className="text-[25px] font-medium leading-tight text-white sm:text-[27px]">
                  {personalized.title}
                </h3>

                <p className="mt-2 text-[12.5px] leading-[1.5] text-white/70 sm:text-[13px]">
                  {personalized.description}
                </p>

                <Link
                  href={personalized.linkHref}
                  className="mt-5 inline-flex items-center rounded-full border border-white/40 px-5 py-2 text-[12px] font-medium text-white transition-all duration-300 hover:bg-white hover:text-[#3eaa4b]"
                >
                  {personalized.linkText}
                </Link>
              </div>

              {/* Shield Icon */}
              <div className="absolute bottom-2 right-5 flex items-center justify-center md:right-7">
                <ShieldCheck
                  className="h-[130px] w-[130px] text-white/95 sm:h-[145px] sm:w-[145px]"
                  strokeWidth={1.2}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}