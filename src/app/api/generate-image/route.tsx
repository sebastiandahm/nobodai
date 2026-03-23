import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic" as const;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

function extractHook(text: string): string {
  var lines = text.split("\n").filter(function (l: string) { return l.trim().length > 0; });
  var hook = lines[0] || "";
  if (hook.length < 60 && lines[1]) hook = hook + "\n" + lines[1];
  if (hook.length > 140) hook = hook.substring(0, 137) + "...";
  return hook;
}

function extractKeyInsight(text: string): string {
  var lines = text.split("\n").filter(function (l: string) { return l.trim().length > 0; });
  var best = "";
  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line.length < 20 || line.startsWith("#")) continue;
    if (line.length > best.length && line.length < 200) best = line;
  }
  if (best.length > 160) best = best.substring(0, 157) + "...";
  return best;
}

function getInitials(name: string): string {
  return name.split(" ").map(function (n: string) { return n[0] || ""; }).join("").slice(0, 2);
}

export async function POST(request: NextRequest) {
  try {
    var json = await request.json();
    var draftId = json.draftId;
    var userId = json.userId;
    var action = json.action || "generate-card";

    if (!draftId || !userId) {
      return NextResponse.json({ error: "Missing draftId or userId" }, { status: 400 });
    }

    var supabase = getSupabase();
    var draftRes = await supabase.rpc("get_draft_by_id", { p_draft_id: draftId });
    if (!draftRes.data || draftRes.data.length === 0) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    var draft = draftRes.data[0];

    if (action === "remove") {
      await supabase.rpc("update_draft_image", { p_draft_id: draftId, p_image_url: "", p_image_source: "" });
      return NextResponse.json({ success: true });
    }

    var hook = extractHook(draft.draft_text);
    var insight = extractKeyInsight(draft.draft_text);
    var profileRes = await supabase.rpc("get_profile_by_id", { p_user_id: userId });
    var authorName = "Author";
    if (profileRes.data && profileRes.data.length > 0) {
      authorName = profileRes.data[0].full_name || "Author";
    }
    var initials = getInitials(authorName);
    var topic = draft.source_topic || "";
    if (topic.length > 55) topic = topic.substring(0, 52) + "...";

    var cardJsx = (
      <div style={{
        width: "1200px", height: "630px", display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: "60px",
        background: "linear-gradient(135deg, #0D1117 0%, #1a1505 40%, #0D1117 100%)",
        fontFamily: "Georgia, serif", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "0", left: "0", width: "1200px", height: "5px",
          background: "linear-gradient(90deg, #F59E0B, #D97706, #F59E0B)", display: "flex",
        }} />
        <div style={{
          position: "absolute", top: "-80px", right: "-80px", width: "350px", height: "350px",
          borderRadius: "175px", background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
          display: "flex",
        }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1000px" }}>
          <div style={{
            fontSize: "52px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15,
            display: "flex", flexWrap: "wrap",
          }}>
            {hook}
          </div>
          {insight ? (
            <div style={{
              fontSize: "26px", color: "#999999", lineHeight: 1.5, maxWidth: "900px",
              display: "flex", flexWrap: "wrap",
            }}>
              {insight}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "26px",
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", fontWeight: 700, color: "#0D1117",
            }}>
              {initials}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ fontSize: "20px", color: "#E8E8E8", fontWeight: 700, display: "flex" }}>
                {authorName}
              </div>
              {topic ? (
                <div style={{ fontSize: "15px", color: "#F59E0B", display: "flex" }}>
                  {topic}
                </div>
              ) : null}
            </div>
          </div>
          <div style={{ display: "flex", gap: "3px", fontSize: "22px" }}>
            <span style={{ color: "#555555" }}>nobod</span>
            <span style={{ color: "#F59E0B", fontStyle: "italic" }}>.ai</span>
          </div>
        </div>
      </div>
    );

    var imageResponse = new ImageResponse(cardJsx, { width: 1200, height: 630 });
    var arrayBuf = await imageResponse.arrayBuffer();
    var buf = Buffer.from(arrayBuf);
    var imgPath = userId + "/" + draftId + "-card.png";

    var uploadRes = await supabase.storage.from("post-images").upload(imgPath, buf, {
      contentType: "image/png", upsert: true,
    });

    var imageUrl = "";
    if (uploadRes.error) {
      var base64 = buf.toString("base64");
      imageUrl = "data:image/png;base64," + base64;
    } else {
      var pubUrl = supabase.storage.from("post-images").getPublicUrl(imgPath);
      imageUrl = pubUrl.data.publicUrl;
    }

    await supabase.rpc("update_draft_image", {
      p_draft_id: draftId, p_image_url: imageUrl, p_image_source: "ai_card",
    });

    return NextResponse.json({ success: true, imageUrl: imageUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to generate image" }, { status: 500 });
  }
}
