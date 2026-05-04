import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "nobod.ai — Maintenance",
  description:
    "nobod.ai is currently being upgraded. Existing customers can continue via the dashboard.",
  robots: { index: false, follow: false },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-void text-whisper flex flex-col">
      {/* Subtle ambient gradient — single static layer, no canvas */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 30%, rgba(245,158,11,0.06) 0%, transparent 70%), radial-gradient(40% 30% at 30% 80%, rgba(59,130,246,0.04) 0%, transparent 70%), #06080C",
        }}
      />

      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-xl w-full text-center space-y-10">
          <div className="text-sm tracking-[0.2em] uppercase text-shadow">
            nobod.ai
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-amber">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber" />
              </span>
              Maintenance Mode
            </div>

            <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight text-whisper">
              We&apos;re upgrading <br className="hidden sm:block" />
              the experience.
            </h1>

            <p className="text-shadow text-base md:text-lg leading-relaxed max-w-md mx-auto">
              nobod.ai is offline for a short upgrade. Existing customers can
              continue using the service via the dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-lg bg-amber text-void font-medium hover:bg-amber/90 transition"
            >
              Open dashboard →
            </Link>
            <a
              href="mailto:sebastian.dahm@opcore-partners.ch"
              className="px-6 py-3 rounded-lg border border-border text-whisper hover:border-shadow transition"
            >
              Contact us
            </a>
          </div>
        </div>
      </div>

      <footer className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-shadow">
          <div className="text-center sm:text-left">
            <div>nobod.ai is operated by OPCORE Partners AG, Zürich</div>
            <div className="mt-1">© 2026 OPCORE Partners AG</div>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/legal/impressum" className="hover:text-whisper transition">
              Impressum
            </Link>
            <Link href="/legal/datenschutz" className="hover:text-whisper transition">
              Datenschutz
            </Link>
            <Link href="/legal/agb" className="hover:text-whisper transition">
              AGB
            </Link>
            <Link href="/legal/cookies" className="hover:text-whisper transition">
              Cookies
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
