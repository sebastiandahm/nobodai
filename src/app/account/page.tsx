"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const HEADING_FONTS = [
  "Georgia",
  "Playfair Display",
  "Merriweather",
  "Lora",
  "EB Garamond",
  "Inter",
  "Poppins",
  "Montserrat",
  "Space Grotesk",
  "Manrope",
];

const BODY_FONTS = [
  "Georgia",
  "Inter",
  "Source Sans 3",
  "Lora",
  "Manrope",
  "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
];

const STYLE_PRESETS = [
  { value: "editorial", label: "Editorial — Serif, amber accent, dark" },
  { value: "bold", label: "Bold — High contrast, sans, punchy" },
  { value: "minimal", label: "Minimal — Thin sans, monochrome" },
];

export default function Account() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [voice, setVoice] = useState<any>(null);
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [brandLogoUrl, setBrandLogoUrl] = useState("");
  const [brandPrimary, setBrandPrimary] = useState("#F59E0B");
  const [brandSecondary, setBrandSecondary] = useState("#0D1117");
  const [brandFontHeading, setBrandFontHeading] = useState("Georgia");
  const [brandFontBody, setBrandFontBody] = useState("Inter");
  const [brandPreset, setBrandPreset] = useState("editorial");
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandMsg, setBrandMsg] = useState<{ text: string; kind: "info" | "error" | "success" } | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      setUser(user);

      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);
      if (p) {
        if (p.brand_logo_url) setBrandLogoUrl(p.brand_logo_url);
        if (p.brand_primary_color) setBrandPrimary(p.brand_primary_color);
        if (p.brand_secondary_color) setBrandSecondary(p.brand_secondary_color);
        if (p.brand_font_heading) setBrandFontHeading(p.brand_font_heading);
        if (p.brand_font_body) setBrandFontBody(p.brand_font_body);
        if (p.brand_style_preset) setBrandPreset(p.brand_style_preset);
      }

      const { data: v } = await supabase.rpc("get_voice_profile", { p_user_id: user.id });
      if (v && v.length > 0) setVoice(v[0]);

      const { data: s } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single();
      setSub(s);

      setLoading(false);
    };
    load();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleLogoUpload = async (file: File) => {
    if (!user) return;
    setLogoUploading(true);
    setBrandMsg(null);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("brand-assets")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) {
        const msg = (upErr.message || "").toLowerCase();
        if (msg.includes("bucket") || msg.includes("not found")) {
          setBrandMsg({
            text: "Bucket 'brand-assets' in Supabase Storage anlegen (project awmastpeybhlaiqqvace, public = true)",
            kind: "error",
          });
        } else {
          setBrandMsg({ text: "Upload failed: " + upErr.message, kind: "error" });
        }
        setLogoUploading(false);
        return;
      }
      const { data } = supabase.storage.from("brand-assets").getPublicUrl(path);
      setBrandLogoUrl(data.publicUrl);
      setBrandMsg({ text: "Logo uploaded. Click Save to persist.", kind: "info" });
    } catch (err: any) {
      setBrandMsg({ text: "Upload error: " + (err?.message || "unknown"), kind: "error" });
    }
    setLogoUploading(false);
  };

  const handleBrandSave = async () => {
    if (!user) return;
    setBrandSaving(true);
    setBrandMsg(null);
    const { error } = await supabase
      .from("profiles")
      .update({
        brand_logo_url: brandLogoUrl || null,
        brand_primary_color: brandPrimary || null,
        brand_secondary_color: brandSecondary || null,
        brand_font_heading: brandFontHeading || null,
        brand_font_body: brandFontBody || null,
        brand_style_preset: brandPreset || "editorial",
      })
      .eq("id", user.id);
    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("column") || msg.includes("brand_")) {
        setBrandMsg({
          text: "Schema not applied yet — run supabase/migrations/20260416_add_brand_kit.sql in SQL Editor first.",
          kind: "error",
        });
      } else {
        setBrandMsg({ text: "Save failed: " + error.message, kind: "error" });
      }
    } else {
      setBrandMsg({ text: "Brand kit saved.", kind: "success" });
    }
    setBrandSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080C] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F59E0B]/30 border-t-[#F59E0B] rounded-full animate-spin" />
      </div>
    );
  }

  const planColors: Record<string, string> = {
    free: "#6B7280",
    starter: "#3B82F6",
    pro: "#F59E0B",
    enterprise: "#8B5CF6",
  };

  return (
    <div className="min-h-screen bg-[#06080C] text-[#E5E7EB]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937] max-w-4xl mx-auto">
        <a href="/" className="text-xl no-underline text-[#E5E7EB]" style={{ fontFamily: "Georgia, serif" }}>
          <span>nobod</span><span className="text-[#F59E0B] italic">.ai</span>
        </a>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-xs text-[#9CA3AF] hover:text-[#E5E7EB] transition-colors">
            &larr; Dashboard
          </button>
          <button onClick={handleSignOut} className="text-xs text-red-400 hover:text-red-300 transition-colors">
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-8" style={{ fontFamily: "Georgia, serif" }}>Account Settings</h1>

        {/* Profile */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-medium text-[#F59E0B] uppercase tracking-wider mb-4">Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-[#6B7280] mb-1">Name</div>
              <div className="text-sm">{profile?.full_name || "Not set"}</div>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] mb-1">Email</div>
              <div className="text-sm">{user?.email}</div>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] mb-1">Member since</div>
              <div className="text-sm">{new Date(user?.created_at).toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] mb-1">Onboarding</div>
              <div className="text-sm">{profile?.onboarding_completed ? <span className="text-green-400">Completed</span> : <span className="text-[#F59E0B]">Pending</span>}</div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-medium text-[#F59E0B] uppercase tracking-wider mb-4">Subscription</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: (planColors[sub?.plan || "free"] || "#6B7280") + "20", color: planColors[sub?.plan || "free"] || "#6B7280", border: `1px solid ${planColors[sub?.plan || "free"] || "#6B7280"}30` }}>
              {(sub?.plan || "free").toUpperCase()}
            </div>
            <div className="text-sm text-[#9CA3AF]">
              {sub?.status === "active" ? <span className="text-green-400">Active</span> : <span className="text-[#6B7280]">Inactive</span>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-[#6B7280] mb-1">Posts limit</div>
              <div className="text-sm">{sub?.posts_limit || 3} posts / week</div>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] mb-1">Posts used this period</div>
              <div className="text-sm">{sub?.posts_used || 0} / {sub?.posts_limit || 3}</div>
            </div>
          </div>
          {(sub?.plan === "free" || !sub?.plan) && (
            <div className="mt-4 p-4 bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl">
              <div className="text-sm text-[#F59E0B] mb-1">Upgrade to Pro</div>
              <div className="text-xs text-[#9CA3AF] mb-3">Get daily posts, image generation, custom topics, and priority support.</div>
              <button onClick={async () => { const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: "pro", userId: user.id, email: user.email }) }); const data = await res.json(); if (data.url) { window.location.href = data.url; } else { alert(data.error || "Checkout failed"); } }} className="bg-[#F59E0B] text-[#06080C] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#FBBF24] transition-colors">                 Upgrade to Pro &mdash; &euro;79/mo               </button>
            </div>
          )}
        </div>

        {/* Brand Kit */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[#F59E0B] uppercase tracking-wider">Brand Kit</h2>
            <span className="text-xs text-[#6B7280]">Applied to generated visuals</span>
          </div>

          <div className="space-y-5">
            {/* Logo */}
            <div>
              <div className="text-xs text-[#6B7280] mb-2">Logo</div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg border border-[#1F2937] bg-[#06080C] flex items-center justify-center overflow-hidden">
                  {brandLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brandLogoUrl} alt="brand logo" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-[#374151]">no logo</span>
                  )}
                </div>
                <label className="bg-[#1F2937] border border-[#374151] px-3 py-2 rounded-lg text-xs text-[#E5E7EB] hover:border-[#F59E0B]/40 transition-colors cursor-pointer">
                  {logoUploading ? "Uploading..." : "Upload logo"}
                  <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
                </label>
                {brandLogoUrl && (
                  <button onClick={() => setBrandLogoUrl("")} className="text-xs text-red-400/70 hover:text-red-400">Remove</button>
                )}
              </div>
              <div className="text-[10px] text-[#6B7280] mt-2">PNG with transparent background recommended, min 512×512.</div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[#6B7280] mb-2">Primary color</div>
                <div className="flex items-center gap-3">
                  <input type="color" value={brandPrimary} onChange={(e) => setBrandPrimary(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-[#1F2937] bg-transparent cursor-pointer" />
                  <input type="text" value={brandPrimary} onChange={(e) => setBrandPrimary(e.target.value)}
                    className="flex-1 bg-[#06080C] border border-[#1F2937] rounded-lg px-3 py-2 text-xs font-mono text-[#E5E7EB] focus:border-[#F59E0B]/40 focus:outline-none" />
                </div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280] mb-2">Secondary color</div>
                <div className="flex items-center gap-3">
                  <input type="color" value={brandSecondary} onChange={(e) => setBrandSecondary(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-[#1F2937] bg-transparent cursor-pointer" />
                  <input type="text" value={brandSecondary} onChange={(e) => setBrandSecondary(e.target.value)}
                    className="flex-1 bg-[#06080C] border border-[#1F2937] rounded-lg px-3 py-2 text-xs font-mono text-[#E5E7EB] focus:border-[#F59E0B]/40 focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Fonts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[#6B7280] mb-2">Heading font</div>
                <select value={brandFontHeading} onChange={(e) => setBrandFontHeading(e.target.value)}
                  className="w-full bg-[#06080C] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-[#E5E7EB] focus:border-[#F59E0B]/40 focus:outline-none">
                  {HEADING_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <div className="mt-2 text-lg text-[#E5E7EB]" style={{ fontFamily: brandFontHeading }}>The quick brown fox.</div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280] mb-2">Body font</div>
                <select value={brandFontBody} onChange={(e) => setBrandFontBody(e.target.value)}
                  className="w-full bg-[#06080C] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-[#E5E7EB] focus:border-[#F59E0B]/40 focus:outline-none">
                  {BODY_FONTS.map((f) => <option key={f} value={f}>{f.split(",")[0]}</option>)}
                </select>
                <div className="mt-2 text-sm text-[#9CA3AF]" style={{ fontFamily: brandFontBody }}>Jumped over the lazy dog.</div>
              </div>
            </div>

            {/* Preset */}
            <div>
              <div className="text-xs text-[#6B7280] mb-2">Style preset</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {STYLE_PRESETS.map((p) => (
                  <button key={p.value} onClick={() => setBrandPreset(p.value)}
                    className={"text-left px-3 py-2.5 rounded-lg border text-xs transition-colors " +
                      (brandPreset === p.value
                        ? "border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]"
                        : "border-[#1F2937] bg-[#06080C] text-[#9CA3AF] hover:border-[#374151]")}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleBrandSave} disabled={brandSaving}
                className="bg-[#F59E0B] text-[#06080C] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#FBBF24] transition-colors disabled:opacity-50">
                {brandSaving ? "Saving..." : "Save brand kit"}
              </button>
              {brandMsg && (
                <div className={"text-xs " +
                  (brandMsg.kind === "error" ? "text-red-400" :
                   brandMsg.kind === "success" ? "text-green-400" : "text-[#9CA3AF]")}>
                  {brandMsg.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Voice Profile */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-medium text-[#F59E0B] uppercase tracking-wider mb-4">Voice Profile</h2>
          {voice ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-[#6B7280] mb-1">Language</div>
                <div className="text-sm">{voice.language === "de" ? "Deutsch" : voice.language === "en" ? "English" : voice.language}</div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280] mb-1">Expertise Topics</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(voice.expertise_topics || []).map((t: string) => (
                    <span key={t} className="px-2.5 py-1 bg-[#1F2937] rounded-lg text-xs text-[#9CA3AF]">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280] mb-1">Goals</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(voice.goals || []).map((g: string) => (
                    <span key={g} className="px-2.5 py-1 bg-[#1F2937] rounded-lg text-xs text-[#9CA3AF]">{g}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-[#6B7280] mb-1">Formality</div>
                  <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: `${(voice.tone_formality || 0.5) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#6B7280] mb-1">Humor</div>
                  <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: `${(voice.tone_humor || 0.3) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#6B7280] mb-1">Provocation</div>
                  <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: `${(voice.tone_provocation || 0.5) * 100}%` }} />
                  </div>
                </div>
              </div>
              <button onClick={() => router.push("/onboarding")}
                className="text-xs text-[#F59E0B] hover:text-[#FBBF24] transition-colors mt-2">
                Edit voice profile &rarr;
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-sm text-[#6B7280] mb-3">No voice profile yet.</div>
              <button onClick={() => router.push("/onboarding")}
                className="bg-[#F59E0B] text-[#06080C] px-4 py-2 rounded-lg text-xs font-semibold">
                Set up your voice profile
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-[#111827] border border-red-900/30 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-4">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Delete Account</div>
              <div className="text-xs text-[#6B7280]">Permanently delete your account, voice profile, and all drafts.</div>
            </div>
            <button onClick={async () => { if (window.confirm("Are you sure? This will permanently delete all your posts, voice profile, and account data. This cannot be undone.")) { await supabase.rpc("delete_user_data", { p_user_id: user.id }); await supabase.auth.signOut(); router.push("/"); } }} className="text-xs text-red-400 border border-red-400/30 px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
