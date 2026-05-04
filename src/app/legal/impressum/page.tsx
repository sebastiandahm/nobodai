import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum — nobod.ai",
  robots: { index: false, follow: false },
};

export default function ImpressumPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-whisper">
          Impressum
        </h1>
        <p className="text-shadow mt-2 text-sm">
          Anbieterkennzeichnung gemäß Art. 13 revDSG (Schweiz) und § 5 DDG
          (Deutschland)
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-shadow">
          Anbieter
        </h2>
        <div className="text-whisper leading-relaxed">
          <div>OPCORE Partners AG</div>
          <div>Hinterbergstrasse 16</div>
          <div>6312 Steinhausen ZG</div>
          <div>Schweiz</div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-shadow">
          Vertretungsberechtigte
        </h2>
        <div className="text-whisper leading-relaxed">
          <div>Sebastian Dahm, Managing Partner</div>
          <div>Stefan Wetzler, Managing Partner</div>
          <div>Johannes Wollenburg, Managing Partner</div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-shadow">
          Eintragung
        </h2>
        <div className="text-whisper leading-relaxed space-y-1">
          <div>
            Rechtsform: Aktiengesellschaft schweizerischen Rechts
          </div>
          <div>
            Eingetragen im Handelsregister des Kantons Zug seit 19. November
            2024
          </div>
          <div>UID: CHE-252.293.359</div>
          <div>Personen-ID Kanton Zug: 2100-3599</div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-shadow">Kontakt</h2>
        <div className="text-whisper leading-relaxed space-y-1">
          <div>
            E-Mail:{" "}
            <a
              href="mailto:hello@nobod.ai"
              className="text-amber hover:underline"
            >
              hello@nobod.ai
            </a>
          </div>
          <div>Telefon: +41 77 503 19 63</div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-shadow">
          Verantwortlich für den Inhalt
        </h2>
        <div className="text-whisper leading-relaxed">
          <div>
            Verantwortlich gemäß § 18 Abs. 2 Medienstaatsvertrag (MStV):
          </div>
          <div className="mt-1">
            Sebastian Dahm, OPCORE Partners AG, Hinterbergstrasse 16, 6312
            Steinhausen ZG, Schweiz
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-shadow">
          Online-Streitbeilegung
        </h2>
        <p className="text-whisper leading-relaxed">
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber hover:underline"
          >
            https://ec.europa.eu/consumers/odr
          </a>
          . Unsere E-Mail-Adresse finden Sie oben in diesem Impressum.
        </p>
        <p className="text-whisper leading-relaxed">
          Wir sind nicht bereit oder verpflichtet, an
          Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-shadow">
          Haftungshinweise
        </h2>
        <p className="text-shadow leading-relaxed text-sm">
          Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für
          die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
          übernehmen wir jedoch keine Gewähr. Für externe Links auf fremde
          Inhalte sind ausschließlich deren Anbieter verantwortlich. Zum
          Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar. Bei
          Bekanntwerden von Rechtsverletzungen werden wir entsprechende Inhalte
          umgehend entfernen.
        </p>
      </section>

      <section className="pt-6 border-t border-border">
        <p className="text-shadow text-xs">Stand: 04. Mai 2026</p>
      </section>
    </div>
  );
}
