import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
    return createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
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
    const data = await res.json();
    return data.content?.[0]?.type === "text" ? data.content[0].text : "";
}

const SAMPLE_TOPICS = [
  { title: "KI-Agenten revolutionieren den Mittelstand", summary: "Immer mehr mittelständische Unternehmen setzen auf autonome KI-Agenten statt klassischer SaaS-Tools.", url: "https://example.com/ki-agenten" },
  { title: "LinkedIn Algorithmus Update Q1 2026", summary: "LinkedIn belohnt jetzt längere Verweildauer stärker als Likes. Posts mit Storytelling performen 3x besser.", url: "https://example.com/linkedin-algo" },
  { title: "Remote Work vs. Office: Die Debatte 2026", summary: "Neue Studien zeigen: Hybrid-Modelle mit 2-3 Bürotagen maximieren Produktivität und Zufriedenheit.", url: "https://example.com/remote-work" },
  ];

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
          const supabaseAdmin = getSupabase();
          const { userId } = await request.json();
          if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
          const { data: voiceProfile } = await supabaseAdmin.from("voice_profiles").select("*").eq("user_id", userId).single();
          if (!voiceProfile) return NextResponse.json({ error: "No voice profile found" }, { status: 404 });
          const selectedTopics = SAMPLE_TOPICS.sort(() => Math.random() - 0.5).slice(0, 2);
          const drafts = [];
          for (const topic of selectedTopics) {
                  const postText = await callClaude(
                            voiceProfile.system_prompt || "Du bist ein LinkedIn Ghostwriter.",
                            "Schreibe einen LinkedIn-Post zum folgenden Thema:\n\nTHEMA: " + topic.title + "\nKONTEXT: " + topic.summary + "\n\nDer Post soll:\n- Einen starken Hook in den ersten 2 Zeilen haben\n- Eine persönliche Perspektive enthalten\n- Einen konkreten Mehrwert bieten\n- Mit einer Frage oder CTA enden\n- Maximal 1.300 Zeichen lang sein\n- Natürlich und menschlich klingen\n\nSchreibe NUR den Post-Text."
                          );
                  const { data: draft } = await supabaseAdmin.from("drafts").insert({ user_id: userId, source_topic: topic.title, source_url: topic.url, draft_text: postText, status: "generated" }).select().single();
                  if (draft) drafts.push(draft);
          }
          return NextResponse.json({ success: true, drafts_created: drafts.length });
    } catch (error) {
          console.error("Generation error:", error);
          return NextResponse.json({ error: "Failed to generate drafts" }, { status: 500 });
    }
}
