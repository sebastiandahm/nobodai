"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    setLoading(false);
    if (!error) setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <div className="text-2xl tracking-tight">
          <span className="font-serif text-whisper">nobod</span>
          <span className="font-serif text-amber italic">.ai</span>
        </div>
        <button
          onClick={() => document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" })}
          className="text-sm text-shadow hover:text-amber transition-colors"
        >
          Get started
        </button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto">
        <div className="mb-4 text-xs tracking-[0.3em] text-shadow uppercase">
          LinkedIn Ghostwriter
        </div>

        <h1 className="font-serif text-4xl md:text-6xl leading-tight mb-6 tracking-tight">
          Nobody has time
          <br />
          for LinkedIn.
          <br />
          <span className="text-amber italic">Now nobody has to.</span>
        </h1>

        <p className="text-shadow text-base md:text-lg max-w-xl mb-12 leading-relaxed">
          nobod.ai learns your voice, writes your posts, and publishes when you
          approve. 30 seconds a day. That&apos;s it.
        </p>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16 w-full max-w-2xl">
          {[
            {
              step: "01",
              title: "We learn you",
              desc: "Your LinkedIn, your website, your style. 5 minutes setup.",
            },
            {
              step: "02",
              title: "We write for you",
              desc: "Every morning, fresh posts in your voice. Trending topics in your field.",
            },
            {
              step: "03",
              title: "You approve",
              desc: "One tap: publish, edit, or skip. 30 seconds. Done.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-midnight border border-border rounded-xl p-5 text-left"
            >
              <div className="text-amber text-xs font-mono mb-2">
                {item.step}
              </div>
              <div className="text-whisper font-medium text-sm mb-1">
                {item.title}
              </div>
              <div className="text-shadow text-xs leading-relaxed">
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div id="cta" className="w-full max-w-md mb-20">
          {!sent ? (
            <>
              <div className="text-sm text-shadow mb-3">
                Let nobody write for you.
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="flex-1"
                />
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="bg-amber text-void px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? "..." : "Start free"}
                </button>
              </div>
              <div className="text-xs text-shadow/50 mt-2">
                No credit card. Magic link login.
              </div>
            </>
          ) : (
            <div className="bg-card border border-amber/20 rounded-xl p-6">
              <div className="text-amber text-lg mb-2">Check your inbox</div>
              <div className="text-shadow text-sm">
                We sent a login link to <span className="text-whisper">{email}</span>.
                Click it to get started.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-shadow/40">
        <span className="font-serif">nobod</span>
        <span className="font-serif text-amber/40 italic">.ai</span>
        {" "}&mdash; by OPCORE Partners
      </footer>
    </div>
  );
}
