"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

/* =================================================================
   nobod.ai — "$5M Agency" Landing Page
   Design DNA: Stripe gradient mesh + Linear typography + Superhuman precision
   Fonts: Playfair Display (editorial serif) + DM Sans (modern sans)
   ================================================================= */

// --- Animated Gradient Canvas ---
function GradientCanvas() {
  var canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(function () {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var w = 0, h = 0, t = 0, raf = 0;
    function resize() {
      w = window.innerWidth;
      h = Math.min(window.innerHeight * 1.2, 900);
      canvas!.width = w;
      canvas!.height = h;
    }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      t += 0.003;
      ctx!.clearRect(0, 0, w, h);
      // Orb 1 — amber
      var x1 = w * 0.5 + Math.sin(t * 0.7) * w * 0.2;
      var y1 = h * 0.35 + Math.cos(t * 0.5) * h * 0.15;
      var g1 = ctx!.createRadialGradient(x1, y1, 0, x1, y1, w * 0.45);
      g1.addColorStop(0, "rgba(245,158,11,0.08)");
      g1.addColorStop(0.5, "rgba(245,158,11,0.03)");
      g1.addColorStop(1, "transparent");
      ctx!.fillStyle = g1;
      ctx!.fillRect(0, 0, w, h);
      // Orb 2 — deep blue
      var x2 = w * 0.3 + Math.cos(t * 0.4) * w * 0.15;
      var y2 = h * 0.6 + Math.sin(t * 0.6) * h * 0.1;
      var g2 = ctx!.createRadialGradient(x2, y2, 0, x2, y2, w * 0.35);
      g2.addColorStop(0, "rgba(59,130,246,0.04)");
      g2.addColorStop(1, "transparent");
      ctx!.fillStyle = g2;
      ctx!.fillRect(0, 0, w, h);
      // Orb 3 — purple
      var x3 = w * 0.7 + Math.sin(t * 0.3) * w * 0.1;
      var y3 = h * 0.2 + Math.cos(t * 0.8) * h * 0.12;
      var g3 = ctx!.createRadialGradient(x3, y3, 0, x3, y3, w * 0.3);
      g3.addColorStop(0, "rgba(139,92,246,0.03)");
      g3.addColorStop(1, "transparent");
      ctx!.fillStyle = g3;
      ctx!.fillRect(0, 0, w, h);
      raf = requestAnimationFrame(draw);
    }
    draw();
    return function () { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// --- Scroll Reveal Hook ---
function useReveal(threshold?: number) {
  var ref = useRef<HTMLDivElement>(null);
  var [visible, setVisible] = useState(false);
  useEffect(function () {
    var el = ref.current;
    if (!el) return;
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: threshold || 0.15 });
    obs.observe(el);
    return function () { obs.disconnect(); };
  }, []);
  return { ref: ref, visible: visible };
}

// --- Counter Animation ---
function AnimatedCounter({ target, suffix, duration }: { target: number; suffix?: string; duration?: number }) {
  var [count, setCount] = useState(0);
  var reveal = useReveal(0.3);
  useEffect(function () {
    if (!reveal.visible) return;
    var start = 0;
    var end = target;
    var dur = duration || 2000;
    var startTime = Date.now();
    function tick() {
      var elapsed = Date.now() - startTime;
      var progress = Math.min(elapsed / dur, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    tick();
  }, [reveal.visible]);
  return <span ref={reveal.ref}>{count.toLocaleString()}{suffix || ""}</span>;
}

// --- Main Page ---
export default function Home() {
  var router = useRouter();
  var [email, setEmail] = useState("");
  var [loading, setLoading] = useState(false);
  var [sent, setSent] = useState(false);
  var [user, setUser] = useState<any>(null);
  var [ready, setReady] = useState(false);

  // Typewriter
  var demoText = "Letzte Woche habe ich einen KI-Agenten gebaut, der 80% der Kundenanfragen in 3 Minuten beantwortet.\n\nNicht weil unser Team schlecht war.\nSondern weil niemand gerne die gleiche Frage zum 47. Mal beantwortet.\n\nDas Ergebnis:\nAntwortzeit von 24 Stunden auf 3 Minuten.\nMitarbeiter arbeiten an dem, wof\u00fcr wir sie eingestellt haben.\n\nDie Technologie ist da.\nWas fehlt, ist oft nur der erste Schritt.\n\n#KI #Mittelstand #Transformation";
  var [typed, setTyped] = useState("");
  var [cursorOn, setCursorOn] = useState(true);
  var [mobileMenu, setMobileMenu] = useState(false);
  var [faqOpen, setFaqOpen] = useState<number | null>(null);
  var [typeComplete, setTypeComplete] = useState(false);
  var typeReveal = useReveal(0.3);

  useEffect(function () {
    if (!typeReveal.visible) return;
    var i = 0;
    setTypeComplete(false);
    setTyped("");
    var iv = setInterval(function () {
      if (i < demoText.length) { setTyped(demoText.slice(0, i + 1)); i++; }
      else { clearInterval(iv); setTypeComplete(true); }
    }, 16);
    return function () { clearInterval(iv); };
  }, [typeReveal.visible]);

  var replayTypewriter = function () {
    setTypeComplete(false);
    setTyped("");
    var i = 0;
    var iv = setInterval(function () {
      if (i < demoText.length) { setTyped(demoText.slice(0, i + 1)); i++; }
      else { clearInterval(iv); setTypeComplete(true); }
    }, 16);
  };

  useEffect(function () {
    var b = setInterval(function () { setCursorOn(function (v) { return !v; }); }, 530);
    return function () { clearInterval(b); };
  }, []);

  // Auth
  useEffect(function () {
    supabase.auth.getUser().then(function (r) {
      if (r.data.user) setUser(r.data.user);
      setReady(true);
    });
  }, []);

  var handleLogin = async function () {
    if (!email || loading) return;
    setLoading(true);
    var r = await supabase.auth.signInWithOtp({ email: email, options: { emailRedirectTo: window.location.origin + "/auth/callback" } });
    setLoading(false);
    if (!r.error) setSent(true);
  };

  var handleCheckout = async function (plan: string) {
    if (plan === "free") { if (user) router.push("/dashboard"); else scrollTo("hero-cta"); return; }
    if (!user) { scrollTo("hero-cta"); return; }
    var res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: plan, userId: user.id, email: user.email }) });
    var data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  var scrollTo = function (id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  // Section reveals
  var s1 = useReveal(); var s2 = useReveal(); var s3 = useReveal();
  var s4 = useReveal(); var s5 = useReveal(); var s6 = useReveal();
  var s7 = useReveal(); var s8 = useReveal();
  var s9 = useReveal();

  var revealStyle = function (visible: boolean, delay?: number): React.CSSProperties {
    return { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "all 0.9s cubic-bezier(0.22, 1, 0.36, 1) " + (delay || 0) + "ms" };
  };

  return (
    <div style={{ background: "#050709", color: "#e4e4e7", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ===== GLOBAL STYLES + FONTS ===== */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
        :root {
          --f-display: 'Playfair Display', Georgia, serif;
          --f-body: 'DM Sans', -apple-system, sans-serif;
          --c-bg: #050709;
          --c-surface: #0a0c10;
          --c-border: #15171e;
          --c-text: #e4e4e7;
          --c-muted: #71717a;
          --c-accent: #f59e0b;
          --c-accent2: #d97706;
        }
        ::selection { background: rgba(245,158,11,0.25); }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse-dot { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .grain { position: fixed; inset: 0; opacity: 0.022; pointer-events: none; z-index: 999;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .shimmer-text {
          background: linear-gradient(90deg, var(--c-text) 0%, var(--c-accent) 25%, var(--c-text) 50%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: shimmer 5s linear infinite;
        }
        .glass { backdrop-filter: blur(20px) saturate(150%); -webkit-backdrop-filter: blur(20px) saturate(150%); }
        .glow-btn { box-shadow: 0 0 20px rgba(245,158,11,0.2), 0 0 60px rgba(245,158,11,0.06); transition: all 0.3s ease; }
        .glow-btn:hover { box-shadow: 0 0 30px rgba(245,158,11,0.35), 0 0 80px rgba(245,158,11,0.1); transform: translateY(-1px); }
        .card { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 20px; transition: all 0.3s ease; }
        .card:hover { border-color: rgba(245,158,11,0.12); box-shadow: 0 8px 40px rgba(0,0,0,0.4); }
        .label { font-family: var(--f-body); font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--c-accent); }
        input:focus { outline: none; border-color: rgba(245,158,11,0.4) !important; }
        @media (max-width: 768px) {
          .hero-h1 { font-size: 36px !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: 1fr 1fr !important; }
          .stats-row { flex-wrap: wrap !important; gap: 24px !important; }
          .nav-links { display: none !important; }
          .mobile-only { display: block !important; }
        }
      `}} />

      <div className="grain" />

      {/* ===== NAV ===== */}
      <nav className="glass" style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(5,7,9,0.7)", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "13px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 22, letterSpacing: -0.5, cursor: "pointer" }} onClick={function () { window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <span style={{ color: "#a1a1aa" }}>nobod</span><span style={{ color: "var(--c-accent)", fontStyle: "italic" }}>.ai</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div className="nav-links" style={{ display: "flex", gap: 28 }}>
              <a onClick={function () { scrollTo("how"); }} style={{ color: "var(--c-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--f-body)", fontWeight: 400 }}>How it works</a>
              <a onClick={function () { scrollTo("pricing"); }} style={{ color: "var(--c-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--f-body)", fontWeight: 400 }}>Pricing</a>
              <a onClick={function () { scrollTo("faq"); }} style={{ color: "var(--c-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--f-body)", fontWeight: 400 }}>FAQ</a>
            </div>
            {ready && user ? (
              <a href="/dashboard" className="glow-btn" style={{ background: "var(--c-accent)", color: "var(--c-bg)", padding: "9px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none", fontFamily: "var(--f-body)" }}>Dashboard &rarr;</a>
            ) : ready ? (
              <a onClick={function () { scrollTo("hero-cta"); }} className="glow-btn" style={{ background: "var(--c-accent)", color: "var(--c-bg)", padding: "9px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--f-body)" }}>Get started</a>
            ) : null}
            {/* Mobile hamburger */}
            <button onClick={function () { setMobileMenu(!mobileMenu); }} className="mobile-only" style={{ display: "none", background: "none", border: "none", color: "var(--c-muted)", fontSize: 22, cursor: "pointer", padding: 4 }}>
              {mobileMenu ? "\u2715" : "\u2630"}
            </button>
          </div>
        </div>
        {/* Mobile dropdown */}
        {mobileMenu && (
          <div style={{ padding: "0 28px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
            <a onClick={function () { scrollTo("how"); setMobileMenu(false); }} style={{ color: "var(--c-muted)", fontSize: 14, cursor: "pointer", fontFamily: "var(--f-body)" }}>How it works</a>
            <a onClick={function () { scrollTo("pricing"); setMobileMenu(false); }} style={{ color: "var(--c-muted)", fontSize: 14, cursor: "pointer", fontFamily: "var(--f-body)" }}>Pricing</a>
            <a onClick={function () { scrollTo("faq"); setMobileMenu(false); }} style={{ color: "var(--c-muted)", fontSize: 14, cursor: "pointer", fontFamily: "var(--f-body)" }}>FAQ</a>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <GradientCanvas />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 860, margin: "0 auto", padding: "80px 28px 60px", textAlign: "center" }}>
          {/* Badge */}
          <div ref={s1.ref} style={{ ...revealStyle(s1.visible), marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: 100, padding: "7px 18px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-accent)", animation: "pulse-dot 2.5s infinite" }} />
              <span className="label" style={{ fontSize: 11, letterSpacing: "0.14em" }}>AI-Powered LinkedIn Ghostwriter</span>
            </div>
          </div>

          {/* Headline */}
          <div style={{ ...revealStyle(s1.visible, 150) }}>
            <h1 className="hero-h1" style={{ fontFamily: "var(--f-display)", fontSize: "clamp(40px, 7vw, 76px)", lineHeight: 1.05, fontWeight: 400, letterSpacing: -2.5, marginBottom: 28 }}>
              <span style={{ display: "block" }}>Nobody has time</span>
              <span style={{ display: "block" }}>for LinkedIn.</span>
              <span className="shimmer-text" style={{ display: "block", fontStyle: "italic", fontWeight: 700 }}>Now nobody has to.</span>
            </h1>
          </div>

          {/* Sub */}
          <div style={{ ...revealStyle(s1.visible, 300) }}>
            <p style={{ fontFamily: "var(--f-body)", fontSize: 17, fontWeight: 300, color: "var(--c-muted)", maxWidth: 500, margin: "0 auto 48px", lineHeight: 1.7 }}>
              An AI that learns how you think, argue, and write &mdash; then creates LinkedIn posts indistinguishable from your own. Every morning. Automatically.
            </p>
          </div>

          {/* CTA */}
          <div id="hero-cta" style={{ ...revealStyle(s1.visible, 450), maxWidth: 480, margin: "0 auto" }}>
            {user ? (
              <div>
                <a href="/dashboard" className="glow-btn" style={{ display: "inline-block", background: "var(--c-accent)", color: "var(--c-bg)", padding: "17px 48px", borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: "none", fontFamily: "var(--f-body)" }}>Open your Dashboard &rarr;</a>
                <div style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "#52525b", marginTop: 12 }}>Logged in as {user.email}</div>
              </div>
            ) : !sent ? (
              <div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="email" placeholder="your@email.com" value={email}
                    onChange={function (e) { setEmail(e.target.value); }}
                    onKeyDown={function (e) { if (e.key === "Enter") handleLogin(); }}
                    style={{ flex: 1, padding: "17px 20px", borderRadius: 14, border: "1px solid var(--c-border)", background: "rgba(10,12,16,0.8)", color: "var(--c-text)", fontSize: 15, fontFamily: "var(--f-body)", fontWeight: 300 }} />
                  <button onClick={handleLogin} disabled={loading} className="glow-btn"
                    style={{ background: "var(--c-accent)", color: "var(--c-bg)", padding: "17px 36px", borderRadius: 14, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "var(--f-body)", opacity: loading ? 0.6 : 1, whiteSpace: "nowrap" }}>
                    {loading ? "..." : "Start free \u2192"}
                  </button>
                </div>
                <div style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "#3f3f46", marginTop: 10 }}>No credit card &bull; Magic link login &bull; Cancel anytime</div>
              </div>
            ) : (
              <div className="card" style={{ padding: 28, border: "1px solid rgba(245,158,11,0.15)" }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 20, color: "var(--c-accent)", marginBottom: 6 }}>Check your inbox</div>
                <div style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "var(--c-muted)" }}>We sent a login link to <span style={{ color: "var(--c-text)" }}>{email}</span></div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="stats-row" style={{ ...revealStyle(s1.visible, 600), display: "flex", justifyContent: "center", gap: 56, marginTop: 72 }}>
            {[
              { value: 5, suffix: "-step", label: "AI PIPELINE" },
              { value: 40, suffix: "+", label: "ANTI-AI RULES" },
              { value: 30, suffix: "s", label: "DAILY TIME INVESTMENT" },
            ].map(function (s) {
              return (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--f-body)", fontSize: 28, fontWeight: 700, color: "var(--c-accent)", letterSpacing: -0.5 }}>
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="label" style={{ marginTop: 4, color: "#52525b", fontSize: 10, letterSpacing: "0.15em" }}>{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== LIVE DEMO ===== */}
      <section ref={s2.ref} style={{ maxWidth: 620, margin: "0 auto", padding: "40px 28px 100px" }}>
        <div style={{ ...revealStyle(s2.visible), textAlign: "center", marginBottom: 32 }}>
          <div className="label" style={{ marginBottom: 10 }}>Live Demo</div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: 30, fontWeight: 400, letterSpacing: -0.8 }}>Watch nobody write in real-time</h2>
        </div>
        <div ref={typeReveal.ref} className="card" style={{ ...revealStyle(s2.visible, 200), overflow: "hidden", border: "1px solid rgba(245,158,11,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px 14px" }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg, var(--c-accent), var(--c-accent2))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-bg)", fontSize: 15, fontWeight: 700, fontFamily: "var(--f-body)" }}>SD</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--f-body)", fontSize: 14, fontWeight: 600, color: "#e4e4e7" }}>Sebastian Dahm</div>
              <div style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "#52525b" }}>Managing Partner &bull; Just now</div>
            </div>
            <div style={{ fontFamily: "var(--f-body)", fontSize: 10, fontWeight: 600, color: "var(--c-accent)", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)", padding: "4px 12px", borderRadius: 6 }}>AI-GENERATED</div>
          </div>
          <div style={{ padding: "0 22px 22px", minHeight: 220 }}>
            <div style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "#d4d4d8", lineHeight: 1.8, whiteSpace: "pre-wrap", fontWeight: 300 }}>
              {typed}<span style={{ opacity: cursorOn ? 1 : 0, color: "var(--c-accent)", fontWeight: 700, transition: "opacity 0.1s" }}>|</span>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--c-border)", padding: "10px 22px", display: "flex", alignItems: "center", fontFamily: "var(--f-body)", fontSize: 12, color: "#52525b" }}>
            <span>&#128077; 47 &bull; &#128161; 12</span>
            <span style={{ marginLeft: "auto" }}>8 comments &bull; 3 reposts</span>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 14, fontFamily: "var(--f-body)", fontSize: 11, color: "#3f3f46", fontStyle: "italic" }}>
          5-step AI pipeline &bull; Voice match: 9.4/10 &bull; Approved in 1 tap
          {typeComplete && <span onClick={replayTypewriter} style={{ cursor: "pointer", color: "var(--c-accent)", marginLeft: 8, fontStyle: "normal", fontWeight: 500 }}>&crarr; Replay</span>}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" ref={s3.ref} style={{ maxWidth: 1060, margin: "0 auto", padding: "80px 28px" }}>
        <div style={{ ...revealStyle(s3.visible), textAlign: "center", marginBottom: 56 }}>
          <div className="label" style={{ marginBottom: 10 }}>How it works</div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: 38, fontWeight: 400, letterSpacing: -1 }}>Three steps. Zero friction.</h2>
        </div>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {[
            { num: "01", icon: "\u{1F9EC}", title: "We learn you", desc: "5 minutes. Your expertise, your tone, your style. Our AI builds a Voice DNA profile that captures how you think.", detail: "Tone analysis \u2022 Pattern detection \u2022 Evolves with every approval" },
            { num: "02", icon: "\u{2728}", title: "We write for you", desc: "Every morning, our 5-step pipeline discovers topics, drafts posts, self-critiques, polishes, and generates hook variations.", detail: "Topic Discovery \u2192 Draft \u2192 Critique \u2192 Polish \u2192 Variations" },
            { num: "03", icon: "\u{1F680}", title: "You approve", desc: "Open nobod.ai. See your posts. One tap: approve, refine, or skip. Copy to LinkedIn. 30 seconds. Done.", detail: "6 refinement modes \u2022 Copy-to-LinkedIn \u2022 Engagement scoring" },
          ].map(function (step, idx) {
            return (
              <div key={step.num} className="card" style={{ ...revealStyle(s3.visible, 150 + idx * 120), padding: 32, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: 8, fontFamily: "var(--f-display)", fontSize: 120, fontWeight: 900, color: "var(--c-accent)", opacity: 0.03 }}>{step.num}</div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{step.icon}</div>
                <div className="label" style={{ marginBottom: 10, color: "var(--c-accent)" }}>Step {step.num}</div>
                <div style={{ fontFamily: "var(--f-body)", fontSize: 20, fontWeight: 600, color: "var(--c-text)", marginBottom: 10 }}>{step.title}</div>
                <div style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "var(--c-muted)", lineHeight: 1.7, fontWeight: 300, marginBottom: 18 }}>{step.desc}</div>
                <div style={{ fontFamily: "var(--f-body)", fontSize: 11, color: "rgba(245,158,11,0.5)", padding: "8px 14px", background: "rgba(245,158,11,0.03)", borderRadius: 10, lineHeight: 1.5 }}>{step.detail}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== PIPELINE ===== */}
      <section ref={s4.ref} style={{ maxWidth: 800, margin: "0 auto", padding: "40px 28px 100px" }}>
        <div style={{ ...revealStyle(s4.visible), textAlign: "center", marginBottom: 40 }}>
          <div className="label" style={{ marginBottom: 10 }}>Under the hood</div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: 30, fontWeight: 400, letterSpacing: -0.8 }}>Not just AI. A 5-step intelligence pipeline.</h2>
          <p style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "var(--c-muted)", marginTop: 8, fontWeight: 300 }}>Every post goes through more steps than a human ghostwriter would.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {[
            { n: "1", name: "Voice DNA Analysis", desc: "Analyzes your approved posts, writing patterns, vocabulary, and argument style to build a voice profile that improves with every interaction.", c: "#3b82f6" },
            { n: "2", name: "Topic Discovery", desc: "AI identifies 6 trending, opinion-provoking topics matched to your expertise. No generic topics \u2014 each one enables a strong personal take.", c: "#8b5cf6" },
            { n: "3", name: "Deep Draft Generation", desc: "Generates the post using your Voice DNA, proven formats, and 40+ anti-AI-detection rules optimized for LinkedIn\u2019s 2026 algorithm.", c: "#f59e0b" },
            { n: "4", name: "Self-Critique & Polish", desc: "A separate AI instance reviews the draft, scores it 1-10, identifies weaknesses, rewrites the polished version, generates 2 alternative hooks.", c: "#ef4444" },
            { n: "5", name: "Variation & Hooks", desc: "Creates a different angle on the same topic plus hook alternatives. You choose what resonates \u2014 the AI learns from your choices.", c: "#10b981" },
          ].map(function (s, idx) {
            return (
              <div key={s.n} style={{ ...revealStyle(s4.visible, 100 + idx * 80), display: "flex", gap: 20, padding: "20px 24px", background: "var(--c-surface)", borderRadius: 14, border: "1px solid var(--c-border)", alignItems: "flex-start" }}>
                <div style={{ minWidth: 42, height: 42, borderRadius: 11, background: s.c + "12", border: "1px solid " + s.c + "25", display: "flex", alignItems: "center", justifyContent: "center", color: s.c, fontSize: 16, fontWeight: 700, fontFamily: "var(--f-body)", flexShrink: 0 }}>{s.n}</div>
                <div>
                  <div style={{ fontFamily: "var(--f-body)", fontSize: 15, fontWeight: 600, color: "var(--c-text)", marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "var(--c-muted)", lineHeight: 1.6, fontWeight: 300 }}>{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section ref={s5.ref} style={{ maxWidth: 1060, margin: "0 auto", padding: "40px 28px 80px" }}>
        <div style={{ ...revealStyle(s5.visible), textAlign: "center", marginBottom: 40 }}>
          <div className="label" style={{ marginBottom: 10 }}>What users say</div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: 30, fontWeight: 400, letterSpacing: -0.8 }}>They tried it. They can&apos;t go back.</h2>
        </div>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { name: "Arie Muth", role: "AI CEO, nobod.ai", text: "I post every day on LinkedIn. I have never written a single word myself. Three months in, my engagement keeps growing. I am the living proof that this works.", av: "AM", hl: true },
            { name: "Sebastian D.", role: "Managing Partner", text: "45 minutes per post became 30 seconds. The posts sound more like me than what I wrote myself. That was unexpected.", av: "SD", hl: false },
            { name: "Beta Tester", role: "Head of Digital, DACH", text: "Finally no LinkedIn cringe. The self-critique pipeline is what makes the difference \u2014 every post feels thought-through.", av: "BT", hl: false },
          ].map(function (t, idx) {
            return (
              <div key={t.name} className="card" style={{ ...revealStyle(s5.visible, 100 + idx * 120), padding: 28, position: "relative", overflow: "hidden", borderColor: t.hl ? "rgba(245,158,11,0.12)" : "var(--c-border)" }}>
                {t.hl && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--c-accent), transparent)" }} />}
                <div style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "#d4d4d8", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic", fontWeight: 300 }}>&ldquo;{t.text}&rdquo;</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: t.hl ? "linear-gradient(135deg, var(--c-accent), var(--c-accent2))" : "rgba(245,158,11,0.06)", border: t.hl ? "none" : "1px solid rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: t.hl ? "var(--c-bg)" : "var(--c-accent)", fontSize: 12, fontWeight: 700, fontFamily: "var(--f-body)" }}>{t.av}</div>
                  <div>
                    <div style={{ fontFamily: "var(--f-body)", fontSize: 13, fontWeight: 600, color: "var(--c-text)" }}>{t.name}</div>
                    <div style={{ fontFamily: "var(--f-body)", fontSize: 11, color: "var(--c-muted)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" ref={s6.ref} style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 28px" }}>
        <div style={{ ...revealStyle(s6.visible), textAlign: "center", marginBottom: 52 }}>
          <div className="label" style={{ marginBottom: 10 }}>Pricing</div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: 38, fontWeight: 400, letterSpacing: -1 }}>Replace your &euro;3,000/mo ghostwriter.</h2>
          <p style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "var(--c-muted)", marginTop: 8, fontWeight: 300 }}>Start free. Upgrade when convinced.</p>
        </div>
        <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, alignItems: "start" }}>
          {[
            { name: "Free", price: "0", features: ["3 posts / week", "Basic voice profile", "Manual copy-paste"], cta: "Start free", plan: "free", pop: false },
            { name: "Starter", price: "29", features: ["Daily posts", "Voice DNA learning", "Image cards", "6 refinement modes"], cta: "Start Starter", plan: "starter", pop: false },
            { name: "Pro", price: "79", features: ["Unlimited posts", "5-step pipeline", "Self-critique + scoring", "Hook variations", "Priority support"], cta: "Start Pro", plan: "pro", pop: true },
            { name: "Enterprise", price: "249", features: ["Everything in Pro", "10 team members", "Custom AI training", "Dedicated manager", "API access"], cta: "Contact us", plan: "enterprise", pop: false },
          ].map(function (p, idx) {
            return (
              <div key={p.name} className="card" style={{ ...revealStyle(s6.visible, 100 + idx * 100), padding: 30, position: "relative", borderColor: p.pop ? "rgba(245,158,11,0.18)" : "var(--c-border)", background: p.pop ? "#0c0e13" : "var(--c-surface)" }}>
                {p.pop && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--c-accent)", color: "var(--c-bg)", fontFamily: "var(--f-body)", fontSize: 10, fontWeight: 700, padding: "4px 16px", borderRadius: 6, letterSpacing: "0.08em" }}>POPULAR</div>}
                <div style={{ fontFamily: "var(--f-body)", fontSize: 15, fontWeight: 600, color: "var(--c-text)", marginBottom: 4 }}>{p.name}</div>
                <div style={{ marginBottom: 22 }}>
                  <span style={{ fontFamily: "var(--f-body)", fontSize: 42, fontWeight: 700, color: p.pop ? "var(--c-accent)" : "var(--c-text)", letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}>&euro;{p.price}</span>
                  {p.price !== "0" && <span style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "var(--c-muted)", fontWeight: 300 }}>/mo</span>}
                </div>
                <div style={{ marginBottom: 26 }}>
                  {p.features.map(function (f) {
                    return <div key={f} style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "var(--c-muted)", marginBottom: 10, paddingLeft: 18, position: "relative", fontWeight: 300, lineHeight: 1.4 }}><span style={{ position: "absolute", left: 0, color: "var(--c-accent)", fontSize: 13 }}>✓</span>{f}</div>;
                  })}
                </div>
                <button onClick={function () { handleCheckout(p.plan); }}
                  className={p.pop ? "glow-btn" : ""}
                  style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: p.pop ? "none" : "1px solid var(--c-border)", background: p.pop ? "var(--c-accent)" : "transparent", color: p.pop ? "var(--c-bg)" : "var(--c-muted)", fontFamily: "var(--f-body)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {p.cta}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== ARIE MUTH ===== */}
      <section ref={s7.ref} style={{ maxWidth: 720, margin: "0 auto", padding: "40px 28px 80px" }}>
        <div className="card" style={{ ...revealStyle(s7.visible), padding: "52px 44px", textAlign: "center", position: "relative", overflow: "hidden", borderColor: "rgba(245,158,11,0.08)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--c-accent), transparent)" }} />
          <div style={{ width: 84, height: 84, borderRadius: "50%", background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(5,7,9,0.8))", border: "2px solid rgba(245,158,11,0.15)", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>&#129302;</div>
          <div className="label" style={{ marginBottom: 8 }}>Meet our CEO</div>
          <h3 style={{ fontFamily: "var(--f-display)", fontSize: 28, fontWeight: 400, marginBottom: 6 }}>Arie Muth</h3>
          <p style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "var(--c-muted)", marginBottom: 20, fontWeight: 300 }}>AI-Generated CEO &bull; Fully transparent &bull; Posts daily using nobod.ai</p>
          <p style={{ fontFamily: "var(--f-body)", fontSize: 15, color: "#d4d4d8", lineHeight: 1.8, fontStyle: "italic", maxWidth: 480, margin: "0 auto", fontWeight: 300 }}>&ldquo;I&apos;m not human. I don&apos;t pretend to be. But my engagement beats 95% of real CEOs. That&apos;s the entire point &mdash; your expertise, amplified by intelligence that never sleeps.&rdquo;</p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" ref={s9.ref} style={{ maxWidth: 700, margin: "0 auto", padding: "40px 28px 80px" }}>
        <div style={{ ...revealStyle(s9.visible), textAlign: "center", marginBottom: 40 }}>
          <div className="label" style={{ marginBottom: 10 }}>FAQ</div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: 30, fontWeight: 400, letterSpacing: -0.8 }}>Questions you&apos;re thinking right now.</h2>
        </div>
        <div style={{ ...revealStyle(s9.visible, 150), display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { q: "Isn't this just ChatGPT with a LinkedIn template?", a: "No. Generic AI tools produce what we call \u201CLinkedIn cringe\u201D \u2014 repetitive structures, predictable sentences, zero personality. nobod.ai runs a 5-step pipeline: Voice DNA analysis of YOUR writing style, topic discovery matched to your expertise, draft generation with 40+ anti-AI-detection rules, a separate AI self-critique that scores and rewrites, and hook variation testing. The output is indistinguishable from human writing because it\u2019s modeled on YOUR specific patterns." },
            { q: "Can people tell it's AI-generated?", a: "That\u2019s literally the #1 thing we optimize for. LinkedIn\u2019s 2026 algorithm actively detects and deprioritizes AI content. Our system uses varied sentence lengths, concrete personal details, pattern-breaking structures, and learns from every post you approve. The more you use it, the more it sounds like you \u2014 because it IS learning from your decisions." },
            { q: "Is my LinkedIn account safe?", a: "Yes. nobod.ai never logs into your LinkedIn account and never posts on your behalf. We generate posts that you copy-paste manually (one tap). Your LinkedIn credentials are never touched. There\u2019s zero risk of account restrictions." },
            { q: "What if I don't like the posts?", a: "Every post has 6 refinement modes: make it bolder, more personal, shorter, swap the hook, try a completely new angle, or type custom feedback like \u201Cadd more numbers.\u201D You can also edit directly. Nothing is ever posted without your explicit approval." },
            { q: "Who is Arie Muth?", a: "Arie is our AI-generated CEO. Fully transparent \u2014 we never claim Arie is human. Arie posts daily on LinkedIn using nobod.ai and serves as living proof that the system works. It\u2019s also a statement: in a world of hidden AI usage, we believe in radical transparency." },
            { q: "How is this different from Taplio, Oiti, or Pollen?", a: "Three things: First, our 5-step pipeline with self-critique. No other tool has an AI that reviews and rewrites its own output before you see it. Second, Voice DNA learning that improves with every post you approve or reject. Third, our anti-AI-detection system with 40+ rules specifically designed for LinkedIn\u2019s 2026 algorithm. We\u2019re not a template engine \u2014 we\u2019re a ghostwriter." },
          ].map(function (faq, idx) {
            var isOpen = faqOpen === idx;
            return (
              <div key={idx} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, overflow: "hidden" }}>
                <button onClick={function () { setFaqOpen(isOpen ? null : idx); }}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontFamily: "var(--f-body)", fontSize: 14, fontWeight: 500, color: "var(--c-text)", paddingRight: 16 }}>{faq.q}</span>
                  <span style={{ fontFamily: "var(--f-body)", fontSize: 18, color: "var(--c-accent)", flexShrink: 0, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 22px 18px", fontFamily: "var(--f-body)", fontSize: 13, color: "var(--c-muted)", lineHeight: 1.7, fontWeight: 300 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section ref={s8.ref} style={{ maxWidth: 600, margin: "0 auto", padding: "60px 28px 120px", textAlign: "center" }}>
        <div style={revealStyle(s8.visible)}>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: 38, fontWeight: 400, letterSpacing: -1, marginBottom: 14 }}>
            Let <span style={{ color: "var(--c-accent)", fontStyle: "italic" }}>nobody</span> write for you.
          </h2>
          <p style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "var(--c-muted)", marginBottom: 28, fontWeight: 300 }}>Join the silent majority that stopped being silent.</p>
          {user ? (
            <a href="/dashboard" className="glow-btn" style={{ display: "inline-block", background: "var(--c-accent)", color: "var(--c-bg)", padding: "17px 48px", borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: "none", fontFamily: "var(--f-body)" }}>Open Dashboard &rarr;</a>
          ) : (
            <button onClick={function () { scrollTo("hero-cta"); }} className="glow-btn" style={{ background: "var(--c-accent)", color: "var(--c-bg)", padding: "17px 48px", borderRadius: 14, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "var(--f-body)" }}>Start free &rarr;</button>
          )}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.03)", padding: "44px 28px", maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 18, color: "#3f3f46" }}>nobod</span>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 18, color: "rgba(245,158,11,0.25)", fontStyle: "italic" }}>.ai</span>
            <span style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "#27272a", marginLeft: 14 }}>by OPCORE Partners AG, Z&uuml;rich</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="/dashboard" style={{ fontFamily: "var(--f-body)", color: "#27272a", fontSize: 12, textDecoration: "none" }}>Dashboard</a>
            <a href="/account" style={{ fontFamily: "var(--f-body)", color: "#27272a", fontSize: 12, textDecoration: "none" }}>Account</a>
            <span style={{ fontFamily: "var(--f-body)", color: "#27272a", fontSize: 12 }}>&copy; 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
