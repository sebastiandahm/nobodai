import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-void text-whisper">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 40% at 50% 20%, rgba(245,158,11,0.04) 0%, transparent 70%), #06080C",
        }}
      />

      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm tracking-[0.2em] uppercase text-shadow hover:text-whisper transition"
          >
            nobod.ai
          </Link>
          <Link
            href="/"
            className="text-xs text-shadow hover:text-whisper transition"
          >
            ← Back
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16">{children}</article>

      <footer className="border-t border-border mt-24">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-shadow">
          <div>OPCORE Partners AG, Zürich · © 2026</div>
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
