"use client";

import { useState, useEffect } from "react";
import { supabase, type Draft, type Profile } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [feedback, setFeedback] = useState("");

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
      .limit(20);

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
    await supabase
      .from("drafts")
      .update({ status, ...extra })
      .eq("id", id);
    await loadData();
    setEditingId(null);
    setEditText("");
    setFeedback("");
  };

  const handleApprove = (id: string) => updateDraft(id, "approved");
  const handleReject = (id: string) => updateDraft(id, "rejected");

  const handleEdit = (draft: Draft) => {
    setEditingId(draft.id);
    setEditText(draft.draft_text);
  };

  const handleSaveEdit = (id: string) => {
    updateDraft(id, "edited", { revised_text: editText });
  };

  const handleRequestRevision = async (id: string) => {
    if (!feedback.trim()) return;
    updateDraft(id, "rejected", { user_feedback: feedback });
    // In production: this triggers re-generation via API
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const pendingDrafts = drafts.filter(
    (d) => d.status === "generated" || d.status === "sent"
  );
  const processedDrafts = drafts.filter(
    (d) => d.status !== "generated" && d.status !== "sent"
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-shadow text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="text-xl tracking-tight">
            <span className="font-serif text-whisper">nobod</span>
            <span className="font-serif text-amber italic">.ai</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-shadow">
              {profile?.full_name || profile?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-xs text-shadow hover:text-whisper transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl mb-1">
            Guten Morgen{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.
          </h1>
          <p className="text-shadow text-sm">
            {pendingDrafts.length > 0
              ? `${pendingDrafts.length} ${pendingDrafts.length === 1 ? "Post wartet" : "Posts warten"} auf deine Freigabe.`
              : "Keine neuen Drafts. Generiere welche."}
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateDrafts}
          disabled={generating}
          className="mb-8 bg-card border border-border hover:border-amber/30 rounded-xl px-5 py-3 text-sm transition-all disabled:opacity-50 w-full text-left"
        >
          {generating ? (
            <span className="text-amber">⏳ Nobody is writing...</span>
          ) : (
            <span>
              <span className="text-amber">+</span>{" "}
              <span className="text-shadow">Neue Posts generieren</span>
            </span>
          )}
        </button>

        {/* Pending Drafts */}
        {pendingDrafts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs text-amber font-medium tracking-widest uppercase mb-4">
              Zur Freigabe
            </h2>
            <div className="space-y-4">
              {pendingDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  {/* Topic source */}
                  {draft.source_topic && (
                    <div className="px-5 pt-4 pb-0">
                      <div className="text-xs text-shadow">
                        📰 {draft.source_topic}
                      </div>
                    </div>
                  )}

                  {/* Post preview */}
                  <div className="px-5 py-4">
                    {editingId === draft.id ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={8}
                        className="w-full resize-none text-sm leading-relaxed"
                      />
                    ) : (
                      <div className="text-sm text-whisper leading-relaxed whitespace-pre-wrap">
                        {draft.draft_text}
                      </div>
                    )}
                  </div>

                  {/* LinkedIn Preview Badge */}
                  <div className="px-5 pb-2">
                    <div className="text-xs text-shadow/50 italic">
                      Preview: so sieht es auf LinkedIn aus
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-border px-5 py-3 flex gap-2 flex-wrap">
                    {editingId === draft.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(draft.id)}
                          className="bg-amber text-void px-4 py-1.5 rounded-lg text-xs font-semibold"
                        >
                          ✓ Speichern & Freigeben
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-shadow hover:text-whisper"
                        >
                          Abbrechen
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(draft.id)}
                          className="bg-amber text-void px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-amber/90 transition-colors"
                        >
                          ✅ Freigeben
                        </button>
                        <button
                          onClick={() => handleEdit(draft)}
                          className="bg-card border border-border px-4 py-1.5 rounded-lg text-xs text-shadow hover:border-amber/30 transition-colors"
                        >
                          ✏️ Bearbeiten
                        </button>
                        <button
                          onClick={() => handleReject(draft.id)}
                          className="bg-card border border-border px-4 py-1.5 rounded-lg text-xs text-shadow hover:border-red-500/30 transition-colors"
                        >
                          ❌ Ablehnen
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {processedDrafts.length > 0 && (
          <div>
            <h2 className="text-xs text-shadow font-medium tracking-widest uppercase mb-4">
              Verlauf
            </h2>
            <div className="space-y-2">
              {processedDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-midnight border border-border/50 rounded-lg px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-whisper truncate">
                      {(draft.revised_text || draft.draft_text).slice(0, 80)}...
                    </div>
                    <div className="text-xs text-shadow/50 mt-0.5">
                      {new Date(draft.created_at).toLocaleDateString("de-DE")}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ml-3 whitespace-nowrap ${
                      draft.status === "approved" || draft.status === "published"
                        ? "bg-green-500/10 text-green-400"
                        : draft.status === "rejected"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-amber/10 text-amber"
                    }`}
                  >
                    {draft.status === "approved"
                      ? "✅ Freigegeben"
                      : draft.status === "published"
                      ? "🚀 Published"
                      : draft.status === "rejected"
                      ? "❌ Abgelehnt"
                      : draft.status === "edited"
                      ? "✏️ Bearbeitet"
                      : draft.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
