"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import React from "react";

export default function AuthCallback() {
  const router = useRouter();
  const [msg, setMsg] = useState("Logging you in...");
  var tries = 0;

  useEffect(function() {
    function go() {
      supabase.auth.getSession().then(function(res) {
        if (res.data && res.data.session) { done(); return; }
        var p = new URLSearchParams(window.location.search);
        var code = p.get("code");
        if (code) {
          supabase.auth.exchangeCodeForSession(code).then(function(r) {
            if (!r.error) { done(); return; }
            tryOtp(p);
          });
        } else {
          tryOtp(p);
        }
      });
    }
    function tryOtp(p: URLSearchParams) {
      var th = p.get("token_hash");
      var ty = p.get("type");
      if (th && ty) {
        supabase.auth.verifyOtp({ type: ty as "email", token_hash: th }).then(function(r) {
          if (!r.error) { done(); return; }
          retry();
        });
      } else { retry(); }
    }
    function retry() {
      if (tries < 5) {
        tries++;
        setMsg("Verifying (" + tries + "/5)...");
        setTimeout(go, 1000);
      } else {
        setMsg("Login failed. Redirecting...");
        setTimeout(function() { router.push("/"); }, 2000);
      }
    }
    function done() {
      setMsg("Success! Redirecting...");
      supabase.auth.getUser().then(function(res) {
        if (!res.data || !res.data.user) { router.push("/"); return; }
        var uid = res.data.user.id;
        supabase.from("profiles").select("onboarding_completed").eq("id", uid).single().then(function(pr) {
          if (pr.data && pr.data.onboarding_completed) { router.push("/dashboard"); }
          else { router.push("/onboarding"); }
        });
      });
    }
    var sub = supabase.auth.onAuthStateChange(function(ev, sess) {
      if (ev === "SIGNED_IN" && sess) { done(); }
    });
    go();
    return function() { sub.data.subscription.unsubscribe(); };
  }, [router]);

  return React.createElement("div", {
    style: { minHeight: "100vh", background: "#06080C", display: "flex", alignItems: "center", justifyContent: "center" }
  }, React.createElement("div", { style: { textAlign: "center" } },
    React.createElement("div", { style: { fontSize: 24, marginBottom: 24, fontFamily: "Georgia, serif" } },
      React.createElement("span", { style: { color: "#E5E7EB" } }, "nobod"),
      React.createElement("span", { style: { color: "#F59E0B", fontStyle: "italic" } }, ".ai")
    ),
    React.createElement("div", {
      style: { width: 32, height: 32, border: "2px solid rgba(245,158,11,0.3)", borderTopColor: "#F59E0B", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 1s linear infinite" }
    }),
    React.createElement("div", { style: { color: "#9CA3AF", fontSize: 14, fontFamily: "sans-serif" } }, msg),
    React.createElement("style", null, "@keyframes spin { to { transform: rotate(360deg); } }")
  ));
}
