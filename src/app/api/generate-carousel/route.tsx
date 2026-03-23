import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic" as const;
export const maxDuration = 60;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

async function claude(system: string, user: string, maxTokens: number = 2000) {
  var res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: system,
      messages: [{ role: "user", content: user }],
    }),
  });
  var data = await res.json();
  return data.content?.[0]?.text || "";
}

interface SlideData {
  type: "hook" | "content" | "stat" | "quote" | "cta";
  headline: string;
  body: string;
  slideNumber: number;
  totalSlides: number;
}

async function structureIntoSlides(postText: string, authorName: string): Promise<SlideData[]> {
  var result = await claude(
    "Du strukturierst LinkedIn-Posts in Carousel-Slides. Antworte NUR mit JSON, kein anderer Text.",
    "Strukturiere diesen LinkedIn-Post in 6-8 Carousel-Slides.\n\n" +
    "POST:\n" + postText + "\n\n" +
    "Regeln:\n" +
    "- Slide 1: Hook (provokante Headline die zum Swipen einlaedt)\n" +
    "- Slides 2-6: Content (ein Kernpunkt pro Slide, kurz und praegnant)\n" +
    "- Vorletzte Slide: Key Takeaway oder starkes Statement\n" +
    "- Letzte Slide: CTA (Follow + nobod.ai Branding)\n" +
    "- Jede Slide: max 15 Woerter headline, max 30 Woerter body\n" +
    "- Body darf auch leer sein wenn die headline allein stark genug ist\n\n" +
    'Antworte EXAKT in diesem JSON-Format:\n' +
    '{"slides": [{"type": "hook|content|stat|quote|cta", "headline": "...", "body": "..."}]}\n\n' +
    "NUR JSON. Kein Markdown. Keine Erklaerung.",
    1500
  );

  try {
    var cleaned = result.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    var parsed = JSON.parse(cleaned);
    var slides: SlideData[] = [];
    var total = parsed.slides.length;
    for (var i = 0; i < parsed.slides.length; i++) {
      slides.push({
        type: parsed.slides[i].type || "content",
        headline: parsed.slides[i].headline || "",
        body: parsed.slides[i].body || "",
        slideNumber: i + 1,
        totalSlides: total,
      });
    }
    return slides;
  } catch (e) {
    // Fallback: split post into chunks
    var lines = postText.split("\n").filter(function (l: string) { return l.trim().length > 0; });
    var fallbackSlides: SlideData[] = [];
    fallbackSlides.push({ type: "hook", headline: lines[0] || "Key Insight", body: "", slideNumber: 1, totalSlides: Math.min(lines.length + 1, 8) });
    for (var j = 1; j < Math.min(lines.length, 7); j++) {
      fallbackSlides.push({ type: "content", headline: lines[j], body: "", slideNumber: j + 1, totalSlides: fallbackSlides[0].totalSlides });
    }
    fallbackSlides.push({ type: "cta", headline: "Follow for more insights", body: authorName + " | nobod.ai", slideNumber: fallbackSlides.length + 1, totalSlides: fallbackSlides.length + 1 });
    return fallbackSlides;
  }
}

function getSlideColors(type: string): { bg1: string; bg2: string; accent: string } {
  switch (type) {
    case "hook": return { bg1: "#0D1117", bg2: "#1a1505", accent: "#F59E0B" };
    case "stat": return { bg1: "#0D1117", bg2: "#0a1628", accent: "#3B82F6" };
    case "quote": return { bg1: "#0D1117", bg2: "#1a0a1e", accent: "#A855F7" };
    case "cta": return { bg1: "#1a1505", bg2: "#0D1117", accent: "#F59E0B" };
    default: return { bg1: "#0D1117", bg2: "#0f1318", accent: "#F59E0B" };
  }
}

