import { getAllStartups } from "@/app/actions/startup";
import { DirectoryClient } from "./DirectoryClient";

export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const startups = await getAllStartups();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <DirectoryClient initialStartups={startups} />
    </div>
  );
}
