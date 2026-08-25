'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { NAV_LINKS, ABOUT_DROPDOWN_LINKS } from '@/src/lib/constants';
import { Dropdown } from './Dropdown';
import { useAuth } from '@/src/context/AuthContext';
import { useUserAuth } from '@/src/context/UserAuthContext';

export function HeaderClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  // Admin auth
  const {
  user,
  isAuthenticated,
  isLoading,
  logout,
  isAdmin,
} = useAuth();
const handleLogin = () => {
  router.push("/login");
  closeMenu();
};

const handleLogout = async () => {
  await logout();

  router.push("/");
  closeMenu();
  router.refresh();
};
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobileMenuOpen]);

  // Check if any about dropdown link is active
  const isAboutActive = ABOUT_DROPDOWN_LINKS.some(link => link.href === pathname);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  

  const handleUserLogin = () => {
    router.push('/user/login');
    closeMenu();
  };

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
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/images/Logo.png"
                alt="Heal By Nature"
                width={50}
                height={50}
                className="h-12 w-12 object-contain"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => {
                if (link.href === '/about') {
                  return (
                    <Dropdown
                      key={link.href}
                      label={link.label}
                      href={link.href}
                      links={ABOUT_DROPDOWN_LINKS}
                      isActive={isAboutActive || pathname === link.href}
                    />
                  );
                }

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

            {/* Right Side Buttons */}
            <div className="flex items-center gap-3">
              {/* Online Consultation Button */}
              <Link
                href="/consultation"
                className="hidden lg:inline-flex items-center justify-center px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-primary-500/30 shrink-0"
              >
                Online Consultation
              </Link>

              {!isLoading && (
  <div className="hidden lg:flex items-center gap-2">

    {isAuthenticated ? (
      <>
        <span className="text-sm text-gray-700 font-medium max-w-[120px] truncate">
          Hi, {user?.name}
        </span>

        {isAdmin && (
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors text-sm"
          >
            Dashboard
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-sm"
        >
          Logout
        </button>
      </>
    ) : (
      <button
        onClick={handleLogin}
        className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        Login
      </button>
    )}

  </div>
)}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
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
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 animate-fade-in" 
          onClick={closeMenu}
        >
          <div
            className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl p-6 overflow-y-auto animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <Link href="/" onClick={closeMenu}>
                <Image
                  src="/images/Logo.png"
                  alt="Heal By Nature"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              </Link>
              <button
                onClick={closeMenu}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                
                if (link.href === '/about') {
                  return (
                    <div key={link.href} className="flex flex-col gap-3">
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className={cn(
                          'text-lg font-medium transition-colors',
                          isActive || isAboutActive
                            ? 'text-primary-600'
                            : 'text-gray-700 hover:text-primary-600'
                        )}
                      >
                        {link.label}
                      </Link>
                      <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-200">
                        {ABOUT_DROPDOWN_LINKS.map((dropdownLink) => {
                          const isDropdownActive = pathname === dropdownLink.href;
                          return (
                            <Link
                              key={dropdownLink.href}
                              href={dropdownLink.href}
                              onClick={closeMenu}
                              className={cn(
                                'text-sm transition-colors',
                                isDropdownActive
                                  ? 'text-primary-600 font-medium'
                                  : 'text-gray-500 hover:text-primary-600'
                              )}
                            >
                              {dropdownLink.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
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

              {/* Mobile Consultation Button */}
              <Link
                href="/consultation"
                onClick={closeMenu}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors text-center"
              >
                Online Consultation
              </Link>

              {/* Mobile User Auth Buttons */}
              

              {/* Mobile Admin Login/Logout Button */}
              
            </nav>
          </div>
        </div>
      )}
    </>
  );
}