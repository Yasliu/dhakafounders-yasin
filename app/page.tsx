"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  ArrowRight,
  Search,
  Users,
  Rocket,
  TrendingUp,
  Globe,
  Zap,
  Sparkles,
} from "lucide-react";

/* ── Hero Headlines from Brand DNA ─────────────────────────────────── */
const HEADLINES = [
  "Uniting the Builders of Our Tech Future.",
  "Where Innovators, Investors, and Founders Connect.",
  "The Central Hub for Our Startup Ecosystem.",
] as const;

/* ── Stats Data ────────────────────────────────────────────────────── */
const STATS = [
  { label: "Active Founders", value: 250, suffix: "+" },
  { label: "Startups Listed", value: 120, suffix: "+" },
  { label: "Investors Connected", value: 45, suffix: "+" },
  { label: "Monthly Visitors", value: 10, suffix: "K+" },
] as const;

/* ── Features ──────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Search,
    title: "Discover",
    description:
      "Explore a curated directory of Bangladesh's most promising startups — filtered by industry, stage, and location.",
  },
  {
    icon: Users,
    title: "Connect",
    description:
      "Build meaningful relationships with founders, mentors, and investors who are shaping the local tech scene.",
  },
  {
    icon: TrendingUp,
    title: "Grow",
    description:
      "Access resources, track your startup's progress, and leverage community insights to scale faster.",
  },
] as const;

/* ── Animated Counter Hook ─────────────────────────────────────────── */
function useAnimatedCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);

  return { count, ref };
}

/* ── Hero Section ──────────────────────────────────────────────────── */
function HeroSection() {
  const [activeHeadline, setActiveHeadline] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHeadline((prev) => (prev + 1) % HEADLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero-section"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Radial gradient */}
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-secondary/6 blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(82,121,111,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(82,121,111,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface-card px-4 py-2 animate-fade-in">
          <Sparkles className="h-4 w-4 text-secondary" />
          <span className="font-body text-xs font-medium text-text-secondary">
            Bangladesh&apos;s Premier Startup Platform
          </span>
        </div>

        {/* Cycling Headlines */}
        <div className="grid grid-cols-1 grid-rows-1 mb-10">
          {HEADLINES.map((headline, index) => (
            <h1
              key={index}
              className={`col-start-1 row-start-1 font-heading text-3xl font-bold leading-tight tracking-tight transition-all duration-700 sm:text-4xl md:text-5xl lg:text-6xl ${
                index === activeHeadline
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              <span className="gradient-text">{headline}</span>
            </h1>
          ))}
        </div>

        {/* Subtext */}
        <p className="mx-auto mb-10 max-w-2xl font-body text-lg leading-relaxed text-text-secondary animate-slide-up">
          Discover, connect with, and support the founders building
          Bangladesh&apos;s next generation of technology companies. Your
          ecosystem starts here.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Link
            href="/directory"
            id="hero-cta-primary"
            className="group flex items-center gap-2.5 rounded-xl bg-primary px-8 py-4 font-body text-sm font-semibold text-text-primary shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary-light hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            Explore the Directory
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/dashboard"
            id="hero-cta-secondary"
            className="group flex items-center gap-2.5 rounded-xl border border-primary/20 bg-surface-card px-8 py-4 font-body text-sm font-semibold text-text-primary transition-all duration-300 hover:border-primary/40 hover:bg-surface-elevated hover:-translate-y-0.5"
          >
            Join as Founder
            <Rocket className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Headline dots */}
        <div className="mt-12 flex items-center justify-center gap-2">
          {HEADLINES.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveHeadline(index)}
              aria-label={`Show headline ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeHeadline
                  ? "w-8 bg-secondary"
                  : "w-2 bg-primary-dark hover:bg-primary"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Stats Section ─────────────────────────────────────────────────── */
function StatsSection() {
  return (
    <section
      id="stats-section"
      className="relative border-y border-primary/10 bg-surface-card py-16"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}

function StatCard({
  stat,
}: {
  stat: { label: string; value: number; suffix: string };
}) {
  const { count, ref } = useAnimatedCounter(stat.value);
  return (
    <div ref={ref} className="text-center">
      <p className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
        {count}
        <span className="text-secondary">{stat.suffix}</span>
      </p>
      <p className="mt-1 font-body text-sm text-text-muted">{stat.label}</p>
    </div>
  );
}

/* ── Features Section ──────────────────────────────────────────────── */
function FeaturesSection() {
  return (
    <section id="features-section" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 font-body text-sm font-semibold uppercase tracking-widest text-secondary">
            Why DhakaFounders
          </p>
          <h2 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
            Everything you need to{" "}
            <span className="gradient-text">build &amp; scale</span>
          </h2>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-primary/10 bg-surface-card p-8 transition-all duration-300 hover:border-primary/25 hover:bg-surface-elevated hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 font-heading text-xl font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-text-muted">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Section ───────────────────────────────────────────────────── */
function CTASection() {
  return (
    <section id="cta-section" className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-surface-card p-12 text-center md:p-16">
          {/* BG Accents */}
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-secondary/8 blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/10 blur-[80px]" />

          <div className="relative z-10">
            <Globe className="mx-auto mb-6 h-10 w-10 text-secondary animate-pulse-soft" />
            <h2 className="mb-4 font-heading text-3xl font-bold text-text-primary md:text-4xl">
              Ready to join the ecosystem?
            </h2>
            <p className="mx-auto mb-8 max-w-lg font-body text-base text-text-secondary">
              List your startup, discover potential collaborators, and become
              part of the movement that&apos;s putting Dhaka on the global tech
              map.
            </p>
            <Link
              href="/dashboard"
              id="cta-join-button"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-secondary px-8 py-4 font-body text-sm font-semibold text-surface transition-all duration-300 hover:bg-secondary-light hover:shadow-lg hover:shadow-secondary/25 hover:-translate-y-0.5"
            >
              Get Started Today
              <Zap className="h-4 w-4 transition-transform group-hover:scale-110" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Page Export ────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
}
