"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// === Types matching actual DB schema ===
interface Profile {
  id: string;
  full_name: string;
  company: string;
  email: string;
  plan: string;
}

interface Draft {
  id: string;
  user_id: string;
  source_topic: string | null;
  draft_text: string;
  revised_text: string | null;
  image_url: string | null;
  image_source: string | null;
  status: string;
  user_feedback: string | null;
  created_at: string;
  updated_at: string;
  // New v3 fields
  variations: string[] | null;
  engagement_score: number | null;
  hook_options: string[] | null;
  generation_metadata: any;
}

// === Toast Component ===
function Toast({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) {
  useEffect(function () {
    var t = setTimeout(onClose, 3000);
    return function () { clearTimeout(t); };
  }, []);

  var bg = type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400"
    : type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400"
    : "bg-amber/10 border-amber/20 text-amber";

  return (
    <div className={"fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border text-sm font-medium animate-pulse " + bg}>
      {message}
    </div>
  );
}

// === LinkedIn Preview Component ===
function LinkedInPreview({ text, name, imageUrl, score }: { text: string; name: string; imageUrl?: string | null; score?: number | null }) {
  var initials = "?";
  if (name) {
    initials = name.split(" ").map(function (n) { return n[0] || ""; }).join("").slice(0, 2);
  }

  var scoreBadge = null;
  if (score && score > 0) {
    var scoreClass = score >= 8 ? "bg-green-500/10 text-green-400" : score >= 6 ? "bg-amber/10 text-amber" : "bg-red-500/10 text-red-400";
    scoreBadge = <div className={"text-xs px-2 py-1 rounded-lg font-medium " + scoreClass}>{score}/10</div>;
  }

  return (
    <div className="bg-[#1B1F23] border border-[#2D2D2D] rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber to-amber/60 flex items-center justify-center text-void text-sm font-bold">{initials}</div>
        <div className="flex-1">
          <div className="text-sm font-medium text-[#E8E8E8]">{name || "Your Name"}</div>
          <div className="text-xs text-[#8B8B8B]">Your headline &bull; 1h &bull; &#127760;</div>
        </div>
        {scoreBadge}
      </div>
      <div className="px-4 pb-4">
        {imageUrl && <img src={imageUrl} alt="Post image" className="w-full rounded-lg mb-3 max-h-48 object-cover" />}
        <div className="text-sm text-[#E8E8E8] leading-relaxed whitespace-pre-wrap">{text}</div>
      </div>
      <div className="border-t border-[#2D2D2D] px-4 py-2 flex items-center text-xs text-[#8B8B8B]">
        <span>&#128077; &#128161; 0</span>
        <span className="ml-auto">{text.length} chars</span>
      </div>
    </div>
  );
}

// === Empty State ===
function EmptyState({ onGenerate, generating, genProgress }: { onGenerate: () => void; generating: boolean; genProgress?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">&#9997;&#65039;</div>
      <h3 className="font-serif text-xl mb-2">Nobody has written yet.</h3>
      <p className="text-shadow text-sm mb-2 max-w-sm">
        Click below and our AI will discover topics, craft posts in your voice, critique them, and polish them.
      </p>
      <p className="text-shadow/50 text-xs mb-6 max-w-sm">Takes about 30-60 seconds. 5-step pipeline per post.</p>
      <button onClick={onGenerate} disabled={generating}
        className="bg-amber text-void px-6 py-3 rounded-lg text-sm font-semibold hover:bg-amber/90 transition-colors disabled:opacity-50">
        {generating ? (genProgress || "Generating...") : "Generate Posts"}
      </button>
    </div>
  );
}

// === Loading Skeleton ===
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2].map(function (n) {
        return (
          <div key={n} className="bg-[#1B1F23] border border-[#2D2D2D] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#2D2D2D]" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-[#2D2D2D] rounded mb-1" />
                <div className="h-3 w-48 bg-[#2D2D2D] rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-[#2D2D2D] rounded" />
              <div className="h-3 w-5/6 bg-[#2D2D2D] rounded" />
              <div className="h-3 w-4/6 bg-[#2D2D2D] rounded" />
              <div className="h-3 w-full bg-[#2D2D2D] rounded" />
              <div className="h-3 w-3/4 bg-[#2D2D2D] rounded" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// MAIN DASHBOARD
// ============================================================
export default function DashboardPage() {
  var router = useRouter();
  var [profile, setProfile] = useState<Profile | null>(null);
  var [drafts, setDrafts] = useState<Draft[]>([]);
  var [loading, setLoading] = useState(true);
  var [generating, setGenerating] = useState(false);
  var [regenerating, setRegenerating] = useState<string | null>(null);
  var [activeTab, setActiveTab] = useState("pending");
  var [editingId, setEditingId] = useState<string | null>(null);
  var [editText, setEditText] = useState("");
  var [showVariation, setShowVariation] = useState<string | null>(null);
  var [copied, setCopied] = useState<string | null>(null);
  var [feedbackId, setFeedbackId] = useState<string | null>(null);
  var [feedbackText, setFeedbackText] = useState("");
  var [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  var [genProgress, setGenProgress] = useState("");

  var showToast = function (message: string, type: "success" | "error" | "info") {
    setToast({ message: message, type: type });
  };

  // === Keyboard shortcuts ===
  useEffect(function () {
    function handleKey(e: KeyboardEvent) {
      // Don't trigger if typing in an input/textarea
      var tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (editingId || feedbackId) return;

      var firstPending = drafts.find(function (d) { return d.status === "generated"; });
      if (!firstPending) return;

      if (e.key === "a" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        updateDraft(firstPending.id, "approved");
      } else if (e.key === "s" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        updateDraft(firstPending.id, "rejected");
      } else if (e.key === "c" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleCopy(firstPending.draft_text, firstPending.id);
      } else if (e.key === "e" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setEditingId(firstPending.id);
        setEditText(firstPending.draft_text);
      }
    }
    window.addEventListener("keydown", handleKey);
    return function () { window.removeEventListener("keydown", handleKey); };
  });

  // === Load user data ===
  useEffect(function () {
    supabase.auth.getUser().then(function (r) {
      if (!r.data.user) { router.push("/"); return; }
      var userId = r.data.user.id;

      supabase.from("profiles").select("*").eq("id", userId).single().then(function (pRes) {
        if (pRes.data) setProfile(pRes.data as Profile);
      });

      supabase.from("drafts").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50).then(function (dRes) {
        if (dRes.data) setDrafts(dRes.data as Draft[]);
        setLoading(false);
      });
    });
  }, []);

  // === Filter drafts ===
  var pendingDrafts = drafts.filter(function (d) { return d.status === "generated"; });
  var processedDrafts = drafts.filter(function (d) { return d.status !== "generated"; });

  // === Stats ===
  var approvedCount = drafts.filter(function (d) { return d.status === "approved"; }).length;
  var avgScore = 0;
  var scoredDrafts = drafts.filter(function (d) { return d.engagement_score && d.engagement_score > 0; });
  if (scoredDrafts.length > 0) {
    var sum = 0;
    for (var si = 0; si < scoredDrafts.length; si++) sum += (scoredDrafts[si].engagement_score || 0);
    avgScore = Math.round((sum / scoredDrafts.length) * 10) / 10;
  }

  // === Generate new drafts ===
  var generateDrafts = async function () {
    if (!profile || generating) return;
    setGenerating(true);
    setGenProgress("Step 1/5: Analyzing your Voice DNA...");

    // Simulate progress steps (API is a single call, we estimate timing)
    var progressSteps = [
      { msg: "Step 1/5: Analyzing your Voice DNA...", delay: 0 },
      { msg: "Step 2/5: Discovering trending topics...", delay: 5000 },
      { msg: "Step 3/5: Generating drafts in your voice...", delay: 12000 },
      { msg: "Step 4/5: AI self-critique in progress...", delay: 25000 },
      { msg: "Step 5/5: Polishing and creating variations...", delay: 38000 },
    ];
    var timers: any[] = [];
    for (var pi = 1; pi < progressSteps.length; pi++) {
      (function (step) {
        timers.push(setTimeout(function () { setGenProgress(step.msg); }, step.delay));
      })(progressSteps[pi]);
    }

    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.id }),
      });
      var data = await res.json();
      if (data.success) {
        showToast(data.drafts_created + " posts generated in " + Math.round((data.duration_ms || 0) / 1000) + "s!", "success");
        var dRes = await supabase.from("drafts").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(50);
        if (dRes.data) setDrafts(dRes.data as Draft[]);
        setActiveTab("pending");
      } else {
        showToast("Error: " + (data.error || "Generation failed"), "error");
      }
    } catch (err: any) {
      showToast("Network error: " + (err?.message || "unknown"), "error");
    }
    // Clear progress timers
    for (var ti = 0; ti < timers.length; ti++) clearTimeout(timers[ti]);
    setGenProgress("");
    setGenerating(false);
  };

  // === Update draft status ===
  var updateDraft = async function (draftId: string, newStatus: string, extra?: any) {
    var updateData: any = { status: newStatus };
    if (extra) {
      if (extra.revised_text) updateData.revised_text = extra.revised_text;
    }
    await supabase.from("drafts").update(updateData).eq("id", draftId);
    setDrafts(drafts.map(function (d) {
      if (d.id === draftId) {
        var updated = Object.assign({}, d, updateData);
        return updated;
      }
      return d;
    }));
    setEditingId(null);
    if (newStatus === "approved") showToast("Post approved! Voice DNA learning...", "success");
    else if (newStatus === "rejected") showToast("Post skipped", "info");
  };

  // === Copy to LinkedIn ===
  var handleCopy = function (text: string, draftId: string) {
    navigator.clipboard.writeText(text);
    setCopied(draftId);
    showToast("Copied! Opening LinkedIn...", "success");
    setTimeout(function () { setCopied(null); }, 2000);
    // Open LinkedIn compose
    window.open("https://www.linkedin.com/feed/?shareActive=true", "_blank");
  };

  // === Regenerate ===
  var handleRegenerate = async function (draftId: string, action: string, customFeedback?: string) {
    if (!profile || regenerating) return;
    setRegenerating(draftId);
    try {
      var body: any = { draftId: draftId, userId: profile.id, action: action };
      if (customFeedback) body.feedback = customFeedback;
      var res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      var data = await res.json();
      if (data.success && data.new_text) {
        setDrafts(drafts.map(function (d) {
          if (d.id === draftId) {
            return Object.assign({}, d, { draft_text: data.new_text });
          }
          return d;
        }));
        showToast("Post refined (" + action + ")", "success");
      } else {
        showToast("Refinement failed: " + (data.error || "unknown"), "error");
      }
    } catch (err: any) {
      showToast("Error: " + (err?.message || "unknown"), "error");
    }
    setRegenerating(null);
    setFeedbackId(null);
    setFeedbackText("");
  };

  // === Generate image ===
  var handleGenerateImage = async function (draftId: string) {
    if (!profile) return;
    showToast("Generating image...", "info");
    try {
      var res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: draftId, userId: profile.id }),
      });
      var data = await res.json();
      if (data.success && data.imageUrl) {
        setDrafts(drafts.map(function (d) {
          if (d.id === draftId) return Object.assign({}, d, { image_url: data.imageUrl });
          return d;
        }));
        showToast("Image generated!", "success");
      }
    } catch (err) {
      showToast("Image generation failed", "error");
    }
  };

  // === Upload image ===
  var handleUploadImage = async function (draftId: string, file: File) {
    if (!profile) return;
    showToast("Uploading...", "info");
    try {
      var formData = new FormData();
      formData.append("file", file);
      formData.append("draftId", draftId);
      formData.append("userId", profile.id);
      var res = await fetch("/api/upload-image", { method: "POST", body: formData });
      var data = await res.json();
      if (data.success && data.imageUrl) {
        setDrafts(drafts.map(function (d) {
          if (d.id === draftId) return Object.assign({}, d, { image_url: data.imageUrl });
          return d;
        }));
        showToast("Image uploaded!", "success");
      }
    } catch (err) {
      showToast("Upload failed", "error");
    }
  };

  // === RENDER ===
  if (loading) {
    return (
      <div className="min-h-screen bg-void text-whisper">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="font-serif text-lg"><span className="text-shadow">nobod</span><span className="text-amber italic">.ai</span></div>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void text-whisper">
      {toast && <Toast message={toast.message} type={toast.type} onClose={function () { setToast(null); }} />}

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-serif text-lg"><span className="text-shadow">nobod</span><span className="text-amber italic">.ai</span></div>
            <div className="text-xs text-shadow mt-0.5">Welcome, {profile?.full_name || "there"}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={generateDrafts} disabled={generating}
              className="bg-amber text-void px-4 py-2 rounded-lg text-xs font-semibold hover:bg-amber/90 transition-colors disabled:opacity-50">
              {generating ? genProgress || "Generating..." : "+ Generate"}
            </button>
            <a href="/account" className="bg-card border border-border px-3 py-2 rounded-lg text-xs text-shadow hover:text-whisper transition-colors">Account</a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: "Total", value: String(drafts.length), color: "text-whisper" },
            { label: "Pending", value: String(pendingDrafts.length), color: "text-amber" },
            { label: "Approved", value: String(approvedCount), color: "text-green-400" },
            { label: "Avg Score", value: avgScore > 0 ? String(avgScore) : "-", color: "text-blue-400" },
          ].map(function (s) {
            return (
              <div key={s.label} className="bg-midnight border border-border rounded-xl px-3 py-3 text-center">
                <div className={"text-lg font-serif " + s.color}>{s.value}</div>
                <div className="text-xs text-shadow">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-midnight rounded-lg p-1 border border-border">
          <button onClick={function () { setActiveTab("pending"); }}
            className={"flex-1 py-2 rounded-md text-xs font-medium transition-colors " + (activeTab === "pending" ? "bg-card text-amber" : "text-shadow hover:text-whisper")}>
            Pending ({pendingDrafts.length})
          </button>
          <button onClick={function () { setActiveTab("history"); }}
            className={"flex-1 py-2 rounded-md text-xs font-medium transition-colors " + (activeTab === "history" ? "bg-card text-whisper" : "text-shadow hover:text-whisper")}>
            History ({processedDrafts.length})
          </button>
        </div>

        {/* PENDING TAB */}
        {activeTab === "pending" && (
          <div>
            {pendingDrafts.length === 0 ? (
              <EmptyState onGenerate={generateDrafts} generating={generating} genProgress={genProgress} />
            ) : (
              <div className="space-y-8">
                {/* Keyboard shortcut hint */}
                <div className="text-center text-xs text-shadow/30">
                  Keyboard: <kbd className="px-1.5 py-0.5 bg-midnight border border-border rounded text-shadow/50">A</kbd> approve &bull; <kbd className="px-1.5 py-0.5 bg-midnight border border-border rounded text-shadow/50">S</kbd> skip &bull; <kbd className="px-1.5 py-0.5 bg-midnight border border-border rounded text-shadow/50">C</kbd> copy &bull; <kbd className="px-1.5 py-0.5 bg-midnight border border-border rounded text-shadow/50">E</kbd> edit
                </div>
                {pendingDrafts.map(function (draft) {
                  var isRegenerating = regenerating === draft.id;
                  var variations = draft.variations || [];
                  var showingVariation = showVariation === draft.id && variations.length > 0;

                  return (
                    <div key={draft.id} className={isRegenerating ? "opacity-60 pointer-events-none" : ""}>
                      {/* Topic + Meta */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-shadow flex items-center gap-1.5">
                          {draft.source_topic && <span className="truncate max-w-[250px]">{draft.source_topic}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {variations.length > 0 && (
                            <button onClick={function () { setShowVariation(showingVariation ? null : draft.id); }}
                              className="text-xs text-amber/60 hover:text-amber transition-colors">
                              {showingVariation ? "← Original" : "Variation →"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Editor mode */}
                      {editingId === draft.id ? (
                        <div className="bg-card border border-border rounded-xl p-4">
                          <textarea value={editText} onChange={function (e) { setEditText(e.target.value); }} rows={12}
                            className="w-full resize-none text-sm leading-relaxed bg-midnight border border-border rounded-lg p-3 text-whisper focus:border-amber/40 focus:outline-none" />
                          <div className="flex items-center gap-2 mt-3">
                            <button onClick={function () { updateDraft(draft.id, "approved", { revised_text: editText }); }}
                              className="bg-amber text-void px-4 py-2 rounded-lg text-xs font-semibold">Save & Approve</button>
                            <button onClick={function () { setEditingId(null); }} className="text-xs text-shadow hover:text-whisper px-3">Cancel</button>
                            <span className={"ml-auto text-xs " + (editText.length > 1300 ? "text-red-400" : editText.length > 1000 ? "text-amber" : "text-shadow/50")}>
                              {editText.length} / 1300
                            </span>
                          </div>
                        </div>
                      ) : (
                        <LinkedInPreview
                          text={showingVariation ? (typeof variations[0] === "string" ? variations[0] : String(variations[0])) : draft.draft_text}
                          name={profile?.full_name || ""}
                          imageUrl={draft.image_url}
                          score={draft.engagement_score}
                        />
                      )}

                      {/* Action buttons */}
                      {editingId !== draft.id && (
                        <div className="mt-3 space-y-2">
                          {/* Primary actions */}
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={function () { handleCopy(draft.draft_text, draft.id); }}
                              className="bg-[#0A66C2] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#004182] transition-colors">
                              {copied === draft.id ? "✓ Copied!" : "📋 Copy to LinkedIn"}
                            </button>
                            <button onClick={function () { updateDraft(draft.id, "approved"); }}
                              className="bg-amber text-void px-4 py-2 rounded-lg text-xs font-semibold hover:bg-amber/90 transition-colors">
                              ✅ Approve
                            </button>
                            <button onClick={function () { setEditingId(draft.id); setEditText(draft.draft_text); }}
                              className="bg-card border border-border px-3 py-2 rounded-lg text-xs text-shadow hover:border-amber/30 transition-colors">
                              ✏️ Edit
                            </button>
                            <button onClick={function () { updateDraft(draft.id, "rejected"); }}
                              className="bg-card border border-border px-3 py-2 rounded-lg text-xs text-shadow hover:border-red-500/30 transition-colors">
                              ❌ Skip
                            </button>
                          </div>

                          {/* Image actions */}
                          <div className="flex gap-1.5 flex-wrap">
                            <span className="text-xs text-shadow/40 py-1.5">Image:</span>
                            <button onClick={function () { handleGenerateImage(draft.id); }}
                              className="bg-midnight border border-border/50 px-2.5 py-1.5 rounded-md text-xs text-shadow hover:border-amber/20 hover:text-whisper transition-colors">
                              🎨 Generate Card
                            </button>
                            <label className="bg-midnight border border-border/50 px-2.5 py-1.5 rounded-md text-xs text-shadow hover:border-amber/20 hover:text-whisper transition-colors cursor-pointer">
                              📷 Upload
                              <input type="file" accept="image/*" className="hidden"
                                onChange={function (e) { var f = e.target.files?.[0]; if (f) handleUploadImage(draft.id, f); }} />
                            </label>
                          </div>

                          {/* Refinement actions */}
                          <div className="flex gap-1.5 flex-wrap">
                            <span className="text-xs text-shadow/40 py-1.5">Refine:</span>
                            {[
                              { action: "more_provocative", label: "🔥 Bolder" },
                              { action: "more_personal", label: "💬 Personal" },
                              { action: "shorter", label: "✂️ Shorter" },
                              { action: "variation", label: "🔀 New angle" },
                              { action: "swap_hook", label: "🎣 New hook" },
                            ].map(function (btn) {
                              return (
                                <button key={btn.action}
                                  onClick={function () { handleRegenerate(draft.id, btn.action); }}
                                  disabled={isRegenerating}
                                  className="bg-midnight border border-border/50 px-2.5 py-1.5 rounded-md text-xs text-shadow hover:border-amber/20 hover:text-whisper transition-colors disabled:opacity-50">
                                  {btn.label}
                                </button>
                              );
                            })}
                            <button onClick={function () { setFeedbackId(feedbackId === draft.id ? null : draft.id); }}
                              className="bg-midnight border border-border/50 px-2.5 py-1.5 rounded-md text-xs text-shadow hover:border-amber/20 hover:text-whisper transition-colors">
                              💬 Custom...
                            </button>
                          </div>

                          {/* Custom feedback input */}
                          {feedbackId === draft.id && (
                            <div className="flex gap-2 mt-1">
                              <input type="text" placeholder="e.g. 'More numbers', 'Add a question at the end'" value={feedbackText}
                                onChange={function (e) { setFeedbackText(e.target.value); }}
                                onKeyDown={function (e) { if (e.key === "Enter" && feedbackText.trim()) handleRegenerate(draft.id, "custom", feedbackText); }}
                                className="flex-1 px-3 py-2 rounded-lg text-xs bg-midnight border border-border text-whisper focus:border-amber/40 focus:outline-none" />
                              <button onClick={function () { if (feedbackText.trim()) handleRegenerate(draft.id, "custom", feedbackText); }}
                                className="bg-amber text-void px-3 py-2 rounded-lg text-xs font-semibold">Send</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div>
            {processedDrafts.length === 0 ? (
              <div className="text-center py-16 text-shadow">
                <div className="text-3xl mb-2">&#128218;</div>
                <p className="text-sm">No history yet. Approve or skip some posts first.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {processedDrafts.map(function (draft) {
                  return (
                    <div key={draft.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-shadow">
                          {draft.source_topic && <span className="truncate max-w-[200px]">{draft.source_topic}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {draft.engagement_score && <span className="text-xs text-amber">{draft.engagement_score}/10</span>}
                          <span className={"text-xs px-2 py-0.5 rounded " + (draft.status === "approved" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                            {draft.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-[#999] leading-relaxed whitespace-pre-wrap line-clamp-4">
                        {draft.revised_text || draft.draft_text}
                      </div>
                      {draft.status === "approved" && (
                        <button onClick={function () { handleCopy(draft.revised_text || draft.draft_text, draft.id); }}
                          className="mt-2 text-xs text-amber/60 hover:text-amber transition-colors">
                          {copied === draft.id ? "✓ Copied" : "Copy again"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
