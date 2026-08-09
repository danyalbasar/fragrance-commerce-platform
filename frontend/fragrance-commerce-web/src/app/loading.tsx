import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div
      aria-label="Loading page"
      className="flex min-h-screen items-center justify-center bg-[var(--luxury-ivory)]"
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2
          size={32}
          className="animate-spin text-[var(--luxury-gold)]"
        />

        <div className="h-3 w-28 animate-pulse rounded bg-[#e5d9c4]" />
      </div>
    </div>
  );
}
