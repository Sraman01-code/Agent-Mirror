"use client";

// Route error boundary — turns an unexpected throw mid-demo into a calm,
// recoverable screen instead of a dead end. Next.js requires this to be a
// Client Component; it is loaded ONLY on the error path, so the static
// prerendering of `/` and `/dashboard` is unaffected.

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for local debugging only — no secrets, no network.
    console.error("Agent Mirror render error:", error.message);
  }, [error]);

  return (
    <main
      id="content"
      className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-20"
    >
      <p className="font-mono text-[0.7rem] uppercase tracking-kicker text-signal-risk">
        Something went sideways
      </p>
      <h1 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl">
        The view hit an error — the demo data is still intact.
      </h1>
      <p className="mt-4 max-w-md text-ink-muted">
        Numbers are deterministic and seeded, so a retry restores the exact
        same report. Nothing was lost.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-signal-warn px-6 py-3 text-sm font-semibold text-[#1a1206] transition hover:brightness-110"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-full border border-line bg-surface-raised px-6 py-3 text-sm font-medium text-ink-muted transition hover:text-ink"
        >
          Reload the report
        </Link>
      </div>
    </main>
  );
}
