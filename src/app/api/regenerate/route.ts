import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

async function claude(system: string, user: string, maxTokens?: number): Promise<string> {
  var res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens || 1500,
      system: system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    var err = await res.text();
    throw new Error("Claude API error " + res.status + ": " + err.substring(0, 200));
  }
  var data = await res.json();
  var text = "";
  if (data.content && data.content.length > 0 && data.content[0].type === "text") {
    text = data.content[0].text;
  }
  if (!text || text.trim().length < 20) {
    throw new Error("Claude returned empty or too-short response");
  }
  return text.trim();
}

// Build a rich system prompt from voice profile (same quality as generate route)
function buildSystemPrompt(voice: any, profile: any): string {
  var base = "Du bist " + (profile?.full_name || "der Nutzer") + ". Du schreibst LinkedIn-Posts in der Ich-Perspektive.";

  // If we have Voice DNA, use it (highest quality)
  if (voice.voice_dna) {
    base += "\n\n=== DEIN STIMMPROFIL (Voice DNA) ===\n" + voice.voice_dna;
  }

  // Add tone context
  var f = voice.tone_formality || 0.5;
  var h = voice.tone_humor || 0.3;
  var p = voice.tone_provocation || 0.5;

  var tone = "\n\n=== DEIN TON ===\n";
  if (f >= 0.7) tone += "Serioes und kompetent. ";
  else if (f >= 0.4) tone += "Professionell aber menschlich. ";
  else tone += "Locker und direkt. ";

  if (h >= 0.6) tone += "Humor ist willkommen. ";
  if (p >= 0.6) tone += "Polarisierende Meinungen sind OK. ";

  base += tone;

  if (voice.custom_instructions) {
    base += "\n\n=== SPEZIAL-WUENSCHE ===\n" + voice.custom_instructions;
  }

  base += "\n\n=== REGELN ===";
  base += "\n- Schreibe NUR den Post-Text, keine Erklaerungen oder Meta-Kommentare";
  base += "\n- Behalte den gleichen Ton und Stil wie das Original";
  base += "\n- 800-1300 Zeichen ideal";
  base += "\n- Variiere Satzlaengen bewusst";
  base += "\n- Keine generischen Floskeln ('In der heutigen Zeit', 'Lassen Sie mich teilen')";
  base += "\n- Sprache: " + (voice.language === "en" ? "English" : "Deutsch");

  return base;
}

