import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies — nobod.ai",
  robots: { index: false, follow: false },
};

export default function CookiesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-whisper">
          Cookie-Hinweise
        </h1>
        <p className="text-shadow mt-2 text-sm">Cookie Policy</p>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-amber">
        <span className="h-1.5 w-1.5 rounded-full bg-amber" />
        In Vorbereitung
      </div>

      <div className="space-y-6 text-whisper">
        <p className="leading-relaxed text-shadow">
          Die öffentliche Marketing-Seite von nobod.ai befindet sich derzeit im
          Wartungs­modus und setzt nur technisch notwendige Cookies (zum
          Beispiel zur Aufrechterhaltung der Sitzung im Dashboard für
          eingeloggte Nutzer).
        </p>

        <p className="leading-relaxed text-shadow">
          Eine vollständige Auflistung aller eingesetzten Cookies und
          Tracking-Technologien gemäß § 25 TDDDG sowie ein
          Consent-Management-Banner werden vor dem nächsten öffentlichen
          Launch bereitgestellt.
        </p>

        <section className="pt-6 border-t border-border">
          <h2 className="text-sm uppercase tracking-wider text-shadow mb-2">
            Fragen
          </h2>
          <p className="leading-relaxed">
            Bei Fragen zu Cookies oder Tracking:{" "}
            <a
              href="mailto:sebastian.dahm@opcore-partners.ch"
              className="text-amber hover:underline"
            >
              sebastian.dahm@opcore-partners.ch
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
