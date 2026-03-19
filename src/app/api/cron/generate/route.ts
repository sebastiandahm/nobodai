import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
 
export const dynamic = "force-dynamic";
export const maxDuration = 300;
 
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}
 
async function claude(system: string, user: string, maxTokens?: number): Promise<string> {
  var attempts = 0;
  var maxAttempts = 2;
  var lastError: any = null;
 
  while (attempts < maxAttempts) {
    attempts++;
    try {
      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: maxTokens || 2000,
          system: system,
          messages: [{ role: "user", content: user }],
        }),
      });
 
      if (res.status === 529 || res.status === 503 || res.status === 429) {
        // Overloaded / rate limited — wait and retry
        lastError = new Error("Claude API " + res.status + " (attempt " + attempts + ")");
        if (attempts < maxAttempts) {
          await new Promise(function (resolve) { setTimeout(resolve, 3000); });
          continue;
        }
        throw lastError;
      }
 
      if (!res.ok) {
        var errText = await res.text();
        throw new Error("Claude error " + res.status + ": " + errText.substring(0, 200));
      }
 
      var data = await res.json();
      var text = "";
      if (data.content && data.content.length > 0 && data.content[0].type === "text") {
        text = data.content[0].text;
      }
      if (!text || text.trim().length < 10) {
        throw new Error("Claude returned empty response");
      }
      return text.trim();
    } catch (e: any) {
      lastError = e;
      if (attempts < maxAttempts && (e?.message?.includes("529") || e?.message?.includes("503") || e?.message?.includes("ETIMEDOUT"))) {
        await new Promise(function (resolve) { setTimeout(resolve, 3000); });
        continue;
      }
      throw e;
    }
  }
  throw lastError || new Error("Claude call failed after " + maxAttempts + " attempts");
}
 
// ============================================================
// Shared pipeline functions (same quality as /api/generate)
// ============================================================
 
function buildVoiceDNA(voice: any, profile: any, approvedPosts: any[]): string {
  var expertise = "General Business";
  if (voice.expertise_topics && Array.isArray(voice.expertise_topics) && voice.expertise_topics.length > 0) {
    expertise = voice.expertise_topics.join(", ");
  }
 
  var f = voice.tone_formality || 0.5;
  var h = voice.tone_humor || 0.3;
  var p = voice.tone_provocation || 0.5;
 
  var toneProfile = "";
  if (f >= 0.7) toneProfile = "Serioes und kompetent. Fachsprache wenn passend.";
  else if (f >= 0.4) toneProfile = "Professionell aber menschlich. Wie ein kluger Kollege.";
  else toneProfile = "Locker, direkt. Kurze Saetze. Umgangssprache OK.";
 
  if (h >= 0.6) toneProfile += " Humor als Stilmittel.";
  if (p >= 0.6) toneProfile += " Polarisierende Meinungen willkommen.";
 
  var goals = "";
  if (voice.goals && Array.isArray(voice.goals)) {
    var goalTexts: string[] = [];
    for (var i = 0; i < voice.goals.length; i++) {
      var g = voice.goals[i];
      if (g === "thought_leadership") goalTexts.push("Thought Leadership");
      else if (g === "lead_generation") goalTexts.push("Lead Generation");
      else if (g === "personal_brand") goalTexts.push("Personal Branding");
    }
    if (goalTexts.length > 0) goals = "\nZiele: " + goalTexts.join(", ");
  }
 
  // Approved posts as few-shot examples
  var learningSection = "";
  if (approvedPosts.length > 0) {
    learningSection = "\n\n=== FREIGEGEBENE POSTS (Stil imitieren!) ===\n";
    for (var j = 0; j < Math.min(approvedPosts.length, 5); j++) {
      var postText = approvedPosts[j].revised_text || approvedPosts[j].draft_text;
      if (postText) {
        learningSection += "--- POST " + (j + 1) + " ---\n" + postText.substring(0, 800) + "\n---\n\n";
      }
    }
  }
 
  var exampleSection = "";
  if (voice.example_posts && Array.isArray(voice.example_posts) && voice.example_posts.length > 0) {
    exampleSection = "\n\n=== BEISPIEL-POSTS (Gold-Standard) ===\n";
    for (var k = 0; k < Math.min(voice.example_posts.length, 3); k++) {
      exampleSection += "--- BEISPIEL " + (k + 1) + " ---\n" + voice.example_posts[k] + "\n---\n\n";
    }
  }
 
  var dnaSection = "";
  if (voice.voice_dna) {
    dnaSection = "\n\n=== VOICE DNA ===\n" + voice.voice_dna + "\n";
  }
 
  var lang = voice.language === "en" ? "English" : "Deutsch";
 
  return "Du BIST " + (profile?.full_name || "der Nutzer") + (profile?.company ? " bei " + profile.company : "") + "." +
    " Schreibe LinkedIn-Posts in der Ich-Perspektive. Jeder Post MUSS klingen als haettest du ihn selbst geschrieben." +
    "\n\nExpertise: " + expertise +
    "\nSprache: " + lang +
    "\nTon: " + toneProfile +
    goals +
    (voice.custom_instructions ? "\nSpezial: " + voice.custom_instructions : "") +
    exampleSection +
    learningSection +
    dnaSection +
    "\n\n=== AKTUELLES DATUM ===" +
    "\nHeute ist " + new Date().toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + "." +
    "\nNutze fuer zeitliche Referenzen: 'diese Woche', 'gerade erst', 'seit Anfang des Jahres'." +
    "\n\n=== LINKEDIN 2026 REGELN ===" +
    "\n- Dwell Time maximieren: variierte Satzlaengen, Hooks die zum Weiterlesen zwingen" +
    "\n- 800-1300 Zeichen optimal" +
    "\n- Keine AI-Floskeln: 'In der heutigen Zeit', 'Lassen Sie mich', 'Game-Changer'" +
    "\n- Mindestens ein konkretes Detail (Zahl, Name, Ort, Situation)" +
    "\n- Satzlaengen BEWUSST variieren (kurz. Dann laenger. Dann Fragment.)" +
    "\n- Ende: Statement oder spezifische Frage (NICHT 'Was denkt ihr?')" +
    "\n- 3-4 Hashtags am Ende nach Leerzeile";
}
 
