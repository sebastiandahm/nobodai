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

const SAMPLE_TOPICS = [
  { title: "KI-Agenten revolutionieren den Mittelstand", summary: "Immer mehr mittelstaendische Unternehmen setzen auf autonome KI-Agenten statt klassischer SaaS-Tools. Der Trend geht von Tool-Nutzung zu Agent-Delegation.", url: "https://example.com/ki-agenten" },
  { title: "LinkedIn Algorithmus Update Q1 2026", summary: "LinkedIn belohnt jetzt laengere Verweildauer (Dwell Time) staerker als Likes. Posts mit Storytelling-Elementen performen 3x besser als reine Fakten-Posts.", url: "https://example.com/linkedin-algo" },
  { title: "Remote Work vs. Office: Die grosse Debatte 2026", summary: "Neue Studien zeigen: Hybrid-Modelle mit 2-3 Buerotagen pro Woche maximieren sowohl Produktivitaet als auch Mitarbeiterzufriedenheit.", url: "https://example.com/remote-work" },
];

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

    const selectedTopics = SAMPLE_TOPICS.sort(() => Math.random() - 0.5).slice(0, 2);
    const drafts = [];

    for (const topic of selectedTopics) {
      const postText = await callClaude(
        voiceProfile.system_prompt || "Du bist ein LinkedIn Ghostwriter. Schreibe auf Deutsch.",
        "Schreibe einen LinkedIn-Post zum folgenden Thema:\n\nTHEMA: " + topic.title + "\nKONTEXT: " + topic.summary + "\n\nDer Post soll:\n- Einen starken Hook in den ersten 2 Zeilen haben\n- Eine persoenliche Perspektive oder Meinung enthalten\n- Einen konkreten Mehrwert oder Takeaway fuer den Leser bieten\n- Mit einer Frage oder einem Call-to-Action enden\n- Maximal 1.300 Zeichen lang sein\n- Natuerlich und menschlich klingen\n\nSchreibe NUR den Post-Text, keine Erklaerungen oder Meta-Kommentare."
      );

      const { data: newId, error: insertError } = await supabase.rpc("create_draft", {
        p_user_id: userId,
        p_source_topic: topic.title,
        p_source_url: topic.url,
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
