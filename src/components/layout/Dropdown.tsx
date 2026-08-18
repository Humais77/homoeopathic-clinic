'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface DropdownLink {
  href: string;
  label: string;
}

interface DropdownProps {
  label: string;
  href: string;
  links: DropdownLink[];
  isActive?: boolean;
  className?: string;
}

export function Dropdown({ label, href, links, isActive, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <div className="flex items-center gap-1">
        {/* Main link - navigates to About page */}
        <Link
          href={href}
          className={cn(
            'relative font-medium text-sm transition-colors duration-200',
            isActive
              ? 'text-primary-600'
              : 'text-gray-700 hover:text-primary-600'
          )}
        >
          {label}
          {isActive && (
            <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-primary-600 rounded-full" />
          )}
        </Link>

        {/* Dropdown toggle button */}
        <button
          onClick={toggleDropdown}
          className={cn(
            'p-1 rounded-md transition-colors duration-200',
            isOpen
              ? 'text-primary-600 bg-primary-50'
              : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100'
          )}
          aria-label="Toggle dropdown"
          aria-expanded={isOpen}
        >
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 mt-2 min-w-[200px] bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50',
            'animate-fade-in-down',
            className
          )}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200',
                link.href === href && 'bg-primary-50 text-primary-600 font-medium'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}