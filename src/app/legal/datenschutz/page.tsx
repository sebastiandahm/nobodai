import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — nobod.ai",
  robots: { index: false, follow: false },
};

export default function DatenschutzPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-whisper">
          Datenschutzerklärung
        </h1>
        <p className="text-shadow mt-2 text-sm">Privacy Policy</p>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-amber">
        <span className="h-1.5 w-1.5 rounded-full bg-amber" />
        Vollständige Fassung in Vorbereitung
      </div>

      <div className="space-y-6 text-whisper">
        <section>
          <h2 className="text-sm uppercase tracking-wider text-shadow mb-2">
            Verantwortlicher
          </h2>
          <p className="leading-relaxed">
            OPCORE Partners AG, Zürich, Schweiz
            <br />
            E-Mail:{" "}
            <a
              href="mailto:sebastian.dahm@opcore-partners.ch"
              className="text-amber hover:underline"
            >
              sebastian.dahm@opcore-partners.ch
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wider text-shadow mb-2">
            Status
          </h2>
          <p className="leading-relaxed text-shadow">
            nobod.ai befindet sich derzeit im Wartungsmodus. Die
            vollständige Datenschutzerklärung gemäß Art. 13 DSGVO und Art. 19
            revDSG – einschließlich Angaben zu Verarbeitungs­zwecken,
            Rechts­grundlagen, Auftrags­verarbeitern, Drittland­transfers,
            Speicher­fristen sowie Betroffenen­rechten – wird vor dem nächsten
            öffentlichen Launch bereitgestellt.
          </p>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wider text-shadow mb-2">
            Ihre Rechte
          </h2>
          <p className="leading-relaxed">
            Bestehende Nutzer können jederzeit Auskunft, Berichtigung oder
            Löschung ihrer Daten verlangen. Anfragen bitte per E-Mail an die
            oben genannte Adresse. Wir antworten innerhalb der gesetzlichen
            Fristen (in der Regel 30 Tage).
          </p>
        </section>

        <section className="pt-6 border-t border-border">
          <p className="text-shadow text-sm leading-relaxed">
            Beschwerden können an die zuständige Aufsichts­behörde gerichtet
            werden – in der Schweiz an den Eidgenössischen Datenschutz- und
            Öffentlichkeitsbeauftragten (EDÖB), in der EU an die jeweilige
            nationale Datenschutz­behörde des Wohn­sitz­landes.
          </p>
        </section>
      </div>
    </div>
  );
}
