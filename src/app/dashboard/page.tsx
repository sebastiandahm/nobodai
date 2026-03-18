"use client";

import { useState, useEffect } from "react";
import { supabase, type Draft, type Profile } from "@/lib/supabase";
import { useRouter } from "next/navigation";

function LinkedInPreview({ text, name, imageUrl }: { text: string; name: string; imageUrl?: string | null }) {
  return (
    <div className="bg-[#1B1F23] border border-[#2D2D2D] rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber to-amber/60 flex items-center justify-center text-void text-sm font-bold">
          {name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
        </div>
        <div>
          <div className="text-sm font-medium text-[#E8E8E8]">{name || "Your Name"}</div>
          <div className="text-xs text-[#8B8B8B]">Your headline &bull; 1h &bull; &#127760;</div>
        </div>
      </div>
      <div className="px-4 pb-4">
        {imageUrl && (
          <img src={imageUrl} alt="Post image" className="w-full rounded-lg mb-3 max-h-48 object-cover" />
        )}
        <div className="text-sm text-[#E8E8E8] leading-relaxed whitespace-pre-wrap">{text}</div>
      </div>
      <div className="border-t border-[#2D2D2D] px-4 py-2 flex items-center gap-1">
        <span className="text-xs">&#128077;</span>
        <span className="text-xs">&#128161;</span>
        <span className="text-xs text-[#8B8B8B] ml-1">0</span>
        <span className="text-xs text-[#8B8B8B] ml-auto">0 comments &bull; 0 reposts</span>
      </div>
    </div>
  );
}

function EmptyState({ onGenerate, generating }: { onGenerate: () => void; generating: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">&#9997;&#65039;</div>
      <h3 className="font-serif text-xl mb-2">Nobody has written yet.</h3>
      <p className="text-shadow text-sm mb-6 max-w-sm">
        Click the button below and nobody will generate 2 LinkedIn posts
        tailored to your voice and expertise. Takes about 15 seconds.
      </p>
      <button
        onClick={onGenerate}
        disabled={generating}
        className="bg-amber text-void px-6 py-3 rounded-lg text-sm font-semibold hover:bg-amber/90 transition-colors disabled:opacity-50"
      >
        {generating ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
            Nobody is writing...
          </span>
        ) : (
          "Generate my first posts \u2192"
        )}
      </button>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData && !profileData.onboarding_completed) {
      router.push("/onboarding");
      return;
    }

    setProfile(profileData);

    const { data: draftsData } = await supabase
      .from("drafts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setDrafts(draftsData || []);
    setLoading(false);
  };

  const generateDrafts = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile?.id }),
      });
      if (res.ok) await loadData();
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  const updateDraft = async (id: string, status: string, extra?: Record<string, unknown>) => {
    await supabase.from("drafts").update({ status, ...extra }).eq("id", id);
    await loadData();
    setEditingId(null);
    setEditText("");
  };

  const handleGenerateCard = async (draftId: string) => {
    var res = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftId: draftId, userId: profile?.id, action: "generate-card" }),
    });
    var data = await res.json();
    if (data.url) {
      await loadData();
    } else {
      alert(data.error || "Image generation failed");
    }
  };

  const handleUploadImage = async (draftId: string, file: File) => {
    var fd = new FormData();
    fd.append("file", file);
    fd.append("userId", profile?.id || "");
    fd.append("draftId", draftId);
    var res = await fetch("/api/upload-image", { method: "POST", body: fd });
    var data = await res.json();
    if (data.url) {
      await loadData();
    } else {
      alert(data.error || "Upload failed");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const pendingDrafts = drafts.filter((d) => d.status === "generated" || d.status === "sent");
  const processedDrafts = drafts.filter((d) => d.status !== "generated" && d.status !== "sent");

  const greeting = () => {
    var h = new Date().getHours();
    if (h < 12) return "Guten Morgen";
    if (h < 17) return "Guten Nachmittag";
    return "Guten Abend";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
          <div className="text-shadow text-sm">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      <header className="border-b border-border sticky top-0 bg-void/80 backdrop-blur-md z-10">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="text-xl tracking-tight">
              <span className="font-serif text-whisper">nobod</span>
              <span className="font-serif text-amber italic">.ai</span>
            </div>
          </a>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber/10 flex items-center justify-center text-amber text-xs font-bold">
                {profile?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
              </div>
              <span className="text-xs text-shadow">{profile?.full_name || profile?.email}</span>
            </div>
            <a href="/" style={{ fontSize: 12, color: "#9CA3AF", textDecoration: "none" }}>Home</a>
            <a href="/account" style={{ fontSize: 12, color: "#9CA3AF", textDecoration: "none" }}>Account</a>
            <button onClick={handleSignOut} className="text-xs text-shadow/60 hover:text-shadow transition-colors">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl mb-1">
              {greeting()}{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.
            </h1>
            <p className="text-shadow text-sm">
              {pendingDrafts.length > 0
                ? `${pendingDrafts.length} ${pendingDrafts.length === 1 ? "post is" : "posts are"} waiting for your approval.`
                : "No pending posts. Generate some fresh content."}
            </p>
          </div>
          <button onClick={generateDrafts} disabled={generating}
            className="bg-amber text-void px-4 py-2 rounded-lg text-xs font-semibold hover:bg-amber/90 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
            {generating ? (
              <><span className="w-3 h-3 border-2 border-void/30 border-t-void rounded-full animate-spin" />Writing...</>
            ) : (
              <>+ New posts</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Generated", value: drafts.length, color: "text-whisper" },
            { label: "Approved", value: drafts.filter((d) => d.status === "approved" || d.status === "published").length, color: "text-green-400" },
            { label: "Pending", value: pendingDrafts.length, color: "text-amber" },
          ].map((stat) => (
            <div key={stat.label} className="bg-midnight border border-border rounded-xl px-4 py-3 text-center">
              <div className={`text-xl font-serif ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-shadow">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 bg-midnight rounded-lg p-1 border border-border">
          <button onClick={() => setActiveTab("pending")}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${activeTab === "pending" ? "bg-card text-amber" : "text-shadow hover:text-whisper"}`}>
            Pending ({pendingDrafts.length})
          </button>
          <button onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${activeTab === "history" ? "bg-card text-whisper" : "text-shadow hover:text-whisper"}`}>
            History ({processedDrafts.length})
          </button>
        </div>

        {activeTab === "pending" && (
          <>
            {pendingDrafts.length === 0 ? (
              <EmptyState onGenerate={generateDrafts} generating={generating} />
            ) : (
              <div className="space-y-6">
                {pendingDrafts.map((draft) => (
                  <div key={draft.id}>
                    {draft.source_topic && (
                      <div className="text-xs text-shadow mb-2 flex items-center gap-1.5">
                        <span className="text-amber">&#128240;</span>
                        {draft.source_topic}
                      </div>
                    )}

                    {editingId === draft.id ? (
                      <div className="bg-card border border-border rounded-xl p-4">
                        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={12}
                          className="w-full resize-none text-sm leading-relaxed bg-midnight border border-border rounded-lg p-3 text-whisper focus:border-amber/40 focus:outline-none" />
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => updateDraft(draft.id, "approved", { revised_text: editText })}
                            className="bg-amber text-void px-4 py-2 rounded-lg text-xs font-semibold">Save &amp; Approve</button>
                          <button onClick={() => setEditingId(null)}
                            className="text-xs text-shadow hover:text-whisper px-3">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <LinkedInPreview text={draft.draft_text} name={profile?.full_name || ""} imageUrl={draft.image_url} />
                    )}

                    {editingId !== draft.id && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <button onClick={() => updateDraft(draft.id, "approved")}
                          className="bg-amber text-void px-4 py-2 rounded-lg text-xs font-semibold hover:bg-amber/90 transition-colors flex items-center gap-1.5">
                          &#9989; Approve
                        </button>
                        <button onClick={() => { setEditingId(draft.id); setEditText(draft.draft_text); }}
                          className="bg-card border border-border px-4 py-2 rounded-lg text-xs text-shadow hover:border-amber/30 transition-colors flex items-center gap-1.5">
                          &#9998;&#65039; Edit
                        </button>
                        <button onClick={() => updateDraft(draft.id, "rejected")}
                          className="bg-card border border-border px-4 py-2 rounded-lg text-xs text-shadow hover:border-red-500/30 transition-colors flex items-center gap-1.5">
                          &#10060; Skip
                        </button>
                        <button onClick={() => handleGenerateCard(draft.id)}
                          className="bg-card border border-border px-4 py-1.5 rounded-lg text-xs text-shadow hover:border-amber/30 transition-colors">
                          &#128444;&#65039; Generate Card
                        </button>
                        <label className="bg-card border border-border px-4 py-1.5 rounded-lg text-xs text-shadow hover:border-amber/30 transition-colors cursor-pointer">
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { var f = e.target.files?.[0]; if (f) handleUploadImage(draft.id, f); }} />
                          &#128206; Upload Image
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "history" && (
          <div className="space-y-2">
            {processedDrafts.length === 0 ? (
              <div className="text-center py-12 text-shadow text-sm">No history yet. Approve or reject some posts first.</div>
            ) : (
              processedDrafts.map((draft) => (
                <div key={draft.id} className="bg-midnight border border-border/50 rounded-xl px-4 py-3 flex items-center justify-between hover:border-border transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-whisper truncate">
                      {(draft.revised_text || draft.draft_text).slice(0, 80)}...
                    </div>
                    <div className="text-xs text-shadow/50 mt-0.5 flex items-center gap-2">
                      {draft.source_topic && <span>{draft.source_topic}</span>}
                      <span>&bull;</span>
                      <span>{new Date(draft.created_at).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg ml-3 whitespace-nowrap font-medium ${
                    draft.status === "approved" || draft.status === "published"
                      ? "bg-green-500/10 text-green-400"
                      : draft.status === "rejected"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-amber/10 text-amber"
                  }`}>
                    {draft.status === "approved" ? "Approved" : draft.status === "published" ? "Published" : draft.status === "rejected" ? "Skipped" : "Edited"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
