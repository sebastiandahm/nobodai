"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [status, setStatus] = useState("Logging you in...");

  useEffect(() => {
        let attempts = 0;
        const maxAttempts = 5;

                const handleAuth = async () => {
                        try {
                                  // Attempt 1: Check if session already exists (Supabase auto-detects tokens)
                          const { data: existingSession } = await supabase.auth.getSession();
                                  if (existingSession?.session) {
                                              setStatus("Success! Redirecting...");
                                              await redirectUser();
                                              return;
                                  }

                          // Attempt 2: Exchange code from URL params (PKCE flow)
                          const params = new URLSearchParams(window.location.search);
                                  const code = params.get("code");
                                  if (code) {
                                              setStatus("Verifying your login...");
                                              const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
                                              if (!codeError) {
                                                            setStatus("Success! Redirecting...");
                                                            await redirectUser();
                                                            return;
                                              }
                                  }

                          // Attempt 3: Verify OTP from URL params (token_hash flow)
                          const tokenHash = params.get("token_hash");
                                  const type = params.get("type");
                                  if (tokenHash && type) {
                                              setStatus("Verifying your login...");
                                              const { error: otpError } = await supabase.auth.verifyOtp({
                                                            type: type as "email" | "magiclink",
                                                            token_hash: tokenHash,
                                              });
                                              if (!otpError) {
                                                            setStatus("Success! Redirecting...");
                                                            await redirectUser();
                                                            return;
                                              }
                                  }

                          // Attempt 4: Wait and retry - session might be setting up
                          if (attempts < maxAttempts) {
                                      attempts++;
                                      setStatus(`Verifying... (attempt ${attempts})`);
                                      await new Promise((r) => setTimeout(r, 1000));
                                      const { data: retrySession } = await supabase.auth.getSession();
                                      if (retrySession?.session) {
                                                    setStatus("Success! Redirecting...");
                                                    await redirectUser();
                                                    return;
                                      }
                                      if (attempts < maxAttempts) {
                                                    setTimeout(handleAuth, 500);
                                                    return;
                                      }
                          }

                          // All attempts failed — redirect to home
                          setError("Login verification failed. Redirecting to home page...");
                                  setTimeout(() => router.push("/"), 2000);
                        } catch (e: any) {
                                  console.error("Auth callback error:", e);
                                  setError("Something went wrong. Redirecting...");
                                  setTimeout(() => router.push("/"), 2000);
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

                // Listen for auth state changes (catches all flows)
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                        (event, session) => {
                                  if (event === "SIGNED_IN" && session) {
                                              setStatus("Success! Redirecting...");
                                              redirectUser();
                                  }
                        }
                      );

                handleAuth();

                return () => subscription.unsubscribe();
  }, [router]);

  return (
        <div className="min-h-screen bg-[#06080C] flex items-center justify-center">
              <div className="text-center">
                      <div className="text-2xl tracking-tight mb-6" style={{ fontFamily: "Georgia, serif" }}>
                                <span className="text-[#E5E7EB]">nobod</span>span>
                                <span className="text-[#F59E0B] italic">.ai</span>span>
                      </div>div>
                {error ? (
                    <div className="text-red-400 text-sm" style={{ fontFamily: "-apple-system, sans-serif" }}>{error}</div>div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-[#F59E0B]/30 border-t-[#F59E0B] rounded-full animate-spin" />
                                <div className="text-[#9CA3AF] text-sm" style={{ fontFamily: "-apple-system, sans-serif" }}>{status}</div>div>
                    </div>div>
                      )}
              </div>div>
        </div>div>
      );
}</div>