export async function POST(request: NextRequest) {
  try {
    var supabase = getSupabase();
    var json = await request.json();
    var draftId = json.draftId;
    var userId = json.userId;
    var action = json.action || "refine";
    var feedback = json.feedback;

    if (!draftId || !userId) {
      return NextResponse.json({ error: "Missing draftId or userId" }, { status: 400 });
    }

    // === Load draft via RPC (bypasses RLS) ===
    var draftRes = await supabase.rpc("get_full_draft", { p_draft_id: draftId });
    if (draftRes.error || !draftRes.data || draftRes.data.length === 0) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    var draft = draftRes.data[0];

    // === Security: verify draft belongs to this user ===
    if (draft.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized: draft does not belong to user" }, { status: 403 });
    }

    // === Load full voice profile ===
    var voice: any = null;
    var vpRes = await supabase.rpc("get_full_voice_profile", { p_user_id: userId });
    if (!vpRes.error && vpRes.data && vpRes.data.length > 0) {
      voice = vpRes.data[0];
    } else {
      var basicVpRes = await supabase.rpc("get_voice_profile", { p_user_id: userId });
      if (basicVpRes.data && basicVpRes.data.length > 0) {
        voice = basicVpRes.data[0];
      }
    }

    if (!voice) {
      return NextResponse.json({ error: "No voice profile found" }, { status: 404 });
    }

    // === Load profile via RPC ===
    var profile: any = { full_name: "", company: "" };
    var profileRes = await supabase.rpc("get_profile_by_id", { p_user_id: userId });
    if (profileRes.data && profileRes.data.length > 0) {
      profile = profileRes.data[0];
    }

    // Build rich system prompt with Voice DNA
    var systemPrompt = buildSystemPrompt(voice, profile);
    var currentText = draft.draft_text;
    var newText = "";

    // === EXECUTE ACTION ===
    if (action === "swap_hook") {
      // Intelligent hook swap using stored alternatives
      var hooks: any[] = [];
      try {
        hooks = typeof draft.hook_options === "string" ? JSON.parse(draft.hook_options) : (draft.hook_options || []);
      } catch (e) { hooks = []; }

      if (hooks.length === 0) {
        // No stored hooks — generate a new one
        newText = await claude(
          systemPrompt,
          "Schreibe NUR die ersten 2-3 Zeilen dieses Posts komplett neu. Der Hook muss stoppen, neugierig machen, zum Weiterlesen zwingen. Rest bleibt gleich.\n\nOriginal:\n" + currentText +
          "\n\nSchreibe den KOMPLETTEN Post mit neuem Hook."
        );
      } else {
        // Use first stored hook, find natural break point
        var hookText = hooks[0];
        var lines = currentText.split("\n");
        // Find first blank line or third line as break point
        var breakIdx = 2;
        for (var li = 0; li < Math.min(lines.length, 5); li++) {
          if (lines[li].trim() === "") { breakIdx = li + 1; break; }
        }
        var restLines = lines.slice(breakIdx);
        newText = hookText + "\n\n" + restLines.join("\n");
        // Remove used hook and persist remaining hooks back to DB
        hooks.shift();
        await supabase.rpc("update_draft_hooks", {
          p_draft_id: draftId,
          p_hook_options: hooks
        });
      }

    } else if (action === "shorter") {
      newText = await claude(
        systemPrompt,
        "Kuerze diesen LinkedIn-Post auf maximal 700 Zeichen. Regeln:\n" +
        "- Behalte den Hook (erste 2 Zeilen) wenn er stark ist\n" +
        "- Behalte die Kernaussage\n" +
        "- Opfere Beispiele und Wiederholungen\n" +
        "- Jedes Wort muss tragen\n" +
        "- Hashtags bleiben\n\nOriginal:\n" + currentText
      );

    } else if (action === "more_provocative") {
      newText = await claude(
        systemPrompt,
        "Mach diesen LinkedIn-Post DEUTLICH provokanter. Regeln:\n" +
        "- Staerkere, polarisierendere These\n" +
        "- 'Unpopular opinion'-Energie\n" +
        "- Gleiche Laenge, gleicher Autor\n" +
        "- Nicht krawall-maessig, aber klar polarisierend\n" +
        "- Konkreter: nenne was du kritisierst beim Namen\n\nOriginal:\n" + currentText
      );

    } else if (action === "more_personal") {
      newText = await claude(
        systemPrompt,
        "Mach diesen LinkedIn-Post PERSOENLICHER. Regeln:\n" +
        "- Fuege eine konkrete Mini-Geschichte ein (Situation, Ort, Detail)\n" +
        "- Mehr Ich-Perspektive, weniger abstrakt\n" +
        "- Eine ehrliche Emotion oder Erkenntnis\n" +
        "- Gleiche Laenge, gleicher Ton\n" +
        "- Kein 'Ich moechte heute mit euch teilen' — direkt rein\n\nOriginal:\n" + currentText
      );

    } else if (action === "variation") {
      newText = await claude(
        systemPrompt,
        "Schreibe eine KOMPLETT NEUE Version zum selben Thema '" + (draft.source_topic || "diesem Thema") + "'.\n" +
        "- Anderer Hook\n- Andere Struktur (wenn Original Story war, jetzt Framework. Wenn Framework, jetzt Beobachtung.)\n" +
        "- Anderer Blickwinkel\n- Gleicher Autor, gleicher Ton, gleiche Laenge\n\nOriginal:\n" + currentText.substring(0, 600)
      );

    } else if (action === "custom" && feedback) {
      newText = await claude(
        systemPrompt,
        "Ueberarbeite diesen LinkedIn-Post basierend auf folgendem Feedback des Autors:\n\n" +
        "FEEDBACK: " + feedback + "\n\n" +
        "ORIGINAL POST:\n" + currentText + "\n\n" +
        "Setze das Feedback praezise um. Behalte den Ton. Schreibe den kompletten Post."
      );

    } else {
      // Default: general refinement
      newText = await claude(
        systemPrompt,
        "Verbessere diesen LinkedIn-Post. Konkret:\n" +
        "- Hook staerker machen (erste 2 Zeilen muessen zum Scrollen-Stoppen zwingen)\n" +
        "- Sprache natuerlicher (weniger 'geschrieben', mehr 'gesprochen')\n" +
        "- Ende einpraegsamer (Statement oder spezifische Frage)\n" +
        "- Gleiche Laenge, gleicher Ton\n\nOriginal:\n" + currentText
      );
    }

    // Validate the output
    if (!newText || newText.trim().length < 30) {
      return NextResponse.json({ error: "Regeneration produced empty result, please try again" }, { status: 500 });
    }

    // === Update draft via RPC (bypasses RLS) ===
    await supabase.rpc("update_draft_content", {
      p_draft_id: draftId,
      p_draft_text: newText,
      p_status: "generated",
      p_generation_metadata: {
        regenerated: true,
        action: action,
        feedback: feedback || null,
        previous_length: currentText.length,
        new_length: newText.length,
        regenerated_at: new Date().toISOString()
      }
    });

    // === Track regeneration for product analytics ===
    await supabase.rpc("track_regeneration", {
      p_draft_id: draftId,
      p_action: action,
      p_feedback: feedback || null
    });

    return NextResponse.json({
      success: true,
      action: action,
      new_text: newText,
      char_count: newText.length,
      previous_char_count: currentText.length
    });
  } catch (error: any) {
    console.error("Regeneration error:", error);
    return NextResponse.json({ error: error?.message || "Regeneration failed" }, { status: 500 });
  }
}