function renderSlide(slide: SlideData, authorName: string, initials: string): React.ReactElement {
  var colors = getSlideColors(slide.type);
  var isHook = slide.type === "hook";
  var isCta = slide.type === "cta";
  var headlineSize = slide.headline.length > 60 ? "36px" : slide.headline.length > 40 ? "42px" : "48px";

  return (
    <div style={{
      width: "1080px", height: "1350px", display: "flex", flexDirection: "column",
      justifyContent: isCta ? "center" : "space-between",
      padding: isHook ? "80px 60px" : "60px",
      background: "linear-gradient(160deg, " + colors.bg1 + " 0%, " + colors.bg2 + " 50%, " + colors.bg1 + " 100%)",
      fontFamily: "Georgia, serif", position: "relative", overflow: "hidden",
    }}>
      {/* Accent bar top */}
      <div style={{
        position: "absolute", top: "0", left: "0", width: "1080px", height: "5px",
        background: "linear-gradient(90deg, " + colors.accent + ", transparent)", display: "flex",
      }} />

      {/* Decorative circle */}
      <div style={{
        position: "absolute",
        top: isHook ? "-150px" : "auto",
        bottom: isHook ? "auto" : "-100px",
        right: "-100px",
        width: "400px", height: "400px", borderRadius: "200px",
        background: "radial-gradient(circle, " + colors.accent + "08 0%, transparent 70%)",
        display: "flex",
      }} />

      {/* Slide counter */}
      {!isCta ? (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{
            fontSize: "14px", color: colors.accent, fontFamily: "sans-serif",
            letterSpacing: "0.15em", fontWeight: 600, display: "flex",
          }}>
            {String(slide.slideNumber).padStart(2, "0") + " / " + String(slide.totalSlides).padStart(2, "0")}
          </div>
          {isHook ? (
            <div style={{
              fontSize: "13px", color: "#555", fontFamily: "sans-serif",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <span>Swipe</span>
              <span style={{ fontSize: "18px" }}>{">"}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Main content */}
      <div style={{
        display: "flex", flexDirection: "column", gap: "24px",
        flex: isCta ? "none" : "1",
        justifyContent: isHook ? "center" : isCta ? "center" : "center",
        alignItems: isCta ? "center" : "flex-start",
        textAlign: isCta ? "center" : "left",
        maxWidth: "960px",
      }}>
        {isCta ? (
          <div style={{
            width: "80px", height: "80px", borderRadius: "40px",
            background: "linear-gradient(135deg, " + colors.accent + ", #D97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", fontWeight: 700, color: "#0D1117",
            marginBottom: "16px",
          }}>
            {initials}
          </div>
        ) : null}

        <div style={{
          fontSize: isHook ? "56px" : headlineSize,
          fontWeight: 700, color: "#FFFFFF",
          lineHeight: 1.15, display: "flex", flexWrap: "wrap",
        }}>
          {slide.headline}
        </div>

        {slide.body ? (
          <div style={{
            fontSize: isCta ? "22px" : "26px",
            color: isCta ? "#999" : "#A0A0A0",
            lineHeight: 1.6, display: "flex", flexWrap: "wrap",
            maxWidth: "860px",
          }}>
            {slide.body}
          </div>
        ) : null}

        {isCta ? (
          <div style={{
            marginTop: "32px", display: "flex", gap: "8px",
            background: colors.accent, color: "#0D1117",
            padding: "16px 40px", borderRadius: "12px",
            fontSize: "20px", fontWeight: 700, fontFamily: "sans-serif",
          }}>
            Follow for more
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        width: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "20px",
            background: "linear-gradient(135deg, " + colors.accent + ", #D97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", fontWeight: 700, color: "#0D1117",
          }}>
            {initials}
          </div>
          <div style={{ fontSize: "16px", color: "#888", fontFamily: "sans-serif", display: "flex" }}>
            {authorName}
          </div>
        </div>
        <div style={{ display: "flex", gap: "3px", fontSize: "18px" }}>
          <span style={{ color: "#444" }}>nobod</span>
          <span style={{ color: colors.accent, fontStyle: "italic" }}>.ai</span>
        </div>
      </div>
    </div>
  ) as any;
}

export async function POST(request: NextRequest) {
  try {
    var json = await request.json();
    var draftId = json.draftId;
    var userId = json.userId;

    if (!draftId || !userId) {
      return NextResponse.json({ error: "Missing draftId or userId" }, { status: 400 });
    }

    var supabase = getSupabase();

    // Fetch draft
    var draftRes = await supabase.rpc("get_draft_by_id", { p_draft_id: draftId });
    if (!draftRes.data || draftRes.data.length === 0) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    var draft = draftRes.data[0];

    // Get author name
    var profileRes = await supabase.rpc("get_profile_by_id", { p_user_id: userId });
    var authorName = "Author";
    if (profileRes.data && profileRes.data.length > 0) {
      authorName = profileRes.data[0].full_name || "Author";
    }
    var initials = authorName.split(" ").map(function (n: string) { return n[0] || ""; }).join("").slice(0, 2);

    // Step 1: Structure post into slides
    var slides = await structureIntoSlides(draft.draft_text, authorName);

    // Step 2: Generate PNG for each slide
    var pngBuffers: Buffer[] = [];
    for (var s = 0; s < slides.length; s++) {
      var slideJsx = renderSlide(slides[s], authorName, initials);
      var imgResponse = new ImageResponse(slideJsx, { width: 1080, height: 1350 });
      var arrBuf = await imgResponse.arrayBuffer();
      pngBuffers.push(Buffer.from(arrBuf));
    }

    // Step 3: Combine into PDF
    var pdfDoc = await PDFDocument.create();
    for (var p = 0; p < pngBuffers.length; p++) {
      var pngImage = await pdfDoc.embedPng(pngBuffers[p]);
      var page = pdfDoc.addPage([1080, 1350]);
      page.drawImage(pngImage, { x: 0, y: 0, width: 1080, height: 1350 });
    }
    var pdfBytes = await pdfDoc.save();
    var pdfBuffer = Buffer.from(pdfBytes);

    // Step 4: Upload to Supabase storage
    var pdfPath = userId + "/" + draftId + "-carousel.pdf";
    var uploadRes = await supabase.storage.from("post-images").upload(pdfPath, pdfBuffer, {
      contentType: "application/pdf", upsert: true,
    });

    var pdfUrl = "";
    if (uploadRes.error) {
      // Fallback: return as data URL
      var base64 = pdfBuffer.toString("base64");
      pdfUrl = "data:application/pdf;base64," + base64;
    } else {
      var pubUrl = supabase.storage.from("post-images").getPublicUrl(pdfPath);
      pdfUrl = pubUrl.data.publicUrl;
    }

    // Step 5: Update draft with carousel URL
    await supabase.rpc("update_draft_image", {
      p_draft_id: draftId,
      p_image_url: pdfUrl,
      p_image_source: "carousel",
    });

    return NextResponse.json({
      success: true,
      carouselUrl: pdfUrl,
      slideCount: slides.length,
      slides: slides.map(function (sl: SlideData) { return { type: sl.type, headline: sl.headline }; }),
    });

  } catch (error: any) {
    console.error("Carousel error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate carousel" }, { status: 500 });
  }
}
