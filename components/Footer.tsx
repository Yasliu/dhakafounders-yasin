"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, MessageCircle, Link2, Mail, ArrowUpRight, X } from "lucide-react";

const QUICK_LINKS = [
  { href: "/directory", label: "Startup Directory" },
  { href: "/dashboard", label: "Founder Dashboard" },
] as const;

const CONNECT_LINKS = [
  { label: "Twitter / X", icon: MessageCircle },
  { label: "LinkedIn", icon: Link2 },
  { label: "GitHub", icon: Globe },
  { label: "Email Us", icon: Mail },
] as const;

export function Footer() {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <>
      <footer
        id="main-footer"
        className="border-t border-primary/10 bg-surface-card"
      >
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 md:grid-cols-3">
            {/* About Column */}
            <div className="md:col-span-1">
              <Link href="/" className="group mb-5 inline-flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary transition-transform duration-300 group-hover:scale-110">
                  <span className="font-heading text-lg font-extrabold text-text-primary leading-none">Y</span>
                </div>
                <span className="font-heading text-xl font-bold tracking-tight text-text-primary">
                  Dhaka<span className="text-secondary">Founders</span>
                </span>
              </Link>
              <p className="mt-4 font-body text-sm leading-relaxed text-text-muted max-w-xs">
                Uniting the builders of Bangladesh&apos;s tech future. A
                collaborative platform where innovators, investors, and founders
                connect and grow together.
              </p>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 className="mb-5 font-heading text-sm font-semibold uppercase tracking-widest text-text-secondary">
                Quick Links
              </h4>
              <ul className="flex flex-col gap-3">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1.5 font-body text-sm text-text-muted transition-colors hover:text-secondary"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h4 className="mb-5 font-heading text-sm font-semibold uppercase tracking-widest text-text-secondary">
                Connect
              </h4>
              <ul className="flex flex-col gap-3">
                {CONNECT_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.label}>
                      <button
                        onClick={() => setPopupOpen(true)}
                        className="flex items-center gap-2.5 font-body text-sm text-text-muted transition-colors hover:text-secondary"
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-primary/10 pt-8 md:flex-row">
            <p className="font-body text-xs text-text-muted">
              &copy; {new Date().getFullYear()} DhakaFounders. All rights
              reserved.
            </p>
            <p className="font-body text-xs text-text-muted">
              Built with 🇧🇩 in Dhaka
            </p>
          </div>
        </div>
      </footer>

      {/* Coming Soon Popup */}
      {popupOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setPopupOpen(false)}
        >
          <div
            className="relative mx-4 w-full max-w-sm overflow-hidden rounded-2xl border border-primary/15 bg-surface-card p-8 shadow-2xl shadow-primary/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPopupOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Decorative glow */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-secondary/10 blur-[60px]" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-[60px]" />

            <div className="relative text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
                <Globe className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="mb-2 font-heading text-xl font-bold text-text-primary">
                We&apos;re Off the Map… For Now
              </h3>
              <p className="mb-6 font-body text-sm leading-relaxed text-text-muted">
                Our social channels are still under construction. We&apos;re
                building something special — check back soon to connect with us!
              </p>
              <button
                onClick={() => setPopupOpen(false)}
                className="rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-text-primary transition-all duration-200 hover:bg-primary-light hover:shadow-lg hover:shadow-primary/25"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
