"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import {
  UserButton,
} from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "Directory" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-primary/15 bg-surface-glass shadow-lg shadow-primary-dark/10 backdrop-blur-2xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:grid md:grid-cols-3">
        {/* Logo */}
        <div className="flex justify-start">
          <Link
            href="/"
            id="navbar-logo"
            className="group flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary transition-transform duration-300 group-hover:scale-110">
              <span className="font-heading text-lg font-extrabold text-text-primary leading-none">Y</span>
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-text-primary">
              Dhaka
              <span className="text-secondary">Founders</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden justify-center md:flex">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              // If user is not signed in and link is /dashboard, point to sign-up
              const href =
                link.href === "/dashboard" && isLoaded && !isSignedIn
                  ? "/sign-up"
                  : link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={href}
                    id={`nav-link-${link.label.toLowerCase()}`}
                    className={`relative rounded-lg px-4 py-2 font-body text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-secondary"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-secondary" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Section: Desktop Auth Controls & Mobile Menu Toggle */}
        <div className="flex items-center justify-end gap-3">
          {/* Desktop Auth Controls */}
          <div className="hidden items-center gap-3 md:flex">
            {isLoaded && isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-primary/20",
                  },
                }}
              />
            ) : isLoaded ? (
              <>
                <Link
                  href="/sign-in"
                  id="navbar-signin"
                  className="rounded-lg px-4 py-2.5 font-body text-sm font-medium text-text-secondary transition-all duration-200 hover:text-text-primary hover:bg-surface-elevated"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  id="navbar-signup"
                  className="rounded-lg bg-primary px-5 py-2.5 font-body text-sm font-semibold text-text-primary transition-all duration-200 hover:bg-primary-light hover:shadow-lg hover:shadow-primary/25"
                >
                  Get Started
                </Link>
              </>
            ) : (
              /* Skeleton while Clerk loads */
              <div className="h-9 w-20 animate-pulse rounded-lg bg-surface-elevated" />
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        id="mobile-drawer"
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-4 mb-4 rounded-xl border border-primary/15 bg-surface-glass p-4 backdrop-blur-2xl">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const href =
                link.href === "/dashboard" && isLoaded && !isSignedIn
                  ? "/sign-up"
                  : link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={href}
                    className={`block rounded-lg px-4 py-3 font-body text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/15 text-secondary"
                        : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 border-t border-primary/10 pt-3">
            {isLoaded && isSignedIn ? (
              <div className="flex items-center justify-center py-2">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9 ring-2 ring-primary/20",
                    },
                  }}
                />
              </div>
            ) : isLoaded ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/sign-in"
                  className="block w-full rounded-lg border border-primary/20 py-3 text-center font-body text-sm font-medium text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="block w-full rounded-lg bg-primary py-3 text-center font-body text-sm font-semibold text-text-primary transition-all duration-200 hover:bg-primary-light"
                >
                  Get Started
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
