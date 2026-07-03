"use server";

import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface StartupInput {
  company_name: string;
  website_url?: string;
  category?: string;
  description?: string;
  founder_name: string;
  founder_email?: string;
  linkedin_url?: string;
}

export interface FounderProfileInput {
  name: string;
  email?: string;
  bio?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  avatar_url?: string;
}

/**
 * Safely fetch Clerk token for Supabase template to avoid crashes if template is unconfigured.
 */
async function getSafeSupabaseToken(getToken: any): Promise<string | undefined> {
  try {
    const token = await getToken({ template: "supabase" });
    return token || undefined;
  } catch (error) {
    console.warn("Clerk 'supabase' JWT template not configured. Falling back to default auth headers.");
    return undefined;
  }
}

/* ── FOUNDER PROFILE ACTIONS ────────────────────────────────────────── */

/**
 * Fetch currently logged-in user's founder profile.
 * If it doesn't exist, create a default one from Clerk data.
 */
export async function getMyFounderProfile() {
  const { userId, getToken } = await auth();
  if (!userId) return null;

  const cookieStore = await cookies();
  const token = await getSafeSupabaseToken(getToken);
  const supabase = createClient(cookieStore, token);

  const { data, error } = await supabase
    .from("founder_profile")
    .select("*")
    .eq("clerk_auth_key", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") { // No rows returned, let's create a default one
      const user = await currentUser();
      if (!user) return null;

      const email = user.emailAddresses[0]?.emailAddress || "";
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Founder";
      const avatarUrl = user.imageUrl || "";

      const defaultProfile = {
        clerk_auth_key: userId,
        name,
        email,
        bio: "",
        linkedin_url: "",
        portfolio_url: "",
        avatar_url: avatarUrl,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from("founder_profile")
        .insert(defaultProfile)
        .select()
        .single();

      if (insertErr) {
        console.error("Error creating default founder profile:", insertErr);
        return null;
      }
      return inserted;
    }
    console.error("Error fetching founder profile:", error);
    return null;
  }

  return data;
}

/**
 * Save / Update currently logged-in user's founder profile
 */
export async function saveFounderProfile(input: FounderProfileInput) {
  const { userId, getToken } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!input.name) {
    throw new Error("Founder name is required");
  }

  const cookieStore = await cookies();
  const token = await getSafeSupabaseToken(getToken);
  const supabase = createClient(cookieStore, token);

  const payload = {
    clerk_auth_key: userId,
    name: input.name.trim(),
    email: input.email?.trim() || null,
    bio: input.bio?.trim() || null,
    linkedin_url: input.linkedin_url?.trim() || null,
    portfolio_url: input.portfolio_url?.trim() || null,
    avatar_url: input.avatar_url?.trim() || null,
  };

  const { data, error } = await supabase
    .from("founder_profile")
    .upsert(payload, { onConflict: "clerk_auth_key" })
    .select()
    .single();

  if (error) {
    console.error("Error saving founder profile:", error);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/directory");
  return data;
}

/**
 * Fetch a founder's public profile and all their startups
 */
export async function getPublicFounder(clerkAuthKey: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch founder profile
  const { data: founder, error: founderError } = await supabase
    .from("founder_profile")
    .select("*")
    .eq("clerk_auth_key", clerkAuthKey)
    .single();

  if (founderError) {
    console.error("Error fetching public founder profile:", founderError);
    return null;
  }

  // Fetch all startups by this founder
  const { data: startups, error: startupsError } = await supabase
    .from("company_profile")
    .select("*")
    .eq("clerk_auth_key", clerkAuthKey)
    .order("created_at", { ascending: false });

  if (startupsError) {
    console.error("Error fetching founder startups:", startupsError);
  }

  return {
    founder,
    startups: startups || [],
  };
}

/* ── STARTUP ACTIONS (MULTI-STARTUP SUPPORT) ─────────────────────── */

/**
 * Fetch all startups belonging to the logged-in user
 */
export async function getMyStartups() {
  const { userId, getToken } = await auth();
  if (!userId) return [];

  const cookieStore = await cookies();
  const token = await getSafeSupabaseToken(getToken);
  const supabase = createClient(cookieStore, token);

  const { data, error } = await supabase
    .from("company_profile")
    .select("*")
    .eq("clerk_auth_key", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user startups:", error);
    return [];
  }

  return data || [];
}

/**
 * Create or update a specific startup profile of the currently logged-in user
 */
export async function saveStartupProfile(input: StartupInput, startupId?: string) {
  const { userId, getToken } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!input.company_name || !input.founder_name) {
    throw new Error("Company name and Founder name are required");
  }

  const cookieStore = await cookies();
  const token = await getSafeSupabaseToken(getToken);
  const supabase = createClient(cookieStore, token);

  const payload = {
    clerk_auth_key: userId,
    company_name: input.company_name.trim(),
    website_url: input.website_url?.trim() || null,
    category: input.category || null,
    description: input.description?.trim() || null,
    founder_name: input.founder_name.trim(),
    founder_email: input.founder_email?.trim() || null,
    linkedin_url: input.linkedin_url?.trim() || null,
  };

  let result;
  if (startupId) {
    // Update existing startup (confirming ownership via clerk_auth_key)
    result = await supabase
      .from("company_profile")
      .update(payload)
      .eq("id", startupId)
      .eq("clerk_auth_key", userId)
      .select();
  } else {
    // Insert new startup
    result = await supabase
      .from("company_profile")
      .insert(payload)
      .select();
  }

  if (result.error) {
    console.error("Error saving startup profile:", result.error);
    throw new Error(result.error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/directory");
  return result.data[0];
}

/**
 * Delete a specific startup
 */
export async function deleteStartup(startupId: string) {
  const { userId, getToken } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const cookieStore = await cookies();
  const token = await getSafeSupabaseToken(getToken);
  const supabase = createClient(cookieStore, token);

  const { error } = await supabase
    .from("company_profile")
    .delete()
    .eq("id", startupId)
    .eq("clerk_auth_key", userId);

  if (error) {
    console.error("Error deleting startup:", error);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/directory");
  return true;
}

/**
 * Fetch all startups for the public directory
 */
export async function getAllStartups() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("company_profile")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all startups:", error);
    return [];
  }

  return data || [];
}

/* ── ACCOUNT DELETION ACTION ────────────────────────────────────────── */

/**
 * Delete current user account from both Supabase and Clerk
 */
export async function deleteAccount() {
  const { userId, getToken } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const cookieStore = await cookies();
  const token = await getSafeSupabaseToken(getToken);
  const supabase = createClient(cookieStore, token);

  // 1. Delete user startups in Supabase
  const { error: startupsErr } = await supabase
    .from("company_profile")
    .delete()
    .eq("clerk_auth_key", userId);

  if (startupsErr) {
    console.error("Error deleting user startups during account deletion:", startupsErr);
    throw new Error(`Failed to delete startups: ${startupsErr.message}`);
  }

  // 2. Delete user founder profile in Supabase
  const { error: profileErr } = await supabase
    .from("founder_profile")
    .delete()
    .eq("clerk_auth_key", userId);

  if (profileErr) {
    console.error("Error deleting founder profile during account deletion:", profileErr);
    throw new Error(`Failed to delete profile: ${profileErr.message}`);
  }

  // 3. Delete user from Clerk
  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch (clerkErr: any) {
    console.error("Error deleting user from Clerk:", clerkErr);
    throw new Error(`Failed to delete Clerk account: ${clerkErr.message || clerkErr}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/directory");
  return true;
}
