import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabase() {
    return createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        );
  }

export async function POST(request: NextRequest) {
    try {
          var formData = await request.formData();
          var file = formData.get("file") as File | null;
          var userId = formData.get("userId") as string | null;
          var draftId = formData.get("draftId") as string | null;

          if (!file || !userId || !draftId) {
                  return NextResponse.json({ error: "Missing file, userId, or draftId" }, { status: 400 });
                }

          var allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
          if (!allowed.includes(file.type)) {
                  return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF allowed" }, { status: 400 });
                }
          if (file.size > 5 * 1024 * 1024) {
                  return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
                }

          var supabase = getSupabase();
          var ext = file.name.split(".").pop() || "jpg";
          var path = userId + "/" + draftId + "." + ext;
          var buffer = Buffer.from(await file.arrayBuffer());

          var uploadResult = await supabase.storage.from("post-images").upload(path, buffer, {
                  contentType: file.type,
                  upsert: true,
                });

          if (uploadResult.error) {
                  return NextResponse.json({ error: uploadResult.error.message }, { status: 500 });
                }

          var urlData = supabase.storage.from("post-images").getPublicUrl(path);
          var imageUrl = urlData.data.publicUrl;

          await supabase.from("drafts").update({ image_url: imageUrl, image_source: "uploaded" }).eq("id", draftId).eq("user_id", userId);

          return NextResponse.json({ url: imageUrl });
        } catch (error: any) {
          return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 });
        }
  }
