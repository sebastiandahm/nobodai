import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
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
  type: string;
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
    "- Letzte Slide: CTA mit Follow-Aufforderung\n" +
    "- Jede Slide: max 12 Woerter headline, max 25 Woerter body\n" +
    "- Body darf auch leer sein wenn die headline allein stark genug ist\n\n" +
    'Antworte EXAKT in diesem JSON-Format:\n' +
    '{"slides": [{"type": "hook", "headline": "...", "body": "..."}, {"type": "content", "headline": "...", "body": "..."}]}\n\n' +
    "Typen: hook, content, stat, quote, cta\n" +
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
    var lines = postText.split("\n").filter(function (l: string) { return l.trim().length > 0; });
    var fallbackSlides: SlideData[] = [];
    var total2 = Math.min(lines.length + 1, 8);
    fallbackSlides.push({ type: "hook", headline: lines[0] || "Key Insight", body: "", slideNumber: 1, totalSlides: total2 });
    for (var j = 1; j < Math.min(lines.length, total2 - 1); j++) {
      fallbackSlides.push({ type: "content", headline: lines[j].substring(0, 80), body: "", slideNumber: j + 1, totalSlides: total2 });
    }
    fallbackSlides.push({ type: "cta", headline: "Follow for more", body: authorName, slideNumber: total2, totalSlides: total2 });
    return fallbackSlides;
  }
}

