import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-5 px-6">
      <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
        Agent Mirror
      </p>
      <h1 className="text-4xl font-semibold leading-tight">
        See how AI shopping agents represent your store — then make it
        represent you right.
      </h1>
      <p className="text-neutral-400">
        Not an SEO scanner. Not a data fetcher. A Shopify-native AI
        Representation Optimizer: the 6-step spine — Connect &amp; Brief,
        Mirror, Diagnose, Plan, Simulate, Report.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400"
        >
          Load demo store →
        </Link>
        <span className="text-xs text-neutral-600">
          Trailhead Supply Co. · seeded demo
        </span>
      </div>
    </main>
  );
}
