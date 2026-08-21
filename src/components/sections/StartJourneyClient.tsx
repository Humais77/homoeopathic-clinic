"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function StartJourneyClient() {
  return (
    <section className="bg-white py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-6 lg:px-8">
        <div className="relative min-h-[250px] overflow-hidden rounded-[20px] bg-[#11183f] shadow-[0_5px_20px_rgba(0,0,0,0.08)]">

          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#18214d] via-[#11183f] to-[#0b1234]" />

          {/* =================================================
              CONTENT
          ================================================== */}
          <div className="relative z-10 flex min-h-[250px] items-center px-7 py-10 sm:px-10 md:px-12 lg:px-12">

            <div className="max-w-[530px] pb-2">

              {/* Heading */}
              <h2 className="text-[29px] font-bold leading-[1.15] tracking-[-0.8px] text-white sm:text-[34px] md:text-[36px]">
                Start Your Journey
                <br />
                Toward Better Health
              </h2>

              {/* Description */}
              <p className="mt-3 max-w-[480px] text-[12px] leading-[1.6] text-white/75 sm:text-[13px]">
                Book your appointment today and experience personalized
                homeopathic step toward lasting health and natural wellness.
              </p>

              {/* Button */}
              <Link
                href="/appointment"
                className="mt-5 inline-flex h-[36px] items-center gap-2 rounded-[7px] bg-[#3eaa4b] px-4 text-[11px] font-medium text-white transition-all duration-300 hover:bg-[#349441] hover:shadow-lg"
              >
                Book Your Appointment
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* =================================================
              DOCTOR IMAGE
          ================================================== */}
          <div className="absolute bottom-0 right-[3%] hidden h-[245px] w-[270px] sm:block md:right-[5%] md:h-[250px] md:w-[290px] lg:right-[6%] lg:w-[300px]">

            <Image
              src="/images/Home/StartJourney-Img.png"
              alt="Doctor"
              fill
              sizes="300px"
              className="object-contain object-bottom"
            />
          </div>

          {/* Mobile doctor image */}
          <div className="absolute bottom-0 right-[-35px] block h-[180px] w-[190px] opacity-20 sm:hidden">
            <Image
              src="/images/Home/StartJourney-Img.png"
              alt=""
              fill
              sizes="190px"
              className="object-contain object-bottom"
            />
          </div>

        </div>
      </div>
    </section>
  );
}