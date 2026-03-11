import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Sample trending topics (in production: fetched via web search daily)
const SAMPLE_TOPICS = [
  {
    title: "KI-Agenten revolutionieren den Mittelstand",
    summary:
      "Immer mehr mittelständische Unternehmen setzen auf autonome KI-Agenten statt klassischer SaaS-Tools. Der Trend geht von Tool-Nutzung zu Agent-Delegation.",
    url: "https://example.com/ki-agenten",
  },
  {
    title: "LinkedIn Algorithmus Update Q1 2026",
    summary:
      "LinkedIn belohnt jetzt längere Verweildauer (Dwell Time) stärker als Likes. Posts mit Storytelling-Elementen performen 3x besser als reine Fakten-Posts.",
    url: "https://example.com/linkedin-algo",
  },
  {
    title: "Remote Work vs. Office: Die Debatte 2026",
    summary:
      "Neue Studien zeigen: Hybrid-Modelle mit 2-3 Bürotagen pro Woche maximieren sowohl Produktivität als auch Mitarbeiterzufriedenheit.",
    url: "https://example.com/remote-work",
  },
];

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Get user's voice profile
    const { data: voiceProfile } = await supabaseAdmin
      .from("voice_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!voiceProfile) {
      return NextResponse.json(
        { error: "No voice profile found" },
        { status: 404 }
      );
    }

    // Get user profile for context
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // Pick 2 random topics
    const selectedTopics = SAMPLE_TOPICS.sort(() => Math.random() - 0.5).slice(0, 2);

    // Generate drafts via Claude
    const drafts = [];

    for (const topic of selectedTopics) {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: voiceProfile.system_prompt || "Du bist ein LinkedIn Ghostwriter.",
        messages: [
          {
            role: "user",
            content: `Schreibe einen LinkedIn-Post zum folgenden Thema:

THEMA: ${topic.title}
KONTEXT: ${topic.summary}

Der Post soll:
- Einen starken Hook in den ersten 2 Zeilen haben
- Eine persönliche Perspektive oder Meinung enthalten
- Einen konkreten Mehrwert oder Takeaway für den Leser bieten
- Mit einer Frage oder einem Call-to-Action enden
- Maximal 1.300 Zeichen lang sein
- Natürlich und menschlich klingen

Schreibe NUR den Post-Text, keine Erklärungen oder Meta-Kommentare.`,
          },
        ],
      });

      const postText =
        message.content[0].type === "text" ? message.content[0].text : "";

      // Save draft to database
      const { data: draft } = await supabaseAdmin
        .from("drafts")
        .insert({
          user_id: userId,
          source_topic: topic.title,
          source_url: topic.url,
          draft_text: postText,
          status: "generated",
        })
        .select()
        .single();

      if (draft) drafts.push(draft);
    }

    return NextResponse.json({
      success: true,
      drafts_created: drafts.length,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate drafts" },
      { status: 500 }
    );
  }
}
