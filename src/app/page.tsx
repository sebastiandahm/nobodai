"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (window.location.hash && window.location.hash.includes("access_token")) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setIsLoggedIn(true);
          setCheckingAuth(false);
        }
      });
    }
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setIsLoggedIn(true);
      }
      setCheckingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setIsLoggedIn(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!email) return;
    setError("");
    setLoading(true);
    try {
      const redirectBase = window.location.origin;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${redirectBase}/auth/callback` },
      });
      if (authError) { setError(authError.message); setLoading(false); return; }
      setSent(true);
    } catch (e: any) {
      setError(e?.message || "An unexpected error occurred.");
    }
    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#06080C] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F59E0B]/30 border-t-[#F59E0B] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080C] text-[#E5E7EB] overflow-hidden" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      <style jsx global>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(245,158,11,0.15); } 50% { box-shadow: 0 0 40px rgba(245,158,11,0.3); } }
        .fade-up { animation: fadeUp 0.8s ease-out forwards; opacity: 0; }
        .fade-up-d1 { animation-delay: 0.1s; }
        .fade-up-d2 { animation-delay: 0.2s; }
        .fade-up-d3 { animation-delay: 0.3s; }
        .fade-up-d4 { animation-delay: 0.4s; }
        .fade-up-d5 { animation-delay: 0.5s; }
        .fade-in { animation: fadeIn 1s ease-out forwards; opacity: 0; }
        .shimmer-text { background: linear-gradient(90deg, #F59E0B 0%, #FBBF24 25%, #F59E0B 50%, #FBBF24 75%, #F59E0B 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 3s linear infinite; }
        .float { animation: float 4s ease-in-out infinite; }
        .glow-card { animation: pulse-glow 3s ease-in-out infinite; }
        .grain { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); }
        .ss { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>
      <div className="grain" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 max-w-6xl mx-auto w-full fade-up">
        <a href="/" className="text-2xl tracking-tight no-underline text-[#E5E7EB]">
          <span>nobod</span><span className="text-[#F59E0B] italic">.ai</span>
        </a>
        <div className="flex items-center gap-6">
          <a href="#how" className="ss text-xs text-[#9CA3AF] hover:text-[#E5E7EB] transition-colors hidden sm:block no-underline">How it works</a>
          <a href="#pricing" className="ss text-xs text-[#9CA3AF] hover:text-[#E5E7EB] transition-colors hidden sm:block no-underline">Pricing</a>
          <a href="#team" className="ss text-xs text-[#9CA3AF] hover:text-[#E5E7EB] transition-colors hidden sm:block no-underline">Team</a>
          {isLoggedIn ? (
            <button onClick={() => router.push("/dashboard")}
              className="ss bg-[#F59E0B] text-[#06080C] px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#FBBF24] transition-all">
              Open Dashboard
            </button>
          ) : (
            <button onClick={() => document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" })}
              className="ss bg-[#F59E0B] text-[#06080C] px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#FBBF24] transition-all">
              Start free
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-12 pb-20 max-w-5xl mx-auto">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#F59E0B]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="ss inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1F2937] text-xs text-[#9CA3AF] mb-10 fade-up fade-up-d1 backdrop-blur-sm bg-[#0D1117]/50">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Now in beta &mdash; first 100 users free
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl leading-[1.05] mb-6 tracking-tight fade-up fade-up-d2">
          Nobody has time<br />for LinkedIn.<br />
          <span className="shimmer-text italic">Now nobody has to.</span>
        </h1>

        <p className="ss text-[#9CA3AF] text-base md:text-lg max-w-xl mb-10 leading-relaxed fade-up fade-up-d3">
          nobod.ai learns your voice, finds trending topics in your industry,
          writes posts that sound like you, and publishes when you approve.
        </p>

        <div className="ss flex items-center gap-6 mb-14 text-sm text-[#9CA3AF] fade-up fade-up-d4">
          <div className="flex items-center gap-2"><span className="text-[#F59E0B] font-semibold">30s</span> per day</div>
          <div className="w-px h-4 bg-[#1F2937]" />
          <div className="flex items-center gap-2"><span className="text-[#F59E0B] font-semibold">0</span> writing</div>
          <div className="w-px h-4 bg-[#1F2937]" />
          <div className="flex items-center gap-2"><span className="text-[#F59E0B] font-semibold">100%</span> your voice</div>
        </div>

        {/* CTA */}
        <div id="cta" className="w-full max-w-md fade-up fade-up-d5">
          {isLoggedIn ? (
            <button onClick={() => router.push("/dashboard")}
              className="ss bg-[#F59E0B] text-[#06080C] px-8 py-4 rounded-xl text-sm font-bold hover:bg-[#FBBF24] transition-all w-full glow-card">
              Open your Dashboard &rarr;
            </button>
          ) : !sent ? (
            <>
              <div className="ss text-sm text-[#6B7280] mb-3">Sign up or log in &mdash; same magic link.</div>
              <div className="flex gap-2">
                <input type="email" placeholder="your@email.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="ss flex-1 bg-[#111827] border border-[#1F2937] rounded-xl px-4 py-3.5 text-sm text-[#E5E7EB] placeholder:text-[#4B5563] focus:border-[#F59E0B]/40 focus:outline-none transition-colors" />
                <button onClick={handleLogin} disabled={loading || !email}
                  className="ss bg-[#F59E0B] text-[#06080C] px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-[#FBBF24] transition-all disabled:opacity-50 whitespace-nowrap glow-card">
                  {loading ? <span className="w-4 h-4 border-2 border-[#06080C]/30 border-t-[#06080C] rounded-full animate-spin inline-block" /> : "Start free \u2192"}
                </button>
              </div>
              {error && <div className="ss mt-3 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">{error}</div>}
              <div className="ss text-xs text-[#4B5563] mt-3">No credit card. No password. We send you a magic link.</div>
            </>
          ) : (
            <div className="bg-[#111827] border border-[#F59E0B]/20 rounded-2xl p-8 text-center">
              <div className="text-[#F59E0B] text-xl mb-2">Check your inbox</div>
              <div className="ss text-[#9CA3AF] text-sm">
                We sent a login link to <span className="text-[#E5E7EB] font-medium">{email}</span>.<br />
                Click it to access your dashboard.
              </div>
              <button onClick={() => setSent(false)} className="ss mt-4 text-xs text-[#6B7280] hover:text-[#E5E7EB] transition-colors">Use a different email</button>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 border-y border-[#1F2937]/50 py-8 bg-[#0D1117]/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-10 sm:gap-20 text-center">
          <div><div className="text-3xl text-[#F59E0B]">12,847</div><div className="ss text-xs text-[#6B7280] mt-1">posts generated</div></div>
          <div className="w-px h-10 bg-[#1F2937]" />
          <div><div className="text-3xl text-[#F59E0B]">0%</div><div className="ss text-xs text-[#6B7280] mt-1">detected as AI</div></div>
          <div className="w-px h-10 bg-[#1F2937]" />
          <div><div className="text-3xl text-[#F59E0B]">30s</div><div className="ss text-xs text-[#6B7280] mt-1">avg. daily effort</div></div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="ss text-xs tracking-[0.3em] text-[#F59E0B] uppercase mb-4">How it works</div>
            <h2 className="text-3xl md:text-5xl tracking-tight">Three steps. Zero effort.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "We learn your voice", desc: "Complete a 5-minute voice profile. Tell us your expertise, your opinions, your tone. We build a writing DNA that's uniquely yours.", icon: "\uD83C\uDF99\uFE0F", delay: "0s" },
              { step: "02", title: "Nobody writes for you", desc: "Every morning at 6:00, our AI scans trending topics in your industry and generates 2-3 posts in your exact voice.", icon: "\u270D\uFE0F", delay: "0.15s" },
              { step: "03", title: "You just approve", desc: "Open the app. See your posts as LinkedIn previews. Tap approve, edit, or skip. 30 seconds. Your LinkedIn stays active.", icon: "\u2705", delay: "0.3s" },
            ].map((item) => (
              <div key={item.step} className="group bg-gradient-to-b from-[#111827] to-[#0D1117] border border-[#1F2937] rounded-2xl p-7 hover:border-[#F59E0B]/30 transition-all duration-500 hover:-translate-y-1" style={{ animationDelay: item.delay }}>
                <div className="text-4xl mb-5 float" style={{ animationDelay: item.delay }}>{item.icon}</div>
                <div className="ss text-[#F59E0B] text-xs font-mono mb-3 tracking-wider">{item.step}</div>
                <div className="text-xl mb-3">{item.title}</div>
                <div className="ss text-[#9CA3AF] text-sm leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="relative z-10 py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#06080C] via-[#0D1117] to-[#06080C]" />
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="ss text-xs tracking-[0.3em] text-[#F59E0B] uppercase mb-4">The problem</div>
            <h2 className="text-3xl md:text-5xl tracking-tight">LinkedIn ghostwriting<br /><span className="text-[#6B7280]">is broken.</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#111827]/80 border border-[#1F2937] rounded-2xl p-6 backdrop-blur-sm">
              <div className="ss text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">DIY</div>
              <div className="text-3xl mb-3 text-[#E5E7EB]">{"\u20AC"}0</div>
              <div className="ss text-[#6B7280] text-sm leading-relaxed space-y-2">
                <p>45+ minutes per post</p><p>Inconsistent schedule</p><p>Writer&apos;s block</p><p className="text-red-400/60 text-xs pt-2">Result: you ghost LinkedIn for weeks</p>
              </div>
            </div>
            <div className="bg-[#111827]/80 border border-[#1F2937] rounded-2xl p-6 backdrop-blur-sm">
              <div className="ss text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">Agency</div>
              <div className="text-3xl mb-3 text-[#E5E7EB]">{"\u20AC"}3,000+<span className="text-sm text-[#6B7280]">/mo</span></div>
              <div className="ss text-[#6B7280] text-sm leading-relaxed space-y-2">
                <p>Weeks of onboarding</p><p>Never quite your voice</p><p>Doesn&apos;t scale</p><p className="text-red-400/60 text-xs pt-2">Result: generic ghostwritten content</p>
              </div>
            </div>
            <div className="bg-gradient-to-b from-[#1a1505] to-[#111827] border border-[#F59E0B]/30 rounded-2xl p-6 glow-card">
              <div className="ss text-[#F59E0B] text-xs font-semibold uppercase tracking-wider mb-4">nobod.ai</div>
              <div className="text-3xl mb-3 text-[#E5E7EB]">{"\u20AC"}79<span className="text-sm text-[#6B7280]">/mo</span></div>
              <div className="ss text-[#9CA3AF] text-sm leading-relaxed space-y-2">
                <p>Set up in 5 minutes</p><p>Posts every single day</p><p>Sounds exactly like you</p><p className="text-[#F59E0B]/60 text-xs pt-2">Result: consistent presence, zero effort</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the CEO */}
      <section id="team" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="ss text-xs tracking-[0.3em] text-[#F59E0B] uppercase mb-4">Meet the team</div>
            <h2 className="text-3xl md:text-5xl tracking-tight">Built by humans.<br /><span className="text-[#F59E0B] italic">Powered by nobody.</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Arie Muth */}
            <div className="bg-gradient-to-br from-[#111827] to-[#0D1117] border border-[#1F2937] rounded-3xl p-8 hover:border-[#F59E0B]/20 transition-all">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#F59E0B]/20 to-[#F59E0B]/5 border border-[#F59E0B]/20 flex items-center justify-center mb-6 overflow-hidden">
                <div className="text-4xl">&#x1F469;&#x200D;&#x1F4BC;</div>
              </div>
              <div className="text-xl mb-1">Arie Muth</div>
              <div className="ss text-[#F59E0B] text-sm mb-4">CEO &amp; Founder</div>
              <div className="ss text-[#9CA3AF] text-sm leading-relaxed mb-4">
                Former strategy consultant. Realized that LinkedIn is the highest-ROI channel for B2B professionals &mdash; and that 95% of them don&apos;t use it because they lack the time.
                Built nobod.ai to solve her own problem first. Now solving it for thousands.
              </div>
              <div className="ss flex items-center gap-2 text-xs text-[#6B7280]">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                Posts daily on LinkedIn using nobod.ai
              </div>
            </div>
            {/* The AI */}
            <div className="space-y-6">
              <div className="bg-[#111827]/50 border border-[#1F2937] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center text-lg">&#x1F916;</div>
                  <div>
                    <div className="text-sm">Nobody</div>
                    <div className="ss text-xs text-[#6B7280]">The AI that writes for you</div>
                  </div>
                </div>
                <div className="ss text-[#9CA3AF] text-sm leading-relaxed">
                  Trained on thousands of high-performing LinkedIn posts. Learns your unique voice in minutes. Gets better with every post you approve or reject.
                </div>
              </div>
              <div className="bg-[#111827]/50 border border-[#1F2937] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center text-lg">&#x1F3E2;</div>
                  <div>
                    <div className="text-sm">OPCORE Partners</div>
                    <div className="ss text-xs text-[#6B7280]">Z{"\u00FC"}rich, Switzerland</div>
                  </div>
                </div>
                <div className="ss text-[#9CA3AF] text-sm leading-relaxed">
                  nobod.ai is built by OPCORE Partners, a management consulting firm specializing in Digital Commerce and AI Transformation for the European market.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="relative z-10 py-20 px-6 border-y border-[#1F2937]/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-2xl md:text-3xl leading-relaxed mb-8 italic text-[#E5E7EB]/90">
            &ldquo;I was spending 2 hours a week on LinkedIn posts. Now I spend 2 minutes. The posts actually perform better because they&apos;re consistent and on-trend.&rdquo;
          </div>
          <div className="ss flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-[#F59E0B]/5 flex items-center justify-center text-sm border border-[#F59E0B]/20">AM</div>
            <div className="text-left">
              <div className="text-sm">Arie Muth</div>
              <div className="text-xs text-[#6B7280]">CEO, nobod.ai &mdash; using her own product daily</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="ss text-xs tracking-[0.3em] text-[#F59E0B] uppercase mb-4">Pricing</div>
            <h2 className="text-3xl md:text-5xl tracking-tight mb-3">Less than a coffee per day.</h2>
            <p className="ss text-[#6B7280] text-sm">Cancel anytime. No contracts. No surprises.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: "Free", price: "0", period: "", desc: "Try it out", features: ["3 posts per week", "Basic voice profile", "nobod.ai watermark", "Email approval"], cta: "Start free", pop: false },
              { name: "Starter", price: "29", period: "/mo", desc: "Consistent presence", features: ["Daily posts", "Advanced voice", "No watermark", "Email approval", "Topic suggestions"], cta: "Start trial", pop: false },
              { name: "Pro", price: "79", period: "/mo", desc: "Serious growth", features: ["Daily posts", "Premium voice AI", "Image generation", "Custom topics", "Analytics", "Priority support"], cta: "Most popular", pop: true },
              { name: "Enterprise", price: "249", period: "/mo", desc: "For teams", features: ["Unlimited posts", "Team dashboard", "Multi-profile", "API access", "Dedicated support", "Custom integrations"], cta: "Contact us", pop: false },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 relative ${plan.pop ? "bg-gradient-to-b from-[#1a1505] to-[#111827] border-2 border-[#F59E0B]/50 glow-card" : "bg-[#111827]/60 border border-[#1F2937] hover:border-[#374151]"}`}>
                {plan.pop && <div className="ss absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F59E0B] text-[#06080C] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Popular</div>}
                <div className="ss text-xs text-[#9CA3AF] mb-2 font-medium">{plan.name}</div>
                <div className="flex items-baseline gap-0.5 mb-1">
                  <span className="text-3xl text-[#E5E7EB]">{plan.price === "0" ? "Free" : "\u20AC" + plan.price}</span>
                  {plan.period && <span className="ss text-xs text-[#6B7280]">{plan.period}</span>}
                </div>
                <div className="ss text-xs text-[#6B7280] mb-5">{plan.desc}</div>
                <div className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className="ss flex items-center gap-2.5 text-xs">
                      <span className="text-[#F59E0B] text-[10px]">{"\u2713"}</span><span className="text-[#9CA3AF]">{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => isLoggedIn ? router.push("/dashboard") : document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" })}
                  className={`ss w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${plan.pop ? "bg-[#F59E0B] text-[#06080C] hover:bg-[#FBBF24]" : "bg-[#1F2937] text-[#9CA3AF] hover:bg-[#374151] hover:text-[#E5E7EB]"}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 py-24 px-6 bg-[#0D1117]/50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl">Questions nobody asks.</h2>
          </div>
          {[
            { q: "Isn\u2019t this cheating?", a: "Every CEO has a speechwriter. Every brand has an agency. nobod.ai is the same thing \u2014 faster, cheaper, and it sounds like you." },
            { q: "Will people know it\u2019s AI?", a: "No. We train on your voice, your style, your opinions. The posts contain your real expertise \u2014 we just handle the writing part." },
            { q: "What if I don\u2019t like a post?", a: "Skip it, edit it, or reject it. Our AI learns from every interaction and gets better at matching your voice over time." },
            { q: "How is this different from ChatGPT?", a: "ChatGPT writes generic content for everyone. nobod.ai writes YOUR content \u2014 trained on your expertise, your tone, your industry. Plus we handle topic discovery, scheduling, and publishing." },
            { q: "Can I try it for free?", a: "Yes. The free plan gives you 3 posts per week with a small watermark. Upgrade when you\u2019re convinced \u2014 which usually takes about a week." },
          ].map((faq, i) => (
            <div key={i} className="border-b border-[#1F2937]/50 py-6">
              <div className="text-base mb-2">{faq.q}</div>
              <div className="ss text-[#9CA3AF] text-sm leading-relaxed">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-t from-[#F59E0B]/5 to-transparent pointer-events-none" />
        <div className="relative max-w-lg mx-auto">
          <h2 className="text-3xl md:text-5xl mb-5">Ready to let <span className="text-[#F59E0B] italic">nobody</span><br />write for you?</h2>
          <p className="ss text-[#9CA3AF] text-sm mb-8">Join the beta. First 100 users get lifetime access at the beta price.</p>
          <button onClick={() => isLoggedIn ? router.push("/dashboard") : document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" })}
            className="ss bg-[#F59E0B] text-[#06080C] px-10 py-4 rounded-xl text-sm font-bold hover:bg-[#FBBF24] transition-all glow-card">
            {isLoggedIn ? "Open Dashboard \u2192" : "Start free \u2192"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1F2937]/30 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="text-xl mb-2"><span>nobod</span><span className="text-[#F59E0B] italic">.ai</span></div>
              <div className="ss text-xs text-[#6B7280] max-w-xs">The AI ghostwriter that learns your voice and posts on LinkedIn for you. Built in Z{"\u00FC"}rich by OPCORE Partners.</div>
            </div>
            <div className="ss flex gap-10 text-xs text-[#6B7280]">
              <div className="space-y-2">
                <div className="text-[#9CA3AF] font-medium mb-3">Product</div>
                <a href="#how" className="block hover:text-[#E5E7EB] transition-colors no-underline">How it works</a>
                <a href="#pricing" className="block hover:text-[#E5E7EB] transition-colors no-underline">Pricing</a>
                <a href="#team" className="block hover:text-[#E5E7EB] transition-colors no-underline">Team</a>
              </div>
              <div className="space-y-2">
                <div className="text-[#9CA3AF] font-medium mb-3">Legal</div>
                <a href="#" className="block hover:text-[#E5E7EB] transition-colors no-underline">Privacy Policy</a>
                <a href="#" className="block hover:text-[#E5E7EB] transition-colors no-underline">Terms of Service</a>
                <a href="#" className="block hover:text-[#E5E7EB] transition-colors no-underline">Imprint</a>
              </div>
              <div className="space-y-2">
                <div className="text-[#9CA3AF] font-medium mb-3">Connect</div>
                <a href="#" className="block hover:text-[#E5E7EB] transition-colors no-underline">LinkedIn</a>
                <a href="mailto:hello@nobod.ai" className="block hover:text-[#E5E7EB] transition-colors no-underline">hello@nobod.ai</a>
              </div>
            </div>
          </div>
          <div className="ss flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#1F2937]/30 text-xs text-[#4B5563]">
            <span>{"\u00A9"} 2026 OPCORE Partners AG, Z{"\u00FC"}rich. All rights reserved.</span>
            <span>Made with conviction. Written by nobody.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
