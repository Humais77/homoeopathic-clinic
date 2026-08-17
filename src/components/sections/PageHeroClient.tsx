
'use client';

import Image from 'next/image';
import { ReactNode } from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumb?: { label: string; href: string }[];
  backgroundImage?: string;
  children?: ReactNode;
}

export function PageHeroClient({
  title,
  subtitle,
  description,
  backgroundImage = '/images/Hero-bg.jpg',
  children,
}: PageHeroProps) {
  return (
    <section className="relative h-[300px] md:h-[350px] overflow-hidden flex items-center justify-center">
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        {/* Blue/Purple Overlay */}
        <div className="absolute inset-0 bg-[#202060]/80" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full px-4 text-center">
        <div className="mx-auto max-w-4xl">

          {/* Small Heading */}
          {subtitle && (
            <p className="mb-3 text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-white/90">
              {subtitle}
            </p>
          )}

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-[48px] font-bold leading-tight text-white">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="mx-auto mt-3 max-w-3xl text-sm md:text-base leading-relaxed text-white/85">
              {description}
            </p>
          )}

          {/* Optional Children */}
          {children && (
            <div className="mt-5">
              {children}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

