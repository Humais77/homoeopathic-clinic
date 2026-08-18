'use client';

import { TESTIMONIALS } from '@/src/lib/constants';
import { cn } from '@/src/lib/utils';
import { Star } from 'lucide-react';

export function TestimonialsClient() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#10185C]  mb-4">
            {TESTIMONIALS.title}
          </h2>
          <p className="text-lg text-gray-600">
            {TESTIMONIALS.subtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TESTIMONIALS.testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "w-5 h-5 fill-current",
                      index < testimonial.rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>

              {/* Testimonial Content */}
              <p className="text-gray-700 text-base leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Client Info */}
              <div>
                <p className="font-semibold text-gray-900">
                  {testimonial.name}
                </p>
                <p className="text-sm text-gray-500">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}