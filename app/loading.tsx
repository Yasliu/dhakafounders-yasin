import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface/75 backdrop-blur-xs">
      {/* Top running progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-surface-card overflow-hidden">
        <div className="loading-bar" />
      </div>

      {/* Main Spinner display */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/10 bg-surface-card p-8 shadow-2xl">
        <Loader2 className="h-10 w-10 animate-spin text-primary-light" />
        <p className="font-heading text-sm font-semibold tracking-wider text-text-secondary uppercase animate-pulse">
          Loading Page...
        </p>
      </div>
    </div>
  );
}
