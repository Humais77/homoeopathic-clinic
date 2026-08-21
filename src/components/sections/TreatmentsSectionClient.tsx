'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TREATMENTS_SECTION } from '@/src/lib/constants';

export function TreatmentsSectionClient() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {TREATMENTS_SECTION.title}
          </h2>
          <p className="text-lg text-gray-600">
            {TREATMENTS_SECTION.subtitle}
          </p>
        </div>

        {/* Treatments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {TREATMENTS_SECTION.treatments.map((treatment) => (
            <div
              key={treatment.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
                <Image
                  src={treatment.image}
                  alt={treatment.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {treatment.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {treatment.description}
                </p>
                <Link
                  href={treatment.link}
                  className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors group/link"
                >
                  <span>{treatment.ctaText}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Explore All Button */}
        <div className="text-center mt-12">
          <Link
            href={TREATMENTS_SECTION.exploreAllLink}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-primary-500/30"
          >
            {TREATMENTS_SECTION.exploreAllText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}