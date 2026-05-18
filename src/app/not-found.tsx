import Link from "next/link";

// 404 off-ramp — keeps a mistyped URL from being a demo dead end. Server
// component, on-brand, no client JS, statically rendered.
export default function NotFound() {
  return (
    <main
      id="content"
      className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-20"
    >
      <p className="font-mono text-[0.7rem] uppercase tracking-kicker text-signal-warn">
        404 · off the map
      </p>
      <h1 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl">
        That page isn&apos;t part of the report.
      </h1>
      <p className="mt-4 max-w-md text-ink-muted">
        Agent Mirror is a focused, deterministic demo: a landing page and the
        six-step representation report. Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/dashboard"
          className="rounded-full bg-signal-warn px-6 py-3 text-sm font-semibold text-[#1a1206] transition hover:brightness-110"
        >
          Open the report →
        </Link>
        <Link
          href="/"
          className="rounded-full border border-line bg-surface-raised px-6 py-3 text-sm font-medium text-ink-muted transition hover:text-ink"
        >
          Back to landing
        </Link>
      </div>
    </main>
  );
}
