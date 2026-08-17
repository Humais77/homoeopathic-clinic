"use client";

import Image from "next/image";
import Link from "next/link";

import { FOOTER, NAV_LINKS } from "@/src/lib/constants";

export function FooterClient() {
  return (
    <footer className="relative overflow-hidden bg-[#050d32] text-white">

      {/* =====================================================
          MAIN FOOTER
      ====================================================== */}
      <div className="relative z-10 mx-auto max-w-[1180px] px-5 sm:px-6">

        <div className="flex min-h-[360px] flex-col items-center pt-5 sm:pt-6">

          {/* =================================================
              LOGO
          ================================================== */}
          <Link
            href="/"
            className="relative z-10"
          >
            <Image
              src="/images/logo.png"
              alt="Heal By Nature"
              width={70}
              height={70}
              className="h-[62px] w-[62px] object-contain sm:h-[68px] sm:w-[68px]"
            />
          </Link>

          {/* =================================================
              DESCRIPTION
          ================================================== */}
          <p className="mt-4 max-w-[470px] text-center text-[9px] leading-[1.45] text-white/85 sm:text-[10px]">
            {FOOTER.description}
          </p>

          {/* =================================================
              NAVIGATION
          ================================================== */}
          <nav className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] font-medium text-white transition-colors duration-200 hover:text-[#3eaa4b] sm:text-[12px]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* =================================================
              LARGE BACKGROUND TEXT - FIXED RESPONSIVENESS
          ================================================== */}
          <div
            className="pointer-events-none absolute bottom-[72px] left-1/2 -translate-x-1/2 whitespace-nowrap select-none"
            aria-hidden="true"
          >
            <span className="text-[40px] font-extrabold leading-none tracking-[-3px] text-white/[0.14] 
              sm:text-[60px] sm:tracking-[-4px] 
              md:text-[75px] md:tracking-[-5px] 
              lg:text-[90px] 
              xl:text-[105px] 
              2xl:text-[115px]">
              Heal By Nature
            </span>
          </div>

          {/* =================================================
              BOTTOM AREA - FIXED RESPONSIVENESS
          ================================================== */}
          <div className="absolute bottom-5 left-0 right-0 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 sm:gap-0 px-1 sm:bottom-6 sm:px-0">

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {/* Facebook */}
              <Link
                href="#"
                aria-label="Facebook"
                className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-white/70 text-white transition-all hover:bg-white hover:text-[#050d32]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[11px] w-[11px] fill-current"
                  aria-hidden="true"
                >
                  <path d="M14 8h3V4h-3c-2.76 0-5 2.24-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9c0-.55.45-1 1-1z" />
                </svg>
              </Link>

              {/* Instagram */}
              <Link
                href="#"
                aria-label="Instagram"
                className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-white/70 text-white transition-all hover:bg-white hover:text-[#050d32]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[11px] w-[11px] fill-none stroke-current"
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
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                  />
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
                className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-white/70 text-white transition-all hover:bg-white hover:text-[#050d32]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[11px] w-[11px] fill-current"
                  aria-hidden="true"
                >
                  <path d="M6.5 8.5H3V21h3.5V8.5ZM4.75 3C3.65 3 3 3.72 3 4.65S3.65 6.3 4.7 6.3h.05c1.1 0 1.75-.73 1.75-1.65C6.45 3.72 5.8 3 4.75 3ZM21 13.85C21 10.1 19 8.2 16.35 8.2c-2.15 0-3.1 1.18-3.65 2v-1.7H9.2V21h3.5v-6.3c0-1.7.3-3.35 2.45-3.35 2.1 0 2.12 1.95 2.12 3.47V21H21v-7.15Z" />
                </svg>
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-center sm:text-right text-[9px] text-white/90 sm:text-[10px]">
              {FOOTER.copyright}
            </p>

          </div>
        </div>
      </div>
    </footer>
  );
}