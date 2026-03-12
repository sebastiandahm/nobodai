"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Logging you in...");

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const hash = window.location.hash;
        if (hash && hash.includes("access_token")) {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (data.session) {
            setStatus("Success! Redirecting...");
            await redirectUser();
            return;
          }
        }

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const token_hash = params.get("token_hash");
        const type = params.get("type");

        if (code) {
          setStatus("Verifying your login...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setStatus("Success! Redirecting...");
          await redirectUser();
          return;
        }

        if (token_hash && type) {
          setStatus("Verifying your login...");
          const { error } = await supabase.auth.verifyOtp({
            type: type as "email",
            token_hash,
          });
          if (error) throw error;
          setStatus("Success! Redirecting...");
          await redirectUser();
          return;
        }

        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await redirectUser();
          return;
        }

        setError("No login credentials found. Please try logging in again.");
        setTimeout(() => router.push("/"), 3000);
      } catch (e: any) {
        console.error("Auth callback error:", e);
        setError(e?.message || "Login failed. Please try again.");
        setTimeout(() => router.push("/"), 3000);
      }
    };

    const redirectUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();
      if (profile?.onboarding_completed) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl tracking-tight mb-6">
          <span className="font-serif text-whisper">nobod</span>
          <span className="font-serif text-amber italic">.ai</span>
        </div>
        {error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
            <div className="text-shadow text-sm">{status}</div>
          </div>
        )}
      </div>
    </div>
  );
}
