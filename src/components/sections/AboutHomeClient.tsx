'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ABOUT_HOME } from '@/src/lib/constants';
import { SITE_ASSETS } from "@/src/config/site-assets";
export function AboutHomeClient() {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 xl:gap-16">
          <div className="relative order-2 mx-auto w-full max-w-[560px] lg:order-1 lg:mx-0">
            <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px]">
              <Image
                src={SITE_ASSETS.hero}
                alt="Heal By Nature - About Us"
                width={600}
                height={650}
                priority
                className="h-auto w-full object-cover"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
            </div>

            <div
              className="
                absolute
                -bottom-1
                right-[-4px]
                flex
                min-h-[130px]
                w-[145px]
                flex-col
                justify-center
                rounded-[16px]
                bg-[#11136b]
                px-4
                py-4
                text-white
                shadow-xl
                sm:-bottom-2
                sm:right-[-8px]
                sm:min-h-[145px]
                sm:w-[155px]
                sm:rounded-[18px]
                sm:px-5
              "
            >
              <span className="text-[30px] font-bold leading-none sm:text-[34px]">
                {ABOUT_HOME.stats.years}
              </span>

              <span className="mt-2 text-[11px] font-medium leading-[1.35] text-white/95 sm:text-xs">
                {ABOUT_HOME.stats.label}
              </span>
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="absolute -right-1 -top-2 hidden flex-col gap-3 sm:flex lg:-right-4 lg:-top-8">
              <Link
                href="https://wa.me/"
                aria-label="Contact us on WhatsApp"
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-[#25D366]
                  shadow-md
                  transition-transform
                  duration-200
                  hover:scale-105
                  sm:h-12
                  sm:w-12
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 fill-white"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M20.52 3.449C18.24 1.206 15.205-.02 11.97 0 5.37.026.018 5.38 0 11.98c-.006 2.11.55 4.17 1.61 5.984L.06 23.999l6.174-1.62a11.96 11.96 0 0 0 5.73 1.46h.005c6.6 0 11.954-5.354 11.96-11.954a11.9 11.9 0 0 0-3.41-8.436zm-8.55 18.38h-.004a9.96 9.96 0 0 1-5.08-1.39l-.364-.216-3.663.96.978-3.57-.237-.366a9.96 9.96 0 0 1-1.528-5.27C2.078 6.48 6.51 2.045 11.97 2.045c2.65-.01 5.14 1.02 7.01 2.884a9.93 9.93 0 0 1 2.915 7.03c-.004 5.46-4.443 9.9-9.925 9.9z" />
                </svg>
              </Link>

              <Link
                href={ABOUT_HOME.ctaLink}
                aria-label="Book an online consultation"
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-[#11136b]
                  shadow-md
                  transition-transform
                  duration-200
                  hover:scale-105
                  sm:h-12
                  sm:w-12
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 fill-none stroke-white"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5" />
                  <path d="M8 3.5c1.1-.8 2.5-1.2 4-1.2s2.9.4 4 1.2" />
                </svg>
              </Link>
            </div>

            <span className="block text-sm font-semibold tracking-wide text-[#45a94a]">
              {ABOUT_HOME.title}
            </span>

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
              <span className="block">Healing Naturally.</span>

              <span className="block text-[#11136b]">
                Caring Completely.
              </span>
            </h2>

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

            <div className="mt-6 sm:mt-7">
              <Link
                href={ABOUT_HOME.ctaLink}
                className="
                  inline-flex
                  min-w-[220px]
                  items-center
                  justify-center
                  rounded-[12px]
                  bg-[#45a94a]
                  px-7
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:bg-[#38913e]
                  hover:shadow-lg
                  hover:shadow-green-600/20
                  sm:min-w-[245px]
                  sm:py-3.5
                "
              >
                {ABOUT_HOME.ctaText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}