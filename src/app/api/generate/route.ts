import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

async function callClaude(systemPrompt: string, userMessage: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error("Claude API error: " + res.status + " " + errText);
  }
  const data = await res.json();
  return data.content?.[0]?.type === "text" ? data.content[0].text : "";
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { data: voiceData, error: vpError } = await supabase.rpc("get_voice_profile", { p_user_id: userId });
    if (vpError || !voiceData || voiceData.length === 0) {
      return NextResponse.json({ error: "No voice profile found", detail: vpError?.message }, { status: 404 });
    }
    const voiceProfile = voiceData[0];
    const userTopics = voiceProfile.expertise_topics || [];

    const { data: dbTopics } = await supabase
      .from("topics")
      .select("*")
      .order("relevance_score", { ascending: false })
      .limit(20);

    let selectedTopics = [];
    if (dbTopics && dbTopics.length > 0) {
      const scored = dbTopics.map((t: any) => {
        const tags = t.relevance_tags || [];
        const matchCount = tags.filter((tag: string) => userTopics.some((ut: string) => ut.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(ut.toLowerCase()))).length;
        return { ...t, matchScore: matchCount * 2 + (t.relevance_score || 0) };
      });
      scored.sort((a: any, b: any) => b.matchScore - a.matchScore);
      const top = scored.slice(0, 5);
      for (let i = top.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [top[i], top[j]] = [top[j], top[i]];
      }
      selectedTopics = top.slice(0, 2);
    } else {
      selectedTopics = [
        { title: "KI-Agenten im Mittelstand", summary: "Der Trend zu autonomen KI-Agenten beschleunigt sich.", url: "" },
        { title: "LinkedIn Content Strategie 2026", summary: "Dwell Time wird wichtiger als Likes.", url: "" },
      ];
    }

    const drafts = [];
    for (const topic of selectedTopics) {
      const postText = await callClaude(
        voiceProfile.system_prompt || "Du bist ein LinkedIn Ghostwriter. Schreibe auf Deutsch.",
        "Schreibe einen LinkedIn-Post zum folgenden Thema:\n\nTHEMA: " + topic.title + "\nKONTEXT: " + (topic.summary || "") + "\n\nDer Post soll:\n- Einen starken Hook in den ersten 2 Zeilen haben (kurz, ueberraschend, provokant)\n- Eine persoenliche Perspektive oder Erfahrung enthalten (Ich-Form)\n- Einen konkreten Mehrwert oder Takeaway fuer den Leser bieten\n- Absaetze und Zeilenumbrueche fuer Lesbarkeit nutzen\n- Mit einer Frage oder einem Call-to-Action enden\n- Maximal 1.300 Zeichen lang sein\n- Natuerlich und menschlich klingen, NICHT wie KI\n- 3-5 relevante Hashtags am Ende\n\nSchreibe NUR den Post-Text. Keine Erklaerungen, keine Anmerkungen."
      );

      const { data: newId, error: insertError } = await supabase.rpc("create_draft", {
        p_user_id: userId,
        p_source_topic: topic.title,
        p_source_url: topic.url || "",
        p_draft_text: postText,
        p_status: "generated"
      });

      if (!insertError && newId) {
        drafts.push({ id: newId, topic: topic.title });
      }
    }

    return NextResponse.json({ success: true, drafts_created: drafts.length, drafts });
  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Failed to generate drafts", detail: error?.message }, { status: 500 });
  }
}
