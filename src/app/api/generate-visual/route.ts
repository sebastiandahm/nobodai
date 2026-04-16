import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { fal } from "@fal-ai/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Mode = "quote" | "scene" | "avatar" | "infographic";

const MODEL_BY_MODE: Record<Mode, string> = {
  quote: "fal-ai/ideogram/v3",
  infographic: "fal-ai/ideogram/v3",
  scene: "fal-ai/flux-pro/v1.1",
  avatar: "fal-ai/flux-pro/v1.1", // fallback — real model is kontext, needs reference
};

const lastCallByUser = new Map<string, number>();
const RATE_WINDOW_MS = 10_000;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

function firstLine(text: string, max: number = 140): string {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  let hook = lines[0] || "";
  if (hook.length > max) hook = hook.substring(0, max - 3) + "...";
  return hook;
}

function stripPost(text: string, max: number = 400): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.substring(0, max - 3) + "...";
}

function buildPrompt(mode: Mode, draftText: string, topic: string, userPrompt: string | undefined, preset: string): string {
  if (userPrompt && userPrompt.trim().length > 0) return userPrompt.trim();

  const hook = firstLine(draftText, 120);
  const summary = stripPost(draftText, 300);
  const topicPart = topic ? `Topic: ${topic}. ` : "";
  const styleHint =
    preset === "bold"
      ? "Bold, high-contrast, punchy, saturated colors, confident typography."
      : preset === "minimal"
      ? "Minimal, lots of negative space, monochrome palette, thin typography."
      : "Editorial, serif typography, warm amber accent, dark sophisticated palette, Wes Anderson-ish composition.";

  if (mode === "quote") {
    return `LinkedIn quote card, square 1:1. Render this exact quote as the central element, legible typography, no other text: "${hook}". ${styleHint} Premium, editorial feel, no stock-photo cliches.`;
  }
  if (mode === "infographic") {
    return `LinkedIn infographic, square 1:1, for a post about: ${topicPart}${summary}. Clean diagram, labeled sections, arrows, numbers. ${styleHint} Readable at thumbnail size.`;
  }
  if (mode === "avatar") {
    return `Editorial environmental portrait scene for a LinkedIn post. ${topicPart}Conceptual illustration representing: ${summary}. Human element, thoughtful mood. ${styleHint} No generic stock photography. Photorealistic, cinematic lighting.`;
  }
  // scene
  return `Cinematic editorial scene for a LinkedIn post. ${topicPart}Visual metaphor for: ${summary}. ${styleHint} No generic office clichés, no literal laptops. Photorealistic, moody, depth.`;
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch generated image: ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function fetchLogoBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch {
    return null;
  }
}

async function postProcess(imageBuf: Buffer, logoUrl: string | null): Promise<Buffer> {
  const base = sharp(imageBuf).resize(1200, 1200, { fit: "cover", position: "center" });

  if (logoUrl) {
    const logoBuf = await fetchLogoBuffer(logoUrl);
    if (logoBuf) {
      const logoWidth = 180; // 15% of 1200
      const margin = 120; // 10% of 1200
      // Pad the logo on its right and bottom with transparent pixels so that when
      // composited with gravity=southeast, the logo sits `margin` pixels away from
      // the image's bottom-right corner.
      const paddedLogo = await sharp(logoBuf)
        .resize(logoWidth, logoWidth, { fit: "inside", withoutEnlargement: false })
        .extend({
          top: 0,
          left: 0,
          right: margin,
          bottom: margin,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();
      return base
        .composite([{ input: paddedLogo, gravity: "southeast" }])
        .png()
        .toBuffer();
    }
  }

  return base.png().toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: "Image generation not configured. FAL_KEY missing." },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({} as any));
    const draftId: string | undefined = body?.draftId;
    const userId: string | undefined = body?.userId;
    const rawMode: string | undefined = body?.mode;
    const userPrompt: string | undefined = body?.prompt;

    const allowedModes: Mode[] = ["quote", "scene", "avatar", "infographic"];
    if (!draftId || !userId || !rawMode || !allowedModes.includes(rawMode as Mode)) {
      return NextResponse.json(
        { error: "Missing or invalid draftId, userId, or mode" },
        { status: 400 }
      );
    }
    const mode = rawMode as Mode;

    // Rate limit: 1 call / 10s per user (in-process)
    const now = Date.now();
    const last = lastCallByUser.get(userId) || 0;
    if (now - last < RATE_WINDOW_MS) {
      const waitMs = RATE_WINDOW_MS - (now - last);
      return NextResponse.json(
        { error: `Rate limited. Retry in ${Math.ceil(waitMs / 1000)}s.` },
        { status: 429 }
      );
    }
    lastCallByUser.set(userId, now);

    const supabase = getSupabase();

    const draftRes = await supabase.rpc("get_draft_by_id", { p_draft_id: draftId });
    if (!draftRes.data || draftRes.data.length === 0) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    const draft = draftRes.data[0];

    const profileRes = await supabase
      .from("profiles")
      .select("brand_logo_url, brand_style_preset, full_name")
      .eq("id", userId)
      .single();
    const profile: any = profileRes.data || {};
    const preset: string = profile.brand_style_preset || "editorial";
    const logoUrl: string | null = profile.brand_logo_url || null;

    const prompt = buildPrompt(mode, draft.draft_text || "", draft.source_topic || "", userPrompt, preset);
    const model = MODEL_BY_MODE[mode];

    fal.config({ credentials: process.env.FAL_KEY });

    const falInput: Record<string, unknown> = { prompt };
    if (model === "fal-ai/ideogram/v3") {
      falInput.aspect_ratio = "1:1";
      falInput.rendering_speed = "BALANCED";
    } else if (model.startsWith("fal-ai/flux-pro")) {
      falInput.image_size = "square_hd";
      falInput.num_images = 1;
      falInput.safety_tolerance = "2";
    }

    let falResult: any;
    try {
      falResult = await fal.subscribe(model, { input: falInput, logs: false });
    } catch (falErr: any) {
      console.error("[generate-visual] fal.ai call failed:", falErr?.message || falErr);
      return NextResponse.json(
        { error: "Generation failed: " + (falErr?.message || "upstream error") },
        { status: 502 }
      );
    }

    const images = falResult?.data?.images || [];
    const imageUrl: string | undefined = images?.[0]?.url;
    if (!imageUrl) {
      console.error("[generate-visual] no image in fal response", JSON.stringify(falResult?.data || {}).slice(0, 500));
      return NextResponse.json({ error: "No image returned" }, { status: 502 });
    }

    const rawBuf = await fetchImageBuffer(imageUrl);
    const finalBuf = await postProcess(rawBuf, logoUrl);

    const imgPath = `${userId}/${draftId}-visual-${mode}-${Date.now()}.png`;
    const uploadRes = await supabase.storage
      .from("post-images")
      .upload(imgPath, finalBuf, { contentType: "image/png", upsert: true });

    if (uploadRes.error) {
      console.error("[generate-visual] upload failed:", uploadRes.error.message);
      return NextResponse.json(
        { error: "Upload failed: " + uploadRes.error.message },
        { status: 500 }
      );
    }

    const pubUrl = supabase.storage.from("post-images").getPublicUrl(imgPath);
    const publicUrl = pubUrl.data.publicUrl;

    await supabase.rpc("update_draft_image", {
      p_draft_id: draftId,
      p_image_url: publicUrl,
      p_image_source: "ai_visual_" + mode,
    });

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      mode,
      model,
    });
  } catch (error: any) {
    console.error("[generate-visual] unhandled:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate visual" },
      { status: 500 }
    );
  }
}
