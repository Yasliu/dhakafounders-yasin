import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMyFounderProfile, getMyStartups } from "@/app/actions/startup";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await currentUser();

  // If no user is logged in, redirect to sign-in.
  if (!user) {
    redirect("/sign-in");
  }

  // Get founder profile (creates default if missing)
  const profile = await getMyFounderProfile();
  
  // Get all startups uploaded by this founder
  const startups = await getMyStartups();

  const userData = {
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddresses[0]?.emailAddress || "",
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <DashboardClient 
        user={userData} 
        initialProfile={profile} 
        initialStartups={startups} 
      />
    </div>
  );
}
