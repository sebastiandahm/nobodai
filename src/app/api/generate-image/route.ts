import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabase() {
    return createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        );
  }

async function callClaude(system: string, user: string) {
    var res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
                  "Content-Type": "application/json",
                  "x-api-key": process.env.ANTHROPIC_API_KEY || "",
                  "anthropic-version": "2023-06-01",
                },
          body: JSON.stringify({
                  model: "claude-sonnet-4-20250514",
                  max_tokens: 500,
                  system: system,
                  messages: [{ role: "user", content: user }],
                }),
        });
    var data = await res.json();
    return data.content?.[0]?.text || "";
  }

function generateSVGCard(headline: string, topic: string): string {
    var lines: string[] = [];
    var words = headline.split(" ");
    var line = "";
    for (var k = 0; k < words.length; k++) {
          if ((line + " " + words[k]).length > 28) {
                  lines.push(line.trim());
                  line = words[k];
                } else {
                  line = line ? line + " " + words[k] : words[k];
                }
        }
    if (line) lines.push(line.trim());
    var displayLines = lines.slice(0, 4);
    var textY = 200 - (displayLines.length * 22);
    var textEls = "";
    for (var i = 0; i < displayLines.length; i++) {
          var safe = displayLines[i].replace(/&/g, "&amp;").replace(/</g, "&lt;");
          textEls += '<text x="400" y="' + (textY + i * 48) + '" font-family="Georgia,serif" font-size="36" fill="#FFF" text-anchor="middle" font-weight="bold">' + safe + '</text>';
        }
    var safeTopic = topic.replace(/&/g, "&amp;").replace(/</g, "&lt;").substring(0, 60);
    return '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="418" viewBox="0 0 800 418">' +
      '<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0D1117"/><stop offset="50%" style="stop-color:#1a1505"/><stop offset="100%" style="stop-color:#06080C"/></linearGradient></defs>' +
      '<rect width="800" height="418" fill="url(#bg)"/><rect x="0" y="0" width="800" height="4" fill="#F59E0B"/>' +
      '<circle cx="680" cy="80" r="120" fill="#F59E0B" opacity="0.05"/>' +
      textEls +
      '<text x="400" y="' + (textY + displayLines.length * 48 + 20) + '" font-family="sans-serif" font-size="14" fill="#F59E0B" text-anchor="middle" opacity="0.8">' + safeTopic + '</text>' +
      '<text x="40" y="398" font-family="Georgia,serif" font-size="18" fill="#F59E0B" opacity="0.6">nobod.ai</text>' +
      '</svg>';
  }

export async function POST(request: NextRequest) {
    try {
          var json = await request.json();
          var draftId = json.draftId;
          var userId = json.userId;
          var action = json.action;

          if (!draftId || !userId) {
                  return NextResponse.json({ error: "Missing draftId or userId" }, { status: 400 });
                }

          var supabase = getSupabase();
          var draftRes = await supabase.from("drafts").select("*").eq("id", draftId).eq("user_id", userId).single();
          var draft = draftRes.data;

          if (!draft) {
                  return NextResponse.json({ error: "Draft not found" }, { status: 404 });
                }

          if (action === "suggest") {
                  var suggestion = await callClaude(
                            "Du bist ein visueller Content-Berater. Generiere eine kurze Bildbeschreibung fuer einen LinkedIn-Post. Antworte NUR mit der Beschreibung, max 2 Saetze.",
                            "Bildbeschreibung fuer diesen Post:\n\n" + draft.draft_text.substring(0, 500)
                          );
                  await supabase.from("drafts").update({ image_prompt: suggestion }).eq("id", draftId);
                  return NextResponse.json({ image_prompt: suggestion });
                }

          if (action === "generate-card") {
                  var firstLine = "";
                  var postLines = draft.draft_text.split("\n");
                  for (var m = 0; m < postLines.length; m++) {
                            if (postLines[m].trim().length > 0) { firstLine = postLines[m].trim(); break; }
                          }
                  var headline = firstLine.length > 100 ? firstLine.substring(0, 100) + "..." : firstLine;
                  var svg = generateSVGCard(headline, draft.source_topic || "");
                  var buf = Buffer.from(svg, "utf-8");
                  var imgPath = userId + "/" + draftId + "-card.svg";
                  await supabase.storage.from("post-images").upload(imgPath, buf, { contentType: "image/svg+xml", upsert: true });
                  var pubUrl = supabase.storage.from("post-images").getPublicUrl(imgPath);
                  await supabase.from("drafts").update({ image_url: pubUrl.data.publicUrl, image_source: "ai_generated" }).eq("id", draftId);
                  return NextResponse.json({ url: pubUrl.data.publicUrl });
                }

          if (action === "remove") {
                  await supabase.from("drafts").update({ image_url: null, image_source: null, image_prompt: null }).eq("id", draftId);
                  return NextResponse.json({ success: true });
                }

          return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        } catch (error: any) {
          return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
        }
  }
