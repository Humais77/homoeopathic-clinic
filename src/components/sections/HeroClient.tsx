'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SITE_ASSETS } from "@/src/config/site-assets";

export function HeroClient() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="grid items-center gap-8 py-10 lg:grid-cols-2 lg:gap-4 lg:py-14 lg:mt-[-50px]">
          
          {/* Left Content */}
          <div className="relative z-10 text-center lg:text-left">
            <h1 className="font-bold leading-[1.08] tracking-tight">
              <span className="block text-4xl text-blue-950 sm:text-5xl lg:text-5xl xl:text-6xl">
                Natural Healing.
              </span>

              <span className="mt-1 block text-4xl text-blue-950 sm:text-5xl lg:text-5xl xl:text-6xl">
                Trusted Care.
              </span>

              <span className="mt-1 block text-4xl text-green-600 sm:text-5xl lg:text-5xl xl:text-6xl">
                Better Health.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base lg:mx-0">
              Experience personalized homeopathic treatment tailored to your
              genetic blueprint. We blend traditional wisdom with modern science
              to restore your body's natural balance.
            </p>

            {/* Buttons */}
            <div className="mt-7 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/appointment"
                className="inline-flex items-center justify-center rounded-xl bg-green-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-green-700 hover:shadow-lg"
              >
                Book Appointment
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-blue-950 px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-900 hover:shadow-lg"
              >
                Emergency Contact Us
              </Link>
            </div>
          </div>

          {/* Right Doctors Image */}
          <div className="relative flex items-end justify-center lg:justify-end">
            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl">
              <Image
                src={SITE_ASSETS.hero}
                alt="Healthcare Professionals"
                width={700}
                height={600}
                priority
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative z-20 mx-auto -mt-2 mb-6 max-w-6xl rounded-2xl bg-blue-950 px-6 py-6 shadow-xl sm:px-8 lg:-mt-6 lg:px-10 lg:py-7">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4 md:gap-4">
            
            {/* Stat 1 */}
            <div>
              <div className="text-2xl font-bold text-white sm:text-3xl">
                500+
              </div>

              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-300 sm:text-sm">
                Happy Patients
              </div>
            </div>

            {/* Stat 2 */}
            <div>
              <div className="text-2xl font-bold text-white sm:text-3xl">
                10+
              </div>

              <div className="mt-1 text-xs font-semibold text-gray-300 sm:text-sm">
                Years Experience
              </div>
            </div>

            {/* Stat 3 */}
            <div>
              <div className="text-2xl font-bold text-white sm:text-3xl">
                95%
              </div>

              <div className="mt-1 text-xs font-semibold text-gray-300 sm:text-sm">
                Satisfaction Rate
              </div>
            </div>

            {/* Stat 4 */}
            <div>
              <div className="text-2xl font-bold text-white sm:text-3xl">
                Doctors
              </div>

              <div className="mt-1 text-xs font-semibold text-gray-300 sm:text-sm">
                Certified Homeopathic
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}