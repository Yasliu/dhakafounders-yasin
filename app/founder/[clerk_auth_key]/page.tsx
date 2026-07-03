import { getPublicFounder } from "@/app/actions/startup";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Link2,
  Mail,
  ArrowUpRight,
  User,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface FounderPageProps {
  params: Promise<{
    clerk_auth_key: string;
  }>;
}

export default async function FounderPublicProfilePage({ params }: FounderPageProps) {
  const { clerk_auth_key } = await params;
  const data = await getPublicFounder(clerk_auth_key);

  if (!data || !data.founder) {
    notFound();
  }

  const { founder, startups } = data;

  const initials = founder.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 font-body text-sm font-semibold text-text-secondary hover:text-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Startup Directory
          </Link>
        </div>

        {/* Profile Card & Info Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Founder Profile Details */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-primary/10 bg-surface-card p-6 md:p-8 shadow-xl shadow-primary/5">
              <div className="flex flex-col items-center text-center border-b border-primary/10 pb-6">
                {/* Profile Image or Initials Avatar */}
                {founder.avatar_url ? (
                  <img
                    src={founder.avatar_url}
                    alt={founder.name}
                    className="mb-4 h-24 w-24 rounded-full object-cover ring-4 ring-secondary/10 border border-primary/20 shadow-md"
                  />
                ) : (
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-secondary/15 font-heading text-3xl font-bold text-secondary ring-4 ring-secondary/10">
                    {initials || "F"}
                  </div>
                )}
                <h1 className="font-heading text-2xl font-bold text-text-primary">
                  {founder.name}
                </h1>
                <p className="font-body text-sm text-text-muted mt-1">
                  Dhaka Founder
                </p>

                {/* Social Links */}
                <div className="mt-6 flex gap-3">
                  {founder.portfolio_url && (
                    <a
                      href={founder.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Portfolio Website"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-surface text-text-secondary hover:border-primary/20 hover:text-text-primary hover:bg-surface-elevated transition-all"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                  {founder.linkedin_url && (
                    <a
                      href={founder.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-surface text-text-secondary hover:border-primary/20 hover:text-text-primary hover:bg-surface-elevated transition-all"
                    >
                      <Link2 className="h-5 w-5" />
                    </a>
                  )}
                  {founder.email && (
                    <a
                      href={`mailto:${founder.email}`}
                      title="Email Founder"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-surface text-text-secondary hover:border-primary/20 hover:text-text-primary hover:bg-surface-elevated transition-all"
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              <div className="pt-6">
                <h3 className="mb-2 font-heading text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Biography
                </h3>
                <p className="font-body text-sm leading-relaxed text-text-secondary whitespace-pre-line">
                  {founder.bio || "No biography provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Startups Grid */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                Startups by {founder.name}
              </h2>
              <p className="font-body text-sm text-text-secondary mt-1">
                Explore the projects and products being built by this developer.
              </p>
            </div>

            {startups.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {startups.map((startup) => (
                  <div
                    key={startup.id}
                    className="group flex flex-col justify-between rounded-2xl border border-primary/10 bg-surface-card p-6 transition-all duration-300 hover:border-primary/25 hover:bg-surface-elevated hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div>
                      {/* Avatar + Title */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 font-heading text-sm font-bold text-primary-light ring-2 ring-primary/10">
                            {startup.company_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-heading text-base font-semibold text-text-primary group-hover:text-secondary transition-colors">
                              {startup.company_name}
                            </h3>
                            <span className="inline-block rounded-md border border-primary/15 bg-primary/8 px-2 py-0.5 font-body text-[10px] font-medium text-primary-light">
                              {startup.category || "Uncategorized"}
                            </span>
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

                      {/* Description */}
                      <p className="mb-5 font-body text-sm leading-relaxed text-text-secondary line-clamp-3">
                        {startup.description || "No description provided."}
                      </p>
                    </div>

                    {/* Footer Social / Contact Links Row */}
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
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/10 bg-surface-card py-20">
                <p className="font-heading text-lg font-semibold text-text-primary">
                  No startups listed yet
                </p>
                <p className="mt-1 font-body text-sm text-text-muted">
                  This founder has not listed any ventures in the directory yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
