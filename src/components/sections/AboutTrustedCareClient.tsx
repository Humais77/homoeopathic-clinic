'use client';

import Link from 'next/link';
import { ABOUT_TRUSTED_CARE } from '@/src/lib/constants';

export function AboutTrustedCareClient() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="max-w-4xl mx-auto">
          <span className="block text-sm font-semibold tracking-wide text-[#45a94a] uppercase">
            {ABOUT_TRUSTED_CARE.title}
          </span>

          <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            <span className="block">{ABOUT_TRUSTED_CARE.subtitle}</span>
            <span className="block text-[#11136b]">{ABOUT_TRUSTED_CARE.subtitleHighlight}</span>
          </h2>

          <p className="mt-4 text-gray-600 text-base md:text-lg leading-relaxed">
            {ABOUT_TRUSTED_CARE.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-8">
            {ABOUT_TRUSTED_CARE.stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-2xl md:text-3xl font-bold text-[#11136b]">
                  {stat.value}
                </span>
                <span className="text-sm text-gray-600">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href={ABOUT_TRUSTED_CARE.ctaLink}
              className="inline-flex items-center justify-center px-8 py-3 bg-[#45a94a] text-white font-semibold rounded-lg hover:bg-[#38913e] transition-all duration-200 shadow-lg hover:shadow-green-600/20"
            >
              {ABOUT_TRUSTED_CARE.ctaText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}