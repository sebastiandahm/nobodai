import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB — nobod.ai",
  robots: { index: false, follow: false },
};

export default function AGBPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-whisper">
          Allgemeine Geschäftsbedingungen
        </h1>
        <p className="text-shadow mt-2 text-sm">Terms of Service</p>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-amber">
        <span className="h-1.5 w-1.5 rounded-full bg-amber" />
        In Vorbereitung
      </div>

      <div className="space-y-6 text-whisper">
        <p className="leading-relaxed text-shadow">
          nobod.ai befindet sich derzeit im Wartungs­modus. Während dieser
          Phase werden keine neuen kosten­pflichtigen Verträge abgeschlossen.
          Für Bestands­kunden gelten die im Rahmen der jeweiligen
          Vertragsabschluss­zeit kommunizierten Bedingungen unverändert weiter.
        </p>

        <p className="leading-relaxed text-shadow">
          Die finalen Allgemeinen Geschäftsbedingungen werden vor dem nächsten
          öffentlichen Launch und vor Aktivierung kosten­pflichtiger
          Abonnements veröffentlicht.
        </p>

        <section className="pt-6 border-t border-border">
          <h2 className="text-sm uppercase tracking-wider text-shadow mb-2">
            Kontakt
          </h2>
          <p className="leading-relaxed">
            Für Vertragsfragen:{" "}
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
