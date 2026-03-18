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

async function callClaude(sys: string, msg: string) {
    var res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, system: sys, messages: [{ role: "user", content: msg }] }),
      });
  var data = await res.json();
  return data.content?.[0]?.text || "";
}

export async function GET(request: NextRequest) {
  var auth = request.headers.get("authorization");
  if (auth !== "Bearer " + process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  var supabase = getSupabase();
  var results: any[] = [];
  var pr = await supabase.from("profiles").select("id, full_name, email").eq("onboarding_completed", true);
  if (!pr.data || pr.data.length === 0) {
    return NextResponse.json({ message: "No active users", generated: 0 });
  }
  var tr = await supabase.from("topics").select("*").order("relevance_score", { ascending: false }).limit(20);
  var topics = tr.data || [];
  for (var i = 0; i < pr.data.length; i++) {
      var profile = pr.data[i];
          try {
        var vr = await supabase.rpc("get_voice_profile", { p_user_id: profile.id });
        if (!vr.data || vr.data.length === 0) continue;
        var voice = vr.data[0];
        var shuffled = topics.slice().sort(function() { return Math.random() - 0.5; });
        var picked = shuffled.slice(0, 2);
        for (var j = 0; j < picked.length; j++) {
            var t = picked[j];
                    var text = await callClaude(
                        voice.system_prompt || "Du bist ein LinkedIn Ghostwriter.",
              "LinkedIn-Post zum Thema: " + t.title + "\nKontext: " + (t.summary || "") + "\n\nStarker Hook, persoenliche Perspektive, max 1300 Zeichen, 3-5 Hashtags. NUR Post-Text."
            );
            await supabase.rpc("create_draft", { p_user_id: profile.id, p_source_topic: t.title, p_source_url: t.url || "", p_draft_text: text, p_status: "generated" });
          }
          results.push({ user: profile.email, drafts: picked.length, status: "ok" });
          } catch (err: any) {
          results.push({ user: profile.email, drafts: 0, status: "error" });
        }
      }
      return NextResponse.json({ message: "Done", results: results, total: results.reduce(function(s: number, r: any) { return s + r.drafts; }, 0) });
    }
