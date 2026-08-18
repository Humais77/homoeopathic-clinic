'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { TREATMENTS_SECTION } from '@/src/lib/constants';

export function TreatmentsContentClient() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTreatments = useMemo(() => {
    if (!searchTerm.trim()) {
      return TREATMENTS_SECTION.treatments;
    }
    return TREATMENTS_SECTION.treatments.filter((treatment) =>
      treatment.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {TREATMENTS_SECTION.title}
          </h2>
          <p className="text-lg text-gray-600">
            {TREATMENTS_SECTION.subtitle}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search the treatment you want..."
              className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#45a94a] focus:border-transparent text-gray-700 placeholder:text-gray-400 transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Showing {filteredTreatments.length} results for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Treatments Grid */}
        {filteredTreatments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredTreatments.map((treatment) => (
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
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#45a94a] transition-colors">
                    {treatment.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {treatment.description}
                  </p>
                  <Link
                    href={treatment.link}
                    className="inline-flex items-center gap-2 text-[#45a94a] font-semibold hover:text-[#38913e] transition-colors group/link"
                  >
                    <span>{treatment.ctaText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No treatments found matching your search.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-[#45a94a] font-semibold hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </section>
  );
}