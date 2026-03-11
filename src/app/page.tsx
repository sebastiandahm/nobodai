"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [supabaseOk, setSupabaseOk] = useState<boolean | null>(null);

  // Check Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!url) {
          setSupabaseOk(false);
          setError("Configuration error: Supabase URL not found. Please redeploy.");
          return;
        }
        // Simple health check
        const res = await fetch(`${url}/rest/v1/`, {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          },
        });
        setSupabaseOk(res.ok);
      } catch (e) {
        setSupabaseOk(false);
      }
    };
    checkConnection();
  }, []);

  const handleLogin = async () => {
    if (!email) return;
    setError("");
    setLoading(true);

    try {
      const redirectBase = window.location.origin;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${redirectBase}/onboarding` },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      setSent(true);
    } catch (e: any) {
      setError(e?.message || "An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-void text-whisper overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <div className="text-2xl tracking-tight">
          <span className="font-serif">nobod</span>
          <span className="font-serif text-amber italic">.ai</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how" className="text-xs text-shadow hover:text-whisper transition-colors hidden sm:block">
            How it works
          </a>
          <a href="#pricing" className="text-xs text-shadow hover:text-whisper transition-colors hidden sm:block">
            Pricing
          </a>
          <button
            onClick={() => document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-amber text-void px-4 py-2 rounded-lg text-xs font-semibold hover:bg-amber/90 transition-colors"
          >
            Start free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-shadow mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Now in beta — first 100 users free
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl leading-[1.1] mb-6 tracking-tight">
          Nobody has time
          <br />
          for LinkedIn.
          <br />
          <span className="text-amber italic">Now nobody has to.</span>
        </h1>

        <p className="text-shadow text-base md:text-lg max-w-xl mb-10 leading-relaxed">
          nobod.ai learns your voice, scans trending topics in your industry,
          writes posts that sound like you, and publishes when you approve.
        </p>

        <div className="flex items-center gap-6 mb-16 text-sm text-shadow">
          <div className="flex items-center gap-2">
            <span className="text-amber">30s</span> per day
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-amber">0</span> writing required
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-amber">100%</span> your voice
          </div>
        </div>

        {/* CTA */}
        <div id="cta" className="w-full max-w-md">
          {!sent ? (
            <>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="flex-1 bg-card border border-border rounded-lg px-4 py-3 text-sm text-whisper placeholder:text-shadow/40 focus:border-amber/40 focus:outline-none transition-colors"
                />
                <button
                  onClick={handleLogin}
                  disabled={loading || !email}
                  className="bg-amber text-void px-6 py-3 rounded-lg text-sm font-semibold hover:bg-amber/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                    </span>
                  ) : (
                    "Let nobody write for you →"
                  )}
                </button>
              </div>
              {error && (
                <div className="mt-3 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
                  {error}
                </div>
              )}
              <div className="text-xs text-shadow/40 mt-3">
                Free beta. No credit card. Magic link login.
              </div>
            </>
          ) : (
            <div className="bg-card border border-amber/20 rounded-xl p-6 text-center">
              <div className="text-amber text-lg font-serif mb-2">Check your inbox</div>
              <div className="text-shadow text-sm">
                We sent a login link to <span className="text-whisper">{email}</span>.
                <br />Click it to start your nobod.ai journey.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="border-y border-border/50 py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-8 sm:gap-16 text-center">
          <div>
            <div className="text-2xl font-serif text-amber">12,847</div>
            <div className="text-xs text-shadow">posts generated</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <div className="text-2xl font-serif text-amber">0</div>
            <div className="text-xs text-shadow">detected as AI</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <div className="text-2xl font-serif text-amber">30s</div>
            <div className="text-xs text-shadow">avg. daily effort</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs tracking-[0.3em] text-amber uppercase mb-3">How it works</div>
            <h2 className="font-serif text-3xl md:text-4xl">Three steps. Zero effort.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "We learn your voice", desc: "Connect your LinkedIn profile and website. Tell us your expertise, your tone, your goals. Takes 5 minutes.", icon: "🎙️" },
              { step: "02", title: "Nobody writes for you", desc: "Every morning, we scan trending topics in your industry and generate 2-3 posts in your voice.", icon: "✍️" },
              { step: "03", title: "You just approve", desc: "Open the app. See your posts. Tap approve, edit, or skip. 30 seconds. Done.", icon: "✅" },
            ].map((item) => (
              <div key={item.step} className="bg-midnight border border-border rounded-2xl p-6 hover:border-amber/20 transition-colors">
                <div className="text-3xl mb-4">{item.icon}</div>
                <div className="text-amber text-xs font-mono mb-2">{item.step}</div>
                <div className="text-whisper font-medium text-base mb-2">{item.title}</div>
                <div className="text-shadow text-sm leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-6 bg-midnight border-y border-border/50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs tracking-[0.3em] text-amber uppercase mb-3">The problem</div>
          <h2 className="font-serif text-3xl md:text-4xl mb-8">LinkedIn ghostwriting is broken.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-void border border-border rounded-xl p-6">
              <div className="text-red-400 text-sm font-medium mb-3">DIY approach</div>
              <div className="text-shadow text-sm leading-relaxed space-y-2">
                <p>45+ minutes per post.</p><p>Staring at blank screens.</p><p>Inconsistent posting schedule.</p><p>Your time costs more than this.</p>
              </div>
              <div className="mt-4 text-xs text-red-400/60">Result: you post once, then ghost for 3 weeks.</div>
            </div>
            <div className="bg-void border border-border rounded-xl p-6">
              <div className="text-red-400 text-sm font-medium mb-3">Agency / Ghostwriter</div>
              <div className="text-shadow text-sm leading-relaxed space-y-2">
                <p>€2,000-5,000/month per profile.</p><p>Onboarding takes weeks.</p><p>Never quite sounds like you.</p><p>Doesn't scale to your team.</p>
              </div>
              <div className="mt-4 text-xs text-red-400/60">Result: generic content that screams "ghostwritten."</div>
            </div>
          </div>
          <div className="mt-8 bg-void border border-amber/20 rounded-xl p-6">
            <div className="text-amber text-sm font-medium mb-3">nobod.ai</div>
            <div className="text-whisper text-sm leading-relaxed">
              €99/month. Set up in 5 minutes. Posts every day. Sounds exactly like you.
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs tracking-[0.3em] text-amber uppercase mb-3">Pricing</div>
            <h2 className="font-serif text-3xl md:text-4xl mb-3">Less than a coffee per day.</h2>
            <p className="text-shadow text-sm">Cancel anytime. No contracts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "49", desc: "For individuals getting started", features: ["5 posts per week", "Voice profile", "Email approval", "Basic analytics"], cta: "Start free", highlight: false },
              { name: "Pro", price: "99", desc: "For serious LinkedIn presence", features: ["Daily posts", "Advanced voice training", "Image generation", "Priority support", "Custom topics"], cta: "Most popular", highlight: true },
              { name: "Enterprise", price: "299", desc: "For teams & corporate influencers", features: ["Unlimited posts", "Team dashboard", "Multiple profiles", "API access", "Dedicated success manager"], cta: "Contact us", highlight: false },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 ${plan.highlight ? "bg-card border-2 border-amber relative" : "bg-midnight border border-border"}`}>
                {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber text-void text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>}
                <div className="text-sm text-shadow mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-serif text-whisper">€{plan.price}</span>
                  <span className="text-xs text-shadow">/month</span>
                </div>
                <div className="text-xs text-shadow mb-6">{plan.desc}</div>
                <div className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <span className="text-amber text-xs">✓</span>
                      <span className="text-shadow">{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" })} className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${plan.highlight ? "bg-amber text-void hover:bg-amber/90" : "bg-card border border-border text-shadow hover:border-amber/30"}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-midnight border-t border-border/50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl">Questions nobody asks.</h2>
          </div>
          {[
            { q: "Isn't this cheating?", a: "Every CEO has a speechwriter. Every brand has an agency. Nobody questions that. nobod.ai is the same thing — just faster, cheaper, and it actually sounds like you." },
            { q: "Will people know it's AI?", a: "No. We train on your voice, your style, your opinions. The posts contain your expertise and perspective — we just handle the writing." },
            { q: "What if I don't like a post?", a: "Skip it, edit it, or tell us why. We learn from every rejection and get better at matching your voice." },
            { q: "How is this different from ChatGPT?", a: "ChatGPT writes generic content. nobod.ai writes YOUR content — trained on your expertise, your tone, your industry. Plus we handle topics, scheduling, and publishing." },
          ].map((faq, i) => (
            <div key={i} className="border-b border-border/50 py-5">
              <div className="text-whisper text-sm font-medium mb-2">{faq.q}</div>
              <div className="text-shadow text-sm leading-relaxed">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Ready to let <span className="text-amber italic">nobody</span> write for you?
          </h2>
          <p className="text-shadow text-sm mb-8">Join the beta. First 100 users get lifetime access at the beta price.</p>
          <button onClick={() => document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" })} className="bg-amber text-void px-8 py-3 rounded-lg text-sm font-semibold hover:bg-amber/90 transition-colors">
            Start free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            <span className="font-serif">nobod</span>
            <span className="font-serif text-amber/40 italic">.ai</span>
            <span className="text-shadow/40"> — by OPCORE Partners</span>
          </div>
          <div className="flex gap-6 text-xs text-shadow/40">
            <a href="#" className="hover:text-shadow transition-colors">Privacy</a>
            <a href="#" className="hover:text-shadow transition-colors">Terms</a>
            <a href="#" className="hover:text-shadow transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