var FORMATS = [
  "STORY-HOOK: Konkreter Moment als Einstieg. Geschichte. Erkenntnis. Takeaway.",
  "KONTRAERE THESE: Mainstream widersprechen. 2-3 Argumente. Alternative anbieten.",
  "ZAHLEN-HOOK: Ueberraschende Zahl im ersten Satz. Analyse. Handlungsanweisung.",
  "BEICHTE: Ehrliches Eingestaendnis. Verletzlichkeit. Was du gelernt hast.",
  "BEOBACHTUNG: Muster/Trend den niemand anspricht. Warum wichtig. Frage an Leser.",
  "FRAMEWORK: 3 konkrete Schritte die du anwendest. Ergebnis. Sofort umsetzbar."
];
 
async function discoverTopics(expertise: string[], recentTopics: string[], lang: string): Promise<string[]> {
  var avoidStr = recentTopics.length > 0 ? "\n\nVERMEIDE diese Themen:\n- " + recentTopics.join("\n- ") : "";
  var currentMonth = new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  var result = await claude(
    "Du bist ein LinkedIn Content-Stratege. NUR Thementitel generieren. Wir sind in " + currentMonth + ".",
    "6 SPEZIFISCHE LinkedIn-Post-Themen fuer Experte in: " + expertise.join(", ") +
    "\nJedes Thema muss: spezifisch sein, eine Meinung provozieren, eine Geschichte ermoeglichen." +
    "\nDie Themen sollen AKTUELL sein (" + currentMonth + " - Quartalsthemen, saisonale Aspekte, aktuelle Entwicklungen)." +
    avoidStr +
    "\n6 Themen, eins pro Zeile. NUR Titel. " + (lang === "en" ? "English." : "Deutsch."),
    500
  );
  var lines = result.split("\n").filter(function (l) { return l.trim().length > 10; });
  var cleaned: string[] = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim().replace(/^\d+[\.\)]\s*/, "").replace(/^[-*]\s*/, "").replace(/^["']|["']$/g, "").trim();
    if (line.length > 10 && cleaned.length < 6) cleaned.push(line);
  }
  if (cleaned.length < 2) cleaned = ["Praxiserfahrungen aus der digitalen Transformation", "Was erfolgreiche Teams anders machen"];
  return cleaned;
}
 
