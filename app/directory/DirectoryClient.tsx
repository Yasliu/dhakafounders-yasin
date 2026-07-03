"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Globe,
  Link2,
  Mail,
  ArrowUpRight,
  Briefcase,
  X,
  ExternalLink,
} from "lucide-react";

interface Startup {
  id: string;
  clerk_auth_key: string;
  company_name: string;
  website_url?: string;
  category?: string;
  description?: string;
  founder_name: string;
  founder_email?: string;
  linkedin_url?: string;
  created_at?: string;
  founder_avatar_url?: string | null;
}

const INDUSTRIES = [
  "All",
  "FinTech",
  "AgriTech",
  "EdTech",
  "HealthTech",
  "E-Commerce",
  "CleanTech",
  "Logistics",
  "HR Tech",
  "Software",
  "Other",
] as const;

interface DirectoryClientProps {
  initialStartups: Startup[];
}

export function DirectoryClient({ initialStartups }: DirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  const filteredStartups = initialStartups.filter((startup) => {
    const matchesSearch =
      startup.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (startup.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.founder_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry =
      selectedIndustry === "All" || startup.category === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const hasActiveFilters = selectedIndustry !== "All" || searchQuery !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedIndustry("All");
  };

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Header */}
      <div className="mb-10">
        <p className="mb-1 font-body text-sm font-semibold uppercase tracking-widest text-secondary">
          Directory
        </p>
        <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Discover Startups
        </h1>
        <p className="mt-2 font-body text-base text-text-secondary">
          Browse through authentic, builder-submitted ventures in Bangladesh&apos;s tech ecosystem.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div
        id="directory-filters"
        className="mb-8 rounded-2xl border border-primary/10 bg-surface-card p-5"
      >
        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            id="directory-search"
            type="text"
            placeholder="Search startups by name, description, or founder…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-primary/10 bg-surface py-3 pl-11 pr-4 font-body text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-start gap-6">
          {/* Industry Filter */}
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-text-muted" />
              <span className="font-body text-xs font-medium text-text-muted">
                Category
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((industry) => (
                <button
                  key={industry}
                  onClick={() => setSelectedIndustry(industry)}
                  className={`rounded-lg border px-3 py-1.5 font-body text-xs font-medium transition-all duration-200 ${
                    selectedIndustry === industry
                      ? "border-primary/40 bg-primary/15 text-primary-light"
                      : "border-primary/10 bg-surface text-text-muted hover:border-primary/25 hover:text-text-secondary"
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center gap-2 border-t border-primary/5 pt-4">
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs font-medium text-secondary transition-colors hover:bg-secondary/10"
            >
              <X className="h-3 w-3" />
              Clear all filters
            </button>
            <span className="font-body text-xs text-text-muted">
              {filteredStartups.length} result{filteredStartups.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Startup Cards Grid */}
      {filteredStartups.length > 0 ? (
        <div
          id="directory-grid"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredStartups.map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/10 bg-surface-card py-20">
          <Search className="mb-4 h-10 w-10 text-text-muted" />
          <p className="font-heading text-lg font-semibold text-text-primary">
            No startups found
          </p>
          <p className="mt-1 font-body text-sm text-text-muted">
            Try adjusting your search or filter criteria.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 rounded-lg bg-primary px-5 py-2 font-body text-sm font-medium text-text-primary transition-colors hover:bg-primary-light"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Startup Card Component ────────────────────────────────────────── */
function StartupCard({ startup }: { startup: Startup }) {
  const initials = startup.founder_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-primary/10 bg-surface-card p-6 transition-all duration-300 hover:border-primary/25 hover:bg-surface-elevated hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
      <div>
        {/* Top Row: Avatar + Title */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Founder Avatar */}
            {startup.founder_avatar_url ? (
              <img
                src={startup.founder_avatar_url}
                alt={startup.founder_name}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/10"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 font-heading text-sm font-bold text-primary-light ring-2 ring-primary/10">
                {initials || "F"}
              </div>
            )}
            <div>
              <h3 className="font-heading text-base font-semibold text-text-primary group-hover:text-secondary transition-colors">
                {startup.company_name}
              </h3>
              <p className="font-body text-xs text-text-muted">
                by{" "}
                <Link
                  href={`/founder/${startup.clerk_auth_key}`}
                  className="underline decoration-secondary/30 decoration-1 underline-offset-2 transition-colors hover:text-secondary hover:decoration-secondary"
                >
                  {startup.founder_name}
                </Link>
              </p>
            </div>
          </div>
          {startup.website_url && (
            <a
              href={startup.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted transition-colors hover:text-secondary"
            >
              <ArrowUpRight className="h-4.5 w-4.5" />
            </a>
          )}
        </div>

        {/* Tagline / Description */}
        <p className="mb-5 font-body text-sm leading-relaxed text-text-secondary line-clamp-3">
          {startup.description || "No description provided."}
        </p>
      </div>

      <div>
        {/* Badges */}
        <div className="mb-4 flex flex-wrap gap-2">
          {startup.category && (
            <span className="rounded-md border border-primary/15 bg-primary/8 px-2.5 py-1 font-body text-xs font-medium text-primary-light">
              {startup.category}
            </span>
          )}
        </div>

        {/* Social / Contact Links Row */}
        <div className="flex items-center gap-3 border-t border-primary/5 pt-4">
          {startup.website_url && (
            <a
              href={startup.website_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Website"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/10 bg-surface text-text-muted transition-all hover:border-primary/20 hover:text-text-primary hover:bg-surface-elevated"
            >
              <Globe className="h-4 w-4" />
            </a>
          )}
          {startup.linkedin_url && (
            <a
              href={startup.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/10 bg-surface text-text-muted transition-all hover:border-primary/20 hover:text-text-primary hover:bg-surface-elevated"
            >
              <Link2 className="h-4 w-4" />
            </a>
          )}
          {startup.founder_email && (
            <a
              href={`mailto:${startup.founder_email}`}
              title="Contact Founder"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/10 bg-surface text-text-muted transition-all hover:border-primary/20 hover:text-text-primary hover:bg-surface-elevated"
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
