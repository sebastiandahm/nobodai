"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "nobodai_cookie_consent_v1";

type ConsentState = {
  essential: true; // immer true, technisch notwendig
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

function getStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

function storeConsent(consent: ConsentState) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {
    /* ignore */
  }
}

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      // delay slightly so it doesn't flash on first paint
      const t = setTimeout(() => setShow(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  function acceptAll() {
    storeConsent({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    });
    setShow(false);
  }

  function rejectAll() {
    storeConsent({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
    setShow(false);
  }

  function saveSelection() {
    storeConsent({
      essential: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    });
    setShow(false);
    setShowSettings(false);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl p-5 sm:p-6 text-whisper">
        {!showSettings ? (
          <div className="space-y-4">
            <div>
              <h2
                id="cookie-banner-title"
                className="font-serif text-lg font-semibold"
              >
                Cookies und ähnliche Technologien
              </h2>
              <p
                id="cookie-banner-desc"
                className="text-sm text-shadow leading-relaxed mt-2"
              >
                Wir verwenden technisch notwendige Cookies, damit Login und
                Sitzung funktionieren. Optionale Cookies für Analyse oder
                Marketing setzen wir nur mit Ihrer Einwilligung. Sie können Ihre
                Auswahl jederzeit anpassen. Details in unseren{" "}
                <Link
                  href="/legal/cookies"
                  className="text-amber hover:underline"
                >
                  Cookie-Hinweisen
                </Link>{" "}
                und der{" "}
                <Link
                  href="/legal/datenschutz"
                  className="text-amber hover:underline"
                >
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:border-shadow transition"
              >
                Einstellungen
              </button>
              <button
                type="button"
                onClick={rejectAll}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:border-shadow transition"
              >
                Nur notwendige
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="px-4 py-2 rounded-lg bg-amber text-void text-sm font-medium hover:bg-amber/90 transition"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h2 className="font-serif text-lg font-semibold">
                Cookie-Einstellungen
              </h2>
              <p className="text-sm text-shadow mt-2">
                Wählen Sie, welche Kategorien Sie zulassen möchten.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border">
                <div>
                  <div className="text-sm font-medium">Technisch notwendig</div>
                  <div className="text-xs text-shadow mt-1">
                    Login-Sitzung, CSRF-Schutz. Ohne diese funktioniert der
                    Dienst nicht.
                  </div>
                </div>
                <div className="text-xs text-shadow shrink-0 pt-1">
                  Immer aktiv
                </div>
              </div>

              <label className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border cursor-pointer hover:border-shadow transition">
                <div>
                  <div className="text-sm font-medium">
                    Analyse (derzeit nicht aktiv)
                  </div>
                  <div className="text-xs text-shadow mt-1">
                    Anonyme Nutzungsstatistik. Aktuell setzen wir keine
                    Analyse-Cookies.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-amber"
                />
              </label>

              <label className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border cursor-pointer hover:border-shadow transition">
                <div>
                  <div className="text-sm font-medium">
                    Marketing (derzeit nicht aktiv)
                  </div>
                  <div className="text-xs text-shadow mt-1">
                    Externe Marketing- und Re-Targeting-Pixel. Aktuell setzen
                    wir keine Marketing-Cookies.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-amber"
                />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:border-shadow transition"
              >
                Zurück
              </button>
              <button
                type="button"
                onClick={saveSelection}
                className="px-4 py-2 rounded-lg bg-amber text-void text-sm font-medium hover:bg-amber/90 transition"
              >
                Auswahl speichern
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