async function critiqueAndPolish(draft: string, authorName: string, expertise: string): Promise<{ polished: string; hooks: string[]; score: number }> {
  var result = "";
  try {
    result = await claude(
      "Du bist ein brutal-ehrlicher LinkedIn Content Editor.",
      "LinkedIn-Post von " + authorName + " (" + expertise + "):\n\n---START---\n" + draft + "\n---ENDE---\n\n" +
      "Format:\nSCORE: [1-10]\nPOLISHED_POST_START\n[Verbesserter Post]\nPOLISHED_POST_END\nHOOK_ALT_1_START\n[Provokanterer Hook]\nHOOK_ALT_1_END",
      2000
    );
  } catch (e) {
    return { polished: draft, hooks: [], score: 7 };
  }
 
  var score = 7;
  var sm = result.match(/SCORE:\s*(\d+)/);
  if (sm) score = Math.min(10, Math.max(1, parseInt(sm[1])));
 
  var polished = draft;
  var pm = result.match(/POLISHED_POST_START\n([\s\S]*?)\nPOLISHED_POST_END/);
  if (pm && pm[1].trim().length > 50) polished = pm[1].trim();
  else {
    var fb = result.match(/POLISHED_POST:\n([\s\S]*?)(?=\nHOOK|$)/);
    if (fb && fb[1].trim().length > 50) polished = fb[1].trim();
  }
 
  var hooks: string[] = [];
  var hm = result.match(/HOOK_ALT_1_START\n([\s\S]*?)\nHOOK_ALT_1_END/);
  if (hm && hm[1].trim().length > 10) hooks.push(hm[1].trim());
 
  return { polished: polished, hooks: hooks, score: score };
}
 
