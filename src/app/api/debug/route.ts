import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  let supabaseReachable = false;
  try {
    if (supabaseUrl) {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: anonKey || "" },
      });
      supabaseReachable = res.ok;
    }
  } catch (e) {}

  return NextResponse.json({
    env: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? "SET (" + supabaseUrl.slice(0, 30) + "...)" : "MISSING",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey ? "SET (" + anonKey.slice(0, 20) + "...)" : "MISSING",
      ANTHROPIC_API_KEY: anthropicKey ? "SET (sk-ant-...)" : "MISSING",
    },
    supabaseReachable,
    timestamp: new Date().toISOString(),
  });
}
