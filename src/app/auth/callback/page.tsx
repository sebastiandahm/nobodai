"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
      const router = useRouter();
      const [msg, setMsg] = useState("Logging you in...");

  useEffect(() => {
          let tries = 0;

                async function go() {
                          const { data: s } = await supabase.auth.getSession();
                          if (s?.session) return done();

            const p = new URLSearchParams(window.location.search);
                          const code = p.get("code");
                          if (code) {
                                      const { error } = await supabase.auth.exchangeCodeForSession(code);
                                      if (!error) return done();
                          }

            const th = p.get("token_hash");
                          const ty = p.get("type");
                          if (th && ty) {
                                      const { error } = await supabase.auth.verifyOtp({ type: ty as "email", token_hash: th });
                                      if (!error) return done();
                          }

            if (tries < 5) {
                        tries++;
                        setMsg("Verifying (" + tries + "/5)...");
                        setTimeout(go, 1000);
            } else {
                        setMsg("Login failed. Redirecting...");
                        setTimeout(function() { router.push("/"); }, 2000);
            }
                }

                async function done() {
                          setMsg("Success! Redirecting...");
                          const { data: u } = await supabase.auth.getUser();
                          if (!u?.user) { router.push("/"); return; }
                          const { data: pr } = await supabase.from("profiles").select("onboarding_completed").eq("id", u.user.id).single();
                          router.push(pr?.onboarding_completed ? "/dashboard" : "/onboarding");
                }

                const { data: sub } = supabase.auth.onAuthStateChange(function(ev, sess) {
                          if (ev === "SIGNED_IN" && sess) done();
                });

                go();

                return function() { sub.subscription.unsubscribe(); };
  }, [router]);

  return (
          <div style={{ minHeight: "100vh", background: "#06080C", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 24, marginBottom: 24, fontFamily: "Georgia, serif" }}>
                                              <span style={{ color: "#E5E7EB" }}>nobod</span>span>
                                              <span style={{ color: "#F59E0B", fontStyle: "italic" }}>.ai</span>span>
                                </div>div>
                                <div style={{ width: 32, height: 32, border: "2px solid rgba(245,158,11,0.3)", borderTopColor: "#F59E0B", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                                <div style={{ color: "#9CA3AF", fontSize: 14, fontFamily: "sans-serif" }}>{msg}</div>div>
                                <style>@keyframes spin {"{ to { transform: rotate(360deg); } }"}</style>style>
                    </div>div>
          </div>div>
        );
}
