"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Account() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [voice, setVoice] = useState<any>(null);
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      setUser(user);

      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);

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
              <button className="bg-[#F59E0B] text-[#06080C] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#FBBF24] transition-colors">
                Upgrade to Pro &mdash; {"\u20AC"}79/mo
              </button>
            </div>
          )}
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
