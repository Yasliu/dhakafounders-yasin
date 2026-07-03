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

  // Bidirectional sync check: Clerk -> Supabase
  // If Clerk profile image changed directly, update our Supabase copy
  try {
    const user = await currentUser();
    if (user && user.imageUrl && user.imageUrl !== data.avatar_url) {
      const { data: updated } = await supabase
        .from("founder_profile")
        .update({ avatar_url: user.imageUrl })
        .eq("clerk_auth_key", userId)
        .select()
        .single();
      if (updated) {
        return updated;
      }
    }
  } catch (syncErr) {
    console.error("Failed to sync Clerk profile image to Supabase:", syncErr);
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

  let finalAvatarUrl = input.avatar_url?.trim() || null;

  // Dhaka Founders -> Clerk Sync
  if (finalAvatarUrl && finalAvatarUrl.startsWith("data:")) {
    try {
      const mime = finalAvatarUrl.split(',')[0].match(/:(.*?);/)?.[1] || 'image/png';
      const base64Data = finalAvatarUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([buffer], { type: mime });

      const client = await clerkClient();
      const clerkUser = await client.users.updateUserProfileImage(userId, {
        file: blob,
      });
      finalAvatarUrl = clerkUser.imageUrl;
    } catch (clerkErr) {
      console.error("Failed to sync profile picture to Clerk:", clerkErr);
      // If Clerk upload fails, we still allow saving base64 to Supabase so it works
    }
  } else if (!finalAvatarUrl) {
    // If the image was removed/cleared, delete it from Clerk too
    try {
      const client = await clerkClient();
      await client.users.deleteUserProfileImage(userId);
    } catch (clerkErr) {
      console.error("Failed to delete profile picture from Clerk:", clerkErr);
    }
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
    avatar_url: finalAvatarUrl,
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

  // Fetch startups
  const { data: startups, error: startupErr } = await supabase
    .from("company_profile")
    .select("*")
    .order("created_at", { ascending: false });

  if (startupErr) {
    console.error("Error fetching all startups:", startupErr);
    return [];
  }

  // Fetch founder profiles to get the avatar URLs
  const { data: profiles, error: profileErr } = await supabase
    .from("founder_profile")
    .select("clerk_auth_key, avatar_url");

  if (profileErr) {
    console.error("Error fetching founder profiles for avatars:", profileErr);
    return startups || [];
  }

  // Create a map of clerk_auth_key -> avatar_url
  const avatarMap = new Map<string, string>();
  if (profiles) {
    for (const p of profiles) {
      if (p.clerk_auth_key && p.avatar_url) {
        avatarMap.set(p.clerk_auth_key, p.avatar_url);
      }
    }
  }

  // Map avatar_url into startup items
  const startupsWithAvatars = (startups || []).map((startup) => ({
    ...startup,
    founder_avatar_url: avatarMap.get(startup.clerk_auth_key) || null,
  }));

  return startupsWithAvatars;
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