// ============================================================
// MAIN CRON HANDLER
// ============================================================
export async function GET(request: NextRequest) {
  // Auth check
  var authHeader = request.headers.get("authorization");
  var cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== "Bearer " + cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
 
  var supabase = getSupabase();
  var results: any[] = [];
  var errors: string[] = [];
 
  try {
    // Get all users with voice profiles (via RPC to bypass RLS)
    var usersRes = await supabase.rpc("get_all_voice_user_ids");
    if (usersRes.error || !usersRes.data) {
      return NextResponse.json({ error: "Failed to load users", detail: usersRes.error?.message }, { status: 500 });
    }
 
    var users = usersRes.data;
 
    for (var u = 0; u < users.length; u++) {
      var userId = users[u].user_id;
      var userStart = Date.now();
 
      try {
        // === Load voice profile ===
        var voice: any = null;
        var fullVpRes = await supabase.rpc("get_full_voice_profile", { p_user_id: userId });
        if (!fullVpRes.error && fullVpRes.data && fullVpRes.data.length > 0) {
          voice = fullVpRes.data[0];
        } else {
          var basicVpRes = await supabase.rpc("get_voice_profile", { p_user_id: userId });
          if (basicVpRes.data && basicVpRes.data.length > 0) voice = basicVpRes.data[0];
        }
        if (!voice) { errors.push("User " + userId.substring(0, 8) + ": no voice profile"); continue; }
 
        // === Load profile via RPC ===
        var profile: any = { full_name: "", company: "" };
        var profileRes = await supabase.rpc("get_profile_by_id", { p_user_id: userId });
        if (profileRes.data && profileRes.data.length > 0) profile = profileRes.data[0];
 
        // === Load approved posts ===
        var approvedPosts: any[] = [];
        var approvedRes = await supabase.rpc("get_approved_posts", { p_user_id: userId, p_limit: 10 });
        if (approvedRes.data) approvedPosts = approvedRes.data;
 
        // === Recent topics for deduplication (via RPC) ===
        var recentTopics: string[] = [];
        var recentRes = await supabase.rpc("get_recent_topics", { p_user_id: userId, p_limit: 15 });
        if (recentRes.data) {
          for (var r = 0; r < recentRes.data.length; r++) {
            if (recentRes.data[r].source_topic) recentTopics.push(recentRes.data[r].source_topic);
          }
        }
 
        var expertise: string[] = [];
        if (voice.expertise_topics && Array.isArray(voice.expertise_topics) && voice.expertise_topics.length > 0) {
          expertise = voice.expertise_topics;
        }
        if (expertise.length === 0) expertise = ["Business", "Technology"];
 
        // === PIPELINE ===
        var systemPrompt = buildVoiceDNA(voice, profile, approvedPosts);
        var allTopics = await discoverTopics(expertise, recentTopics, voice.language || "de");
        var topic = allTopics[Math.floor(Math.random() * Math.min(allTopics.length, 4))];
        var format = FORMATS[Math.floor(Math.random() * FORMATS.length)];
 
        // Step 2: Generate draft
        var rawDraft = await claude(
          systemPrompt,
          "Schreibe einen LinkedIn-Post zum Thema:\n" + topic +
          "\n\nFORMAT: " + format +
          "\n\n800-1300 Zeichen. Variierte Satzlaengen. Konkretes Detail. 3-4 Hashtags am Ende.\nNUR Post-Text.",
          1500
        );
 
        // Step 3: Critique and polish
        var critique = await critiqueAndPolish(rawDraft, profile.full_name || "Author", expertise.join(", "));
 
        // Step 4: Generate variation (optional, cost-conscious)
        var variation = "";
        try {
          variation = await claude(
            systemPrompt,
            "KOMPLETT ANDERE Version zum Thema '" + topic + "'. Anderer Hook, anderer Blickwinkel. Gleicher Ton.\n\nOriginal (zum Vergleich):\n" + critique.polished.substring(0, 400) + "\n\nNUR Post-Text.",
            1200
          );
        } catch (e) { /* variation is optional */ }
 
        // Save
        var insertRes = await supabase.rpc("create_rich_draft", {
          p_user_id: userId,
          p_source_topic: topic,
          p_draft_text: critique.polished,
          p_variations: JSON.stringify(variation ? [variation] : []),
          p_hook_options: JSON.stringify(critique.hooks),
          p_engagement_score: critique.score,
          p_generation_metadata: JSON.stringify({
            format: format.split(":")[0],
            pipeline: "cron-v3",
            duration_ms: Date.now() - userStart,
            generated_at: new Date().toISOString()
          })
        });
 
        var draftId = insertRes.data || "unknown";
        results.push({
          user: userId.substring(0, 8),
          topic: topic,
          score: critique.score,
          chars: critique.polished.length,
          variation: !!variation,
          draft_id: draftId,
          ms: Date.now() - userStart
        });
 
        // === Voice DNA learning (if enough data and not yet done) ===
        if (approvedPosts.length >= 3 && !voice.voice_dna) {
          try {
            var postTexts = "";
            for (var ap = 0; ap < Math.min(approvedPosts.length, 5); ap++) {
              var apText = approvedPosts[ap].revised_text || approvedPosts[ap].draft_text;
              if (apText) postTexts += "--- POST " + (ap + 1) + " ---\n" + apText.substring(0, 600) + "\n\n";
            }
            var analysis = await claude(
              "Analysiere den Schreibstil. Sei extrem spezifisch.",
              "LinkedIn-Posts von " + (profile.full_name || "Autor") + ":\n\n" + postTexts +
              "\nErstelle ein kompaktes Stimmprofil (max 400 Woerter): Satzlaenge, Wortwahl, Struktur, Hooks, Stilmittel, Einzigartigkeiten.",
              1500
            );
            await supabase.rpc("update_voice_dna", { p_user_id: userId, p_voice_dna: analysis });
            results[results.length - 1].voice_dna_updated = true;
          } catch (dnaErr) {
            console.error("Voice DNA update failed:", dnaErr);
          }
        }
 
      } catch (userError: any) {
        errors.push("User " + userId.substring(0, 8) + ": " + (userError?.message || "unknown error").substring(0, 100));
      }
    }
 
    return NextResponse.json({
      success: true,
      users_processed: users.length,
      drafts_created: results.length,
      errors: errors,
      results: results,
      pipeline: "cron-v3"
    });
  } catch (error: any) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron failed", detail: error?.message }, { status: 500 });
  }
}
 