function hexToRgb(hex: string) {
  var r = parseInt(hex.substring(1, 3), 16) / 255;
  var g = parseInt(hex.substring(3, 5), 16) / 255;
  var b = parseInt(hex.substring(5, 7), 16) / 255;
  return rgb(r, g, b);
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  var words = text.split(" ");
  var lines: string[] = [];
  var currentLine = "";
  for (var i = 0; i < words.length; i++) {
    var testLine = currentLine ? currentLine + " " + words[i] : words[i];
    if (testLine.length > maxCharsPerLine && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
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

    var draftRes = await supabase.rpc("get_draft_by_id", { p_draft_id: draftId });
    if (!draftRes.data || draftRes.data.length === 0) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    var draft = draftRes.data[0];

    var profileRes = await supabase.rpc("get_profile_by_id", { p_user_id: userId });
    var authorName = "Author";
    if (profileRes.data && profileRes.data.length > 0) {
      authorName = profileRes.data[0].full_name || "Author";
    }
    var initials = authorName.split(" ").map(function (n: string) { return n[0] || ""; }).join("").slice(0, 2);

    // Step 1: Structure into slides
    var slides = await structureIntoSlides(draft.draft_text, authorName);

    // Step 2: Build PDF with pdf-lib
    var pdfDoc = await PDFDocument.create();
    var fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    var fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    var fontSans = await pdfDoc.embedFont(StandardFonts.Helvetica);
    var fontSansBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    var W = 1080;
    var H = 1350;
    var PAD = 70;
    var bgColor = hexToRgb("#0D1117");
    var amber = hexToRgb("#F59E0B");
    var white = hexToRgb("#FFFFFF");
    var gray = hexToRgb("#888888");
    var darkGray = hexToRgb("#444444");
    var subtleBg = hexToRgb("#141820");

    for (var s = 0; s < slides.length; s++) {
      var slide = slides[s];
      var page = pdfDoc.addPage([W, H]);
      var isHook = slide.type === "hook";
      var isCta = slide.type === "cta";

      // Background
      page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: bgColor });

      // Subtle gradient overlay (darker rectangle at bottom)
      page.drawRectangle({ x: 0, y: 0, width: W, height: H / 3, color: subtleBg, opacity: 0.3 });

      // Top accent bar
      page.drawRectangle({ x: 0, y: H - 5, width: W, height: 5, color: amber });

      // Decorative circle (top-right)
      page.drawCircle({ x: W - 50, y: H - 120, size: 180, color: amber, opacity: 0.04 });

      // Slide counter (top-left)
      if (!isCta) {
        var counterText = String(slide.slideNumber).padStart(2, "0") + " / " + String(slide.totalSlides).padStart(2, "0");
        page.drawText(counterText, {
          x: PAD, y: H - 60, size: 16, font: fontSansBold, color: amber,
        });

        if (isHook) {
          page.drawText("Swipe >", {
            x: W - PAD - 80, y: H - 60, size: 14, font: fontSans, color: darkGray,
          });
        }
      }

      // Main content area
      var headlineSize = isHook ? 54 : isCta ? 48 : (slide.headline.length > 50 ? 36 : 44);
      var headlineLines = wrapText(slide.headline, isHook ? 22 : 26);
      var headlineStartY = isCta ? H / 2 + 100 : (isHook ? H / 2 + 80 : H / 2 + 60 + (headlineLines.length * 25));

      // CTA: draw initials circle
      if (isCta) {
        page.drawCircle({ x: W / 2, y: headlineStartY + 120, size: 50, color: amber });
        page.drawText(initials, {
          x: W / 2 - (initials.length * 12), y: headlineStartY + 106, size: 32, font: fontSansBold, color: bgColor,
        });
      }

      // Headline
      for (var h = 0; h < headlineLines.length; h++) {
        var hx = isCta ? (W / 2) - (headlineLines[h].length * headlineSize * 0.28) : PAD;
        page.drawText(headlineLines[h], {
          x: hx, y: headlineStartY - (h * (headlineSize + 10)),
          size: headlineSize, font: fontBold, color: white,
        });
      }

      // Body text
      if (slide.body) {
        var bodyLines = wrapText(slide.body, 42);
        var bodyStartY = headlineStartY - (headlineLines.length * (headlineSize + 10)) - 30;
        for (var b = 0; b < bodyLines.length; b++) {
          var bx = isCta ? (W / 2) - (bodyLines[b].length * 7) : PAD;
          page.drawText(bodyLines[b], {
            x: bx, y: bodyStartY - (b * 34),
            size: 24, font: fontRegular, color: gray,
          });
        }
      }

      // CTA button
      if (isCta) {
        var btnW = 300;
        var btnH = 56;
        var btnX = (W - btnW) / 2;
        var btnY = 300;
        page.drawRectangle({ x: btnX, y: btnY, width: btnW, height: btnH, color: amber });
        page.drawText("Follow for more", {
          x: btnX + 52, y: btnY + 18, size: 22, font: fontSansBold, color: bgColor,
        });
      }

      // Footer: author + nobod.ai
      // Author avatar circle
      page.drawCircle({ x: PAD + 22, y: 60, size: 22, color: amber });
      page.drawText(initials, {
        x: PAD + 12, y: 52, size: 16, font: fontSansBold, color: bgColor,
      });
      page.drawText(authorName, {
        x: PAD + 54, y: 54, size: 16, font: fontSans, color: gray,
      });

      // nobod.ai logo
      page.drawText("nobod", {
        x: W - PAD - 100, y: 54, size: 18, font: fontRegular, color: darkGray,
      });
      page.drawText(".ai", {
        x: W - PAD - 32, y: 54, size: 18, font: fontBold, color: amber,
      });
    }

    // Step 3: Save PDF
    var pdfBytes = await pdfDoc.save();
    var pdfBuffer = Buffer.from(pdfBytes);

    // Step 4: Upload to Supabase
    var pdfPath = userId + "/" + draftId + "-carousel.pdf";
    var uploadRes = await supabase.storage.from("post-images").upload(pdfPath, pdfBuffer, {
      contentType: "application/pdf", upsert: true,
    });

    var pdfUrl = "";
    if (uploadRes.error) {
      var base64 = pdfBuffer.toString("base64");
      pdfUrl = "data:application/pdf;base64," + base64;
    } else {
      var pubUrl = supabase.storage.from("post-images").getPublicUrl(pdfPath);
      pdfUrl = pubUrl.data.publicUrl;
    }

    // Step 5: Update draft
    await supabase.rpc("update_draft_image", {
      p_draft_id: draftId, p_image_url: pdfUrl, p_image_source: "carousel",
    });

    return NextResponse.json({
      success: true,
      carouselUrl: pdfUrl,
      slideCount: slides.length,
      slides: slides.map(function (sl: SlideData) { return { type: sl.type, headline: sl.headline }; }),
    });

  } catch (error: any) {
    console.error("Carousel error:", error?.message, error?.stack);
    return NextResponse.json({ error: error?.message || "Failed to generate carousel" }, { status: 500 });
  }
}
