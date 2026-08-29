
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";
import {
  NAV_LINKS,
  ABOUT_DROPDOWN_LINKS,
} from "@/src/lib/constants";
import { Dropdown } from "./Dropdown";
import { useAuth } from "@/src/context/AuthContext";

export function HeaderClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [isMobileAboutOpen, setIsMobileAboutOpen] =
    useState(false);

  const [isProfileOpen, setIsProfileOpen] =
    useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const profileRef =
    useRef<HTMLDivElement>(null);

  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    isAdmin,
    isDoctor,
    isUser,
  } = useAuth();

  /**
   * Close profile dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /**
   * Close menus when route changes
   */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileAboutOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  /**
   * Lock body scroll when mobile menu is open
   */
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isAboutActive =
    ABOUT_DROPDOWN_LINKS.some(
      (link) => link.href === pathname
    );

  const toggleMenu = () => {
    setIsMobileMenuOpen(
      (previous) => !previous
    );
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileAboutOpen(false);
  };

  /**
   * Toggle mobile About Us submenu
   */
  const toggleMobileAbout = () => {
    setIsMobileAboutOpen(
      (previous) => !previous
    );
  };

  /**
   * Get dashboard according to role
   */
  const getDashboardPath = () => {
    if (isAdmin) {
      return "/admin/dashboard";
    }

    if (isDoctor) {
      return "/doctor/dashboard";
    }

    return "/user/dashboard";
  };

  /**
   * Get dashboard label according to role
   */
  const getDashboardLabel = () => {
    if (isAdmin) {
      return "Admin Dashboard";
    }

    if (isDoctor) {
      return "Doctor Dashboard";
    }

    return "My Dashboard";
  };

  /**
   * Logout
   */
  const handleLogout = async () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileAboutOpen(false);

    await logout();

    router.push("/");
    router.refresh();
  };

  /**
   * Profile click
   */
  const handleProfileClick = () => {
    setIsProfileOpen(
      (previous) => !previous
    );
  };

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "bg-white shadow-sm"
        )}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-20">

            {/* =================================================
                LOGO
            ================================================= */}
            <Link
              href="/"
              className="flex items-center shrink-0"
              onClick={closeMenu}
            >
              <Image
                src="/images/Logo.png"
                alt="Heal By Nature"
                width={70}
                height={70}
                className="h-[107px] w-[106px] object-contain"
                priority
              />
            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================= */}
            <nav className="hidden lg:flex items-center gap-8 ml-auto mr-8">
              {NAV_LINKS.map((link) => {
                if (link.href === "/about") {
                  return (
                    <Dropdown
                      key={link.href}
                      label={link.label}
                      href={link.href}
                      links={ABOUT_DROPDOWN_LINKS}
                      isActive={
                        isAboutActive ||
                        pathname === link.href
                      }
                    />
                  );
                }

                const isActive =
                  pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative font-medium text-sm transition-colors duration-200",
                      isActive
                        ? "text-primary-600"
                        : "text-gray-700 hover:text-primary-600"
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

            {/* =================================================
                RIGHT SIDE
            ================================================= */}
            <div className="flex items-center gap-3">

              {/* Online Consultation */}
              <Link
                href="/consultation"
                className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-primary-500/30"
              >
                Online Consultation
              </Link>

              {/* =================================================
                  DESKTOP AUTH
              ================================================= */}
              {!isLoading && (
                <div className="hidden lg:flex items-center">

                  {!isAuthenticated ? (
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Login
                    </Link>
                  ) : (
                    <div
                      ref={profileRef}
                      className="relative"
                    >
                      {/* Profile Button */}
                      <button
                        type="button"
                        onClick={
                          handleProfileClick
                        }
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </span>

                        <span className="max-w-[110px] truncate text-sm font-medium text-gray-700">
                          {user?.name}
                        </span>

                        <svg
                          className={cn(
                            "w-4 h-4 text-gray-500 transition-transform",
                            isProfileOpen &&
                              "rotate-180"
                          )}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Profile Dropdown */}
                      {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">

                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="font-semibold text-gray-900 truncate">
                              {user?.name}
                            </p>

                            <p className="text-xs text-gray-500 truncate mt-1">
                              {user?.email}
                            </p>

                            <p className="text-xs text-primary-600 font-medium mt-1 capitalize">
                              {user?.role?.toLowerCase()}
                            </p>
                          </div>

                          <Link
                            href={getDashboardPath()}
                            onClick={() =>
                              setIsProfileOpen(
                                false
                              )
                            }
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 13h8V3H3v10zM13 21h8v-8h-8v8zM13 3v6h8V3h-8zM3 21h8v-6H3v6z"
                              />
                            </svg>

                            {getDashboardLabel()}
                          </Link>

                          <button
                            type="button"
                            onClick={
                              handleLogout
                            }
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>

                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* =================================================
                  MOBILE MENU BUTTON
              ================================================= */}
              <button
                type="button"
                onClick={toggleMenu}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
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

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={closeMenu}
        >
          <div
            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Mobile Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <Link
                href="/"
                onClick={closeMenu}
              >
                <Image
                  src="/images/Logo.png"
                  alt="Heal By Nature"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              </Link>

              <button
                type="button"
                onClick={closeMenu}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="p-5 flex flex-col gap-5">

              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href;

                if (link.href === "/about") {
                  return (
                    <div
                      key={link.href}
                      className="flex flex-col"
                    >
                      {/* About Us Header */}
                      <div className="flex items-center justify-between">
                        <Link
                          href={link.href}
                          onClick={closeMenu}
                          className={cn(
                            "text-lg font-medium",
                            isActive ||
                              isAboutActive
                              ? "text-primary-600"
                              : "text-gray-700"
                          )}
                        >
                          {link.label}
                        </Link>

                        {/* Arrow */}
                        <button
                          type="button"
                          onClick={
                            toggleMobileAbout
                          }
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          aria-label="Toggle About Us submenu"
                          aria-expanded={
                            isMobileAboutOpen
                          }
                        >
                          <svg
                            className={cn(
                              "w-5 h-5 text-gray-600 transition-transform duration-200",
                              isMobileAboutOpen &&
                                "rotate-180"
                            )}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* About Us Submenu */}
                      {isMobileAboutOpen && (
                        <div className="flex flex-col gap-3 pl-4 mt-3 border-l-2 border-gray-200">
                          {ABOUT_DROPDOWN_LINKS.map(
                            (
                              dropdownLink
                            ) => {
                              const isDropdownActive =
                                pathname ===
                                dropdownLink.href;

                              return (
                                <Link
                                  key={
                                    dropdownLink.href
                                  }
                                  href={
                                    dropdownLink.href
                                  }
                                  onClick={
                                    closeMenu
                                  }
                                  className={cn(
                                    "text-sm",
                                    isDropdownActive
                                      ? "text-primary-600 font-medium"
                                      : "text-gray-500 hover:text-primary-600"
                                  )}
                                >
                                  {
                                    dropdownLink.label
                                  }
                                </Link>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className={cn(
                      "text-lg font-medium",
                      isActive
                        ? "text-primary-600"
                        : "text-gray-700"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile Consultation */}
              <Link
                href="/consultation"
                onClick={closeMenu}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Online Consultation
              </Link>

              {/* =================================================
                  MOBILE AUTH
              ================================================= */}
              {!isLoading && (
                <div className="pt-4 border-t border-gray-200">

                  {!isAuthenticated ? (
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                    >
                      Login
                    </Link>
                  ) : (
                    <div className="space-y-3">

                      {/* Profile Info */}
                      <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7H5a7 7 0 017-7z"
                            />
                          </svg>
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {user?.name}
                          </p>

                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>

                          <p className="text-xs text-primary-600 font-medium capitalize mt-1">
                            {user?.role?.toLowerCase()}
                          </p>
                        </div>
                      </div>

                      {/* Dashboard */}
                      <Link
                        href={getDashboardPath()}
                        onClick={closeMenu}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 13h8V3H3v10zM13 21h8v-8h-8v8zM13 3v6h8V3h-8zM3 21h8v-6H3v6z"
                          />
                        </svg>

                        {getDashboardLabel()}
                      </Link>

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={
                          handleLogout
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>

                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}