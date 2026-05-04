import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum — nobod.ai",
  robots: { index: false, follow: false },
};

export default function ImpressumPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-whisper">
          Impressum
        </h1>
        <p className="text-shadow mt-2 text-sm">Anbieterkennzeichnung</p>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-amber">
        <span className="h-1.5 w-1.5 rounded-full bg-amber" />
        Vollständige Fassung in Vorbereitung
      </div>

      <div className="space-y-6 text-whisper">
        <section>
          <h2 className="text-sm uppercase tracking-wider text-shadow mb-2">
            Anbieter
          </h2>
          <p className="leading-relaxed">
            OPCORE Partners AG
            <br />
            Zürich, Schweiz
          </p>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wider text-shadow mb-2">
            Kontakt
          </h2>
          <p className="leading-relaxed">
            E-Mail:{" "}
            <a
              href="mailto:sebastian.dahm@opcore-partners.ch"
              className="text-amber hover:underline"
            >
              sebastian.dahm@opcore-partners.ch
            </a>
          </p>
        </section>

        <section className="pt-6 border-t border-border">
          <p className="text-shadow text-sm leading-relaxed">
            Die vollständige Anbieterkennzeichnung gemäß Art. 13 revDSG sowie
            § 5 DDG mit Handelsregistereintrag, UID-Nummer, vertretungs­berechtigten
            Personen und allen weiteren Pflichtangaben wird derzeit
            finalisiert. Für Anfragen vor Veröffentlichung wenden Sie sich bitte
            direkt per E-Mail an die oben genannte Adresse.
          </p>
        </section>
      </div>
    </div>
  );
}
