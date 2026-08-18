'use client';

import { ABOUT_MISSION_VISION } from '@/src/lib/constants';

export function AboutMissionVisionClient() {
  return (
    <section className="py-16 md:py-20 bg-[#11183f]">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
          {/* Mission */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-[#11136b]/10 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#11136b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {ABOUT_MISSION_VISION.mission.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {ABOUT_MISSION_VISION.mission.description}
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-[#11136b]/10 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#11136b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {ABOUT_MISSION_VISION.vision.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {ABOUT_MISSION_VISION.vision.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}