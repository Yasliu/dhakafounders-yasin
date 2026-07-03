"use client";

import { useState } from "react";
import {
  Rocket,
  Globe,
  Link2,
  Mail,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  User,
  X,
  Plus,
  Settings,
  Loader2,
  Camera,
} from "lucide-react";
import {
  saveStartupProfile,
  deleteStartup,
  saveFounderProfile,
  deleteAccount,
  StartupInput,
  FounderProfileInput,
} from "@/app/actions/startup";

const CATEGORIES = [
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

interface DashboardClientProps {
  user: {
    firstName: string | null;
    lastName: string | null;
    emailAddress: string;
  };
  initialProfile: any | null;
  initialStartups: any[];
}

export function DashboardClient({ user, initialProfile, initialStartups }: DashboardClientProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [startups, setStartups] = useState(initialStartups);

  // Form display toggles
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingStartupId, setEditingStartupId] = useState<string | null>(null); // ID of startup to edit, or "new" to create
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Founder Profile Form states
  const [profileName, setProfileName] = useState(profile?.name || `${user.firstName || ""} ${user.lastName || ""}`.trim());
  const [profileEmail, setProfileEmail] = useState(profile?.email || user.emailAddress || "");
  const [profileBio, setProfileBio] = useState(profile?.bio || "");
  const [profileLinkedin, setProfileLinkedin] = useState(profile?.linkedin_url || "");
  const [profilePortfolio, setProfilePortfolio] = useState(profile?.portfolio_url || "");
  const [profileAvatar, setProfileAvatar] = useState(profile?.avatar_url || "");
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Startup Form states
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [category, setCategory] = useState("Software");
  const [description, setDescription] = useState("");
  const [founderName, setFounderName] = useState(profileName);
  const [founderEmail, setFounderEmail] = useState(profileEmail);
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const input: FounderProfileInput = {
      name: profileName.trim(),
      email: profileEmail.trim(),
      bio: profileBio.trim(),
      linkedin_url: profileLinkedin.trim(),
      portfolio_url: profilePortfolio.trim(),
      avatar_url: profileAvatar.trim(),
    };

    try {
      const saved = await saveFounderProfile(input);
      setProfile(saved);
      setIsEditingProfile(false);
      setFounderName(saved.name);
      setFounderEmail(saved.email || "");
      setAvatarLoadFailed(false);
      setMessage({ type: "success", text: "Founder profile updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleStartupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const input: StartupInput = {
      company_name: companyName.trim(),
      website_url: websiteUrl.trim(),
      category,
      description: description.trim(),
      founder_name: founderName.trim(),
      founder_email: founderEmail.trim(),
      linkedin_url: linkedinUrl.trim(),
    };

    const isNew = editingStartupId === "new";

    try {
      const saved = await saveStartupProfile(input, isNew ? undefined : (editingStartupId || undefined));
      if (isNew) {
        setStartups([saved, ...startups]);
      } else {
        setStartups(startups.map((s) => (s.id === editingStartupId ? saved : s)));
      }
      setEditingStartupId(null);
      setMessage({
        type: "success",
        text: isNew ? "New startup listed successfully!" : "Startup details updated successfully!",
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save startup details." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStartup = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from your listings?`)) {
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await deleteStartup(id);
      setStartups(startups.filter((s) => s.id !== id));
      setMessage({ type: "success", text: `"${name}" removed successfully.` });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete startup." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText !== "DELETE") return;

    setLoading(true);
    setIsDeletingAccount(false);
    setMessage(null);

    try {
      await deleteAccount();
      // Force clean reload redirect to landing page to completely clear Clerk auth status
      window.location.href = "/";
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete account." });
      setLoading(false);
    }
  };

  const startEditStartup = (s: any) => {
    setEditingStartupId(s.id);
    setCompanyName(s.company_name || "");
    setWebsiteUrl(s.website_url || "");
    setCategory(s.category || "Software");
    setDescription(s.description || "");
    setFounderName(s.founder_name || profileName);
    setFounderEmail(s.founder_email || profileEmail);
    setLinkedinUrl(s.linkedin_url || "");
  };

  const startNewStartup = () => {
    setEditingStartupId("new");
    setCompanyName("");
    setWebsiteUrl("");
    setCategory("Software");
    setDescription("");
    setFounderName(profileName);
    setFounderEmail(profileEmail);
    setLinkedinUrl("");
  };

  const profileInitials = profileName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-6 relative">
      {/* Smooth Loading Spinner Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md transition-opacity duration-300">
          <div className="flex flex-col items-center rounded-2xl border border-primary/10 bg-surface-card p-8 shadow-2xl shadow-primary/20">
            <Loader2 className="h-12 w-12 animate-spin text-secondary" />
            <p className="mt-4 font-heading text-base font-semibold text-text-primary">
              Processing request...
            </p>
            <p className="mt-1 font-body text-xs text-text-muted">
              Updating database records, please wait.
            </p>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {isDeletingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md px-4">
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/25 bg-surface-card p-6 shadow-2xl shadow-red-500/5 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setIsDeletingAccount(false);
                setDeleteConfirmText("");
              }}
              className="absolute right-4 top-4 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h2 className="font-heading text-lg font-bold text-red-400">
                Delete Your Account?
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-text-secondary">
                This will permanently delete your founder profile and **all listed startups** from Dhaka Founders. This action is irreversible.
              </p>
            </div>

            <form onSubmit={handleDeleteAccount} className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Type <span className="text-red-400 font-bold">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full rounded-xl border border-red-500/20 bg-surface px-4 py-3 font-body text-sm text-text-primary outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={deleteConfirmText !== "DELETE"}
                  className="flex-1 rounded-xl bg-red-500 py-3 font-body text-sm font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-red-500"
                >
                  Delete Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeletingAccount(false);
                    setDeleteConfirmText("");
                  }}
                  className="rounded-xl border border-primary/20 px-5 py-3 font-body text-sm font-medium text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="mb-12 flex flex-col justify-between gap-6 border-b border-primary/10 pb-8 md:flex-row md:items-end">
        <div>
          <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-secondary">
            Overview
          </p>
          <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
            Welcome back, <span className="gradient-text">{profileName || "Founder"}</span>!
          </h1>
          <p className="mt-2 font-body text-base text-text-secondary">
            Manage your professional profile and register multiple ventures in the directory.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsEditingProfile(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-surface/50 px-5 py-3 font-body text-sm font-semibold text-text-secondary transition-all duration-200 hover:bg-surface hover:text-text-primary hover:border-primary/40"
          >
            <User className="h-4.5 w-4.5 text-secondary" />
            Edit Profile
          </button>
          <button
            onClick={() => setIsDeletingAccount(true)}
            className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-red-500/20 bg-surface/50 text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:border-red-500/40"
            title="Delete Account"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={startNewStartup}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-body text-sm font-semibold text-text-primary transition-all duration-200 hover:bg-primary-light hover:shadow-lg hover:shadow-primary/25"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Add Startup
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`mb-8 flex items-start gap-3 rounded-xl border p-4 font-body text-sm ${
            message.type === "success"
              ? "border-primary/25 bg-primary/10 text-primary-light"
              : "border-red-500/25 bg-red-500/10 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Editing Section */}
      {isEditingProfile && (
        <div className="mb-8 rounded-2xl border border-secondary/20 bg-surface-card p-6 md:p-8 shadow-xl shadow-secondary/5">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-text-primary">
              Edit Founder Profile
            </h2>
            <button
              onClick={() => setIsEditingProfile(false)}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
            {/* Top Row: Avatar upload circle at left, Display Name & Email at right */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center border-b border-primary/10 pb-6">
              {/* Circular Avatar Picker */}
              <div className="relative group flex flex-col items-center shrink-0">
                <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-primary/20 border border-primary/10 bg-surface flex items-center justify-center">
                  {profileAvatar ? (
                    <img
                      src={profileAvatar}
                      alt="Avatar Preview"
                      className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-40"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary/15 font-heading text-3xl font-bold text-secondary transition-opacity duration-300 group-hover:opacity-40">
                      {profileInitials}
                    </div>
                  )}
                  {/* Camera Hover Overlay */}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200 text-center p-1"
                  >
                    <Camera className="h-5 w-5 text-white mb-1" />
                    <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
                      Upload
                    </span>
                  </label>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  id="avatar-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {profileAvatar && (
                  <button
                    type="button"
                    onClick={() => setProfileAvatar("")}
                    className="mt-2 text-[10px] font-body font-semibold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              {/* Display Name & Email fields */}
              <div className="flex-1 grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Display Name <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-xl border border-primary/10 bg-surface px-4 py-3 font-body text-sm text-text-primary outline-none transition-all focus:border-primary/30"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full rounded-xl border border-primary/10 bg-surface px-4 py-3 font-body text-sm text-text-primary outline-none transition-all focus:border-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Social Links Row */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Portfolio or Personal Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://myportfolio.com"
                  value={profilePortfolio}
                  onChange={(e) => setProfilePortfolio(e.target.value)}
                  className="w-full rounded-xl border border-primary/10 bg-surface px-4 py-3 font-body text-sm text-text-primary outline-none transition-all focus:border-primary/30"
                />
              </div>
              <div>
                <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={profileLinkedin}
                  onChange={(e) => setProfileLinkedin(e.target.value)}
                  className="w-full rounded-xl border border-primary/10 bg-surface px-4 py-3 font-body text-sm text-text-primary outline-none transition-all focus:border-primary/30"
                />
              </div>
            </div>

            {/* Professional Bio */}
            <div>
              <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Professional Bio
              </label>
              <textarea
                rows={3}
                placeholder="Share your founder journey, expertise, and what drives you to build..."
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                className="w-full rounded-xl border border-primary/10 bg-surface px-4 py-3 font-body text-sm text-text-primary outline-none transition-all focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {/* Fallback URL Input */}
            <div className="border-t border-primary/10 pt-4">
              <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Or enter remote image URL (optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/my-photo.jpg"
                value={profileAvatar.startsWith("data:") ? "" : profileAvatar}
                onChange={(e) => setProfileAvatar(e.target.value)}
                className="w-full rounded-xl border border-primary/10 bg-surface px-4 py-3 font-body text-sm text-text-primary outline-none transition-all focus:border-primary/30"
              />
            </div>

            <div className="flex gap-3 border-t border-primary/10 pt-6">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-primary py-3 font-body text-sm font-semibold text-text-primary transition-all duration-200 hover:bg-primary-light hover:shadow-lg"
              >
                Save Profile Details
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="rounded-xl border border-primary/20 px-6 py-3 font-body text-sm font-medium text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Startup Editor Section */}
      {editingStartupId && (
        <div className="mb-8 rounded-2xl border border-primary/15 bg-surface-card p-6 md:p-8 shadow-xl shadow-primary/5">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-text-primary">
              {editingStartupId === "new" ? "List a New Startup" : "Edit Startup details"}
            </h2>
            <button
              onClick={() => setEditingStartupId(null)}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleStartupSubmit} className="flex flex-col gap-6">
            <div>
              <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Company Name <span className="text-secondary">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. PayBangla"
                className="w-full rounded-xl border border-primary/10 bg-surface px-4 py-3 font-body text-sm text-text-primary outline-none transition-all focus:border-primary/30"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Category / Industry
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-primary/10 bg-surface px-4 py-3 font-body text-sm text-text-primary outline-none transition-all focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Website URL
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="e.g. https://paybangla.com"
                  className="w-full rounded-xl border border-primary/10 bg-surface px-4 py-3 font-body text-sm text-text-primary outline-none transition-all focus:border-primary/30"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Founder Name <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  className="w-full rounded-xl border border-primary/10 bg-surface px-4 py-3 font-body text-sm text-text-primary outline-none transition-all focus:border-primary/30"
                />
              </div>
              <div>
                <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Founder Contact Email
                </label>
                <input
                  type="email"
                  value={founderEmail}
                  onChange={(e) => setFounderEmail(e.target.value)}
                  className="w-full rounded-xl border border-primary/10 bg-surface px-4 py-3 font-body text-sm text-text-primary outline-none transition-all focus:border-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Company LinkedIn URL
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/company/paybangla"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full rounded-xl border border-primary/10 bg-surface px-4 py-3 font-body text-sm text-text-primary outline-none transition-all focus:border-primary/30"
              />
            </div>

            <div>
              <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Description / Pitch
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what your startup does, your mission, and the problem you solve..."
                className="w-full rounded-xl border border-primary/10 bg-surface px-4 py-3 font-body text-sm text-text-primary outline-none transition-all focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div className="flex gap-3 border-t border-primary/10 pt-6">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-primary py-3 font-body text-sm font-semibold text-text-primary transition-all duration-200 hover:bg-primary-light hover:shadow-lg"
              >
                Save Startup Profile
              </button>
              <button
                type="button"
                onClick={() => setEditingStartupId(null)}
                className="rounded-xl border border-primary/20 px-6 py-3 font-body text-sm font-medium text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Founder Public Card Display & Bio */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-primary/15 bg-surface-card p-6 shadow-xl shadow-primary/5">
            <div className="flex flex-col items-center text-center border-b border-primary/10 pb-6">
              {/* Profile Image or Initials Avatar */}
              {profile?.avatar_url && !avatarLoadFailed ? (
                <img
                  src={profile.avatar_url}
                  alt={profileName}
                  className="mb-4 h-20 w-20 rounded-full object-cover ring-4 ring-secondary/10 border border-primary/20 shadow-md"
                  onError={() => {
                    setAvatarLoadFailed(true);
                  }}
                />
              ) : (
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/15 font-heading text-2xl font-bold text-secondary ring-4 ring-secondary/10">
                  {profileInitials}
                </div>
              )}
              <h2 className="font-heading text-xl font-bold text-text-primary">
                {profileName}
              </h2>
              <p className="font-body text-sm text-text-muted mt-1">
                Dhaka Founder
              </p>

              {/* Founder Social Links */}
              <div className="mt-4 flex gap-3">
                {profileLinkedin && (
                  <a
                    href={profileLinkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/10 bg-surface text-text-muted hover:border-primary/20 hover:text-text-primary transition-all"
                  >
                    <Link2 className="h-4 w-4" />
                  </a>
                )}
                {profilePortfolio && (
                  <a
                    href={profilePortfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/10 bg-surface text-text-muted hover:border-primary/20 hover:text-text-primary transition-all"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
                {profileEmail && (
                  <a
                    href={`mailto:${profileEmail}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/10 bg-surface text-text-muted hover:border-primary/20 hover:text-text-primary transition-all"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Biography */}
            <div className="pt-6">
              <h3 className="mb-2 font-heading text-xs font-semibold uppercase tracking-wider text-text-muted">
                Biography
              </h3>
              <p className="font-body text-sm leading-relaxed text-text-secondary whitespace-pre-line">
                {profile?.bio || "No biography added yet. Click 'Edit Profile' to write a bio!"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: List of Startups */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-text-primary">
              Your Startups ({startups.length})
            </h2>
            <button
              onClick={startNewStartup}
              className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-secondary-light transition-colors"
            >
              <Plus className="h-4.5 w-4.5" />
              Add Another
            </button>
          </div>

          {startups.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {startups.map((s) => (
                <div
                  key={s.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-primary/10 bg-surface-card p-5 transition-all duration-200 hover:border-primary/20 hover:bg-surface-elevated"
                >
                  <div>
                    {/* Header: Title + Category */}
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="font-heading text-base font-bold text-text-primary group-hover:text-secondary transition-colors">
                          {s.company_name}
                        </h3>
                        <span className="mt-1 inline-block rounded-md border border-primary/15 bg-primary/8 px-2 py-0.5 font-body text-[10px] font-medium text-primary-light">
                          {s.category || "Uncategorized"}
                        </span>
                      </div>
                      <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditStartup(s)}
                          title="Edit Startup"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/10 bg-surface text-text-muted hover:border-primary/30 hover:text-text-primary hover:bg-surface-elevated transition-all"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStartup(s.id, s.company_name)}
                          title="Delete Startup"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/10 bg-surface text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mb-4 font-body text-xs leading-relaxed text-text-secondary line-clamp-3">
                      {s.description || "No description provided."}
                    </p>
                  </div>

                  {/* Actions / Links Row */}
                  <div className="flex items-center gap-2 border-t border-primary/5 pt-3 mt-auto">
                    {s.website_url && (
                      <a
                        href={s.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-body text-xs font-semibold text-secondary hover:text-secondary-light transition-colors"
                      >
                        <Globe className="h-3 w-3" />
                        Website
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                    {s.linkedin_url && (
                      <a
                        href={s.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-body text-xs font-semibold text-secondary hover:text-secondary-light transition-colors ml-3"
                      >
                        <Link2 className="h-3 w-3" />
                        LinkedIn
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-surface-card/40 py-16 px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-base font-bold text-text-primary">
                No Startups Registered Yet
              </h3>
              <p className="mx-auto mt-1 max-w-xs font-body text-xs text-text-secondary">
                You haven&apos;t listed any startups. Add your first startup now to show it on the directory!
              </p>
              <button
                onClick={startNewStartup}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-body text-xs font-semibold text-text-primary transition-colors hover:bg-primary-light"
              >
                <Plus className="h-4 w-4" />
                Add Your First Startup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
