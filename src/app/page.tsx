import Link from "next/link";

const NOT = [
  {
    no: "Not an SEO scanner",
    yes: "No keyword density, backlinks, or SERP rank. We optimize for the agent that answers the shopper — not Google.",
  },
  {
    no: "Not a data fetcher",
    yes: "Not a catalog viewer. It reasons about how your store data reads to an AI, then ranks the fixes.",
  },
  {
    no: "Not a vanity dashboard",
    yes: "Every number traces to a finding and a fix, and the lift is proven by re-scoring the fixed store.",
  },
];

const STEPS = [
  "Connect & Brief",
  "Mirror",
  "Diagnose",
  "Plan",
  "Simulate",
  "Report",
];

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-20">
      <p className="animate-rise flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-kicker text-signal-warn">
        <span className="h-px w-8 bg-signal-warn/50" />
        Agent Mirror · AI Representation Optimizer for Shopify
      </p>

      <h1
        className="animate-rise mt-7 max-w-4xl font-display text-[2.7rem] leading-[1.08] text-ink sm:text-6xl"
        style={{ animationDelay: "80ms" }}
      >
        See how AI shopping agents represent your store —
        <span className="text-ink-muted"> then make them get it right.</span>
      </h1>

      <p
        className="animate-rise mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted"
        style={{ animationDelay: "160ms" }}
      >
        Shoppers ask an AI agent instead of searching. It answers from whatever
        evidence it can extract about your store. Agent Mirror mirrors that
        answer back, pinpoints what is missing or risky, and ranks the fixes
        that raise <span className="text-ink">AI Representation Quality</span>{" "}
        fastest.
      </p>

      <div
        className="animate-rise mt-9 flex flex-wrap items-center gap-5"
        style={{ animationDelay: "240ms" }}
      >
        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-2.5 rounded-full bg-signal-warn px-7 py-3.5 text-sm font-semibold text-[#1a1206] shadow-glow transition hover:brightness-110"
        >
          Load the demo store
          <span className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
        <span className="font-mono text-xs text-ink-faint">
          Trailhead Supply Co. · 10 SKUs · deterministic seed
        </span>
      </div>

      <div
        className="animate-rise mt-16 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3"
        style={{ animationDelay: "320ms" }}
      >
        {NOT.map((n) => (
          <div key={n.no} className="bg-surface p-6">
            <p className="flex items-center gap-2 font-display text-lg text-ink">
              <span className="text-signal-risk">✕</span>
              {n.no}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {n.yes}
            </p>
          </div>
        ))}
      </div>

      <div
        className="animate-rise mt-10 flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[0.7rem] uppercase tracking-kicker text-ink-faint"
        style={{ animationDelay: "400ms" }}
      >
        {STEPS.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 && <span className="text-line">/</span>}
            <span className="text-ink-muted">{s}</span>
          </span>
        ))}
      </div>
    </main>
  );
}
