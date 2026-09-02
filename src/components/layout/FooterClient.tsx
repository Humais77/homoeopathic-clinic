"use client";

import Image from "next/image";
import Link from "next/link";

import { FOOTER, NAV_LINKS } from "@/src/lib/constants";
import { SITE_ASSETS } from "@/src/config/site-assets";
export function FooterClient() {
  return (
    <footer className="relative overflow-hidden bg-[#050d32] text-white">
      {/* Main Footer */}
      <div className="relative mx-auto h-[355px] max-w-[1180px] px-5 sm:px-6">
        <div className="flex flex-col items-center pt-5 sm:pt-6">
          {/* Logo */}
          <Link
            href="/"
            className="relative z-20 flex items-center justify-center"
          >
            <Image
              src={SITE_ASSETS.footerLogo}
              alt="Heal By Nature"
              width={70}
              height={70}
              priority
              className="h-[62px] w-[62px] object-contain sm:h-[68px] sm:w-[68px]"
            />
          </Link>

          {/* Description */}
          <p className="relative z-20 mt-3 max-w-[470px] px-2 text-center text-[9px] leading-[1.45] text-white/85 sm:mt-4 sm:text-[10px]">
            {FOOTER.description}
          </p>

          {/* Navigation */}
          <nav className="relative z-20 mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:mt-5 sm:gap-x-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[10px] font-medium text-white transition-colors duration-200 hover:text-[#45a94a] sm:text-[12px]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div
          className="
    pointer-events-none
    absolute
    bottom-[72px]
    left-1/2
    z-0
    w-full
    -translate-x-1/2
    select-none
    text-center
  "
          aria-hidden="true"
        >
          <span
            className="
      whitespace-nowrap
      bg-gradient-to-b
      from-[#c9d0e2]/30
      via-[#78829e]/20
      to-[#050d32]/0
      bg-clip-text
      text-[43px]
      font-extrabold
      leading-none
      tracking-[-3px]
      text-transparent
      drop-shadow-[0_4px_12px_rgba(255,255,255,0.04)]
      sm:text-[58px]
      sm:tracking-[-4px]
      md:text-[72px]
      md:tracking-[-5px]
      lg:text-[88px]
      xl:text-[100px]
      2xl:text-[110px]
    "
          >
            Heal By Nature
          </span>
        </div>

        <div
          className="
            absolute
            bottom-6
            left-5
            right-5
            z-20
            flex
            flex-col
            items-center
            justify-between
            gap-4
            sm:left-6
            sm:right-6
            sm:flex-row
            sm:items-end
          "
        >
          {/* Social Icons */}
          <div className="flex items-center gap-2">
            {/* Facebook */}
            <Link
              href="#"
              aria-label="Facebook"
              className="
                flex h-[20px] w-[20px]
                items-center justify-center
                rounded-full
                border border-white/70
                text-white
                transition-all
                duration-200
                hover:bg-white
                hover:text-[#050d32]
                sm:h-[21px]
                sm:w-[21px]
              "
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[10px] w-[10px] fill-current sm:h-[11px] sm:w-[11px]"
                aria-hidden="true"
              >
                <path d="M14 8h3V4h-3c-2.76 0-5 2.24-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9c0-.55.45-1 1-1z" />
              </svg>
            </Link>

            {/* Instagram */}
            <Link
              href="#"
              aria-label="Instagram"
              className="
                flex h-[20px] w-[20px]
                items-center justify-center
                rounded-full
                border border-white/70
                text-white
                transition-all
                duration-200
                hover:bg-white
                hover:text-[#050d32]
                sm:h-[21px]
                sm:w-[21px]
              "
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[10px] w-[10px] fill-none stroke-current sm:h-[11px] sm:w-[11px]"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  className="fill-current stroke-none"
                />
              </svg>
            </Link>

            {/* LinkedIn */}
            <Link
              href="#"
              aria-label="LinkedIn"
              className="
                flex h-[20px] w-[20px]
                items-center justify-center
                rounded-full
                border border-white/70
                text-white
                transition-all
                duration-200
                hover:bg-white
                hover:text-[#050d32]
                sm:h-[21px]
                sm:w-[21px]
              "
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[10px] w-[10px] fill-current sm:h-[11px] sm:w-[11px]"
                aria-hidden="true"
              >
                <path d="M6.5 8.5H3V21h3.5V8.5ZM4.75 3C3.65 3 3 3.72 3 4.65S3.65 6.3 4.7 6.3h.05c1.1 0 1.75-.73 1.75-1.65C6.45 3.72 5.8 3 4.75 3ZM21 13.85C21 10.1 19 8.2 16.35 8.2c-2.15 0-3.1 1.18-3.65 2v-1.7H9.2V21h3.5v-6.3c0-1.7.3-3.35 2.45-3.35 2.1 0 2.12 1.95 2.12 3.47V21H21v-7.15Z" />
              </svg>
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-center text-[8px] text-white/90 sm:text-right sm:text-[9px]">
            {FOOTER.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}