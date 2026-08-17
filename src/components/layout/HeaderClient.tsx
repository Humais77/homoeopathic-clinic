'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { NAV_LINKS } from '@/src/lib/constants'; // Import from constants

// REMOVE this local definition
// const NAV_LINKS = [
//   { href: '/', label: 'Home' },
//   { href: '/about', label: 'About Us' },
//   { href: '/treatments', label: 'Treatments' },
//   { href: '/doctors', label: 'Doctors' },
//   { href: '/contact', label: 'Contact Us' },
// ];

export function HeaderClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          'bg-white py-4'
        )}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                HC
              </div>
              <span className="text-xl font-bold whitespace-nowrap">
                <span className="text-primary-600">Homoeopathic</span>
                <span className="text-gray-800">Clinic</span>
              </span>
            </Link>

            {/* Desktop Navigation - Using NAV_LINKS from constants */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'relative font-medium text-sm transition-colors duration-200',
                      isActive
                        ? 'text-primary-600'
                        : 'text-gray-700 hover:text-primary-600'
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-primary-600 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Online Consultation Button */}
            <Link
              href="/consultation"
              className="hidden lg:inline-flex items-center justify-center px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-primary-500/30 shrink-0"
            >
              Online Consultation
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 animate-fade-in" 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl p-6 overflow-y-auto animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-bold text-primary-600">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation - Using NAV_LINKS from constants */}
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'text-lg font-medium transition-colors',
                      isActive
                        ? 'text-primary-600'
                        : 'text-gray-700 hover:text-primary-600'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/consultation"
                className="mt-4 inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors text-center"
              >
                Online Consultation
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}