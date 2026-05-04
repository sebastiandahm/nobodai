import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — nobod.ai",
  robots: { index: false, follow: false },
};

export default function DatenschutzPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-whisper">
          Datenschutzerklärung
        </h1>
        <p className="text-shadow mt-2 text-sm">
          Information gemäß Art. 13 EU-DSGVO und Art. 19 ff. revDSG (Schweiz)
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">1. Verantwortlicher</h2>
        <p className="text-whisper leading-relaxed">
          OPCORE Partners AG, Hinterbergstrasse 16, 6312 Steinhausen ZG,
          Schweiz, UID CHE-252.293.359 (nachfolgend „wir" oder „nobod.ai").
        </p>
        <p className="text-whisper leading-relaxed">
          Bei Fragen zum Datenschutz erreichen Sie uns per E-Mail unter{" "}
          <a
            href="mailto:sebastian.dahm@opcore-partners.ch"
            className="text-amber hover:underline"
          >
            sebastian.dahm@opcore-partners.ch
          </a>
          .
        </p>
        <p className="text-shadow leading-relaxed text-sm">
          Eine offizielle Datenschutzbeauftragte oder ein
          Datenschutzbeauftragter ist nach den derzeit geltenden Schwellenwerten
          weder nach Art. 37 DSGVO noch nach Art. 10 revDSG zu benennen.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          2. Geltungsbereich
        </h2>
        <p className="text-whisper leading-relaxed">
          Diese Datenschutzerklärung gilt für die Verarbeitung
          personenbezogener Daten im Rahmen der Nutzung der Website{" "}
          <span className="text-whisper">nobod.ai</span> sowie der über die
          Plattform angebotenen Dienste (insbesondere Authentifizierung, Voice
          DNA-Analyse, KI-gestützte Erstellung von Beiträgen, Bildgenerierung
          und Zahlungsabwicklung).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          3. Verarbeitete Kategorien von Daten
        </h2>
        <ul className="text-whisper leading-relaxed list-disc pl-6 space-y-2 marker:text-amber">
          <li>
            <span className="font-medium">Stammdaten:</span> E-Mail-Adresse,
            angezeigter Name, ggf. Beruf/Titel, Sprache.
          </li>
          <li>
            <span className="font-medium">Inhaltsdaten:</span> von Ihnen
            bereitgestellte Beispiel-Beiträge, Antworten im Onboarding,
            generierte Entwürfe, Bewertungen und Freigaben.
          </li>
          <li>
            <span className="font-medium">Voice-DNA-Profil:</span> aus Ihren
            Inhalten abgeleitete Stilmerkmale, Wortwahl, Argumentationsmuster.
          </li>
          <li>
            <span className="font-medium">Zahlungsdaten:</span> bei zahlenden
            Kundinnen und Kunden Rechnungs- und Zahlungsangaben über unseren
            Zahlungsdienstleister Stripe; Kartendaten verarbeiten wir nicht
            selbst.
          </li>
          <li>
            <span className="font-medium">Nutzungs- und Logdaten:</span>
            IP-Adresse (gekürzt soweit möglich), Zeitstempel, User-Agent,
            angeforderte Ressourcen, Fehlerprotokolle.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          4. Zwecke und Rechtsgrundlagen
        </h2>
        <div className="text-whisper leading-relaxed space-y-3">
          <p>
            <span className="font-medium">a) Vertragserfüllung</span> (Art. 6
            Abs. 1 lit. b DSGVO; Art. 31 Abs. 2 lit. a revDSG): Bereitstellung
            des Dienstes, Authentifizierung per Magic Link, Erstellung von
            Beiträgen, Speicherung Ihrer Inhalte, Abrechnung kostenpflichtiger
            Pläne.
          </p>
          <p>
            <span className="font-medium">b) Berechtigtes Interesse</span>{" "}
            (Art. 6 Abs. 1 lit. f DSGVO; Art. 31 Abs. 2 lit. d revDSG):
            Sicherstellung des Betriebs, Missbrauchsabwehr, Fehlersuche,
            Verbesserung der Modellqualität durch aggregierte und – soweit
            technisch sinnvoll – pseudonymisierte Auswertung. Wir nutzen Ihre
            individuellen Inhalte nicht zum Training öffentlicher Modelle
            Dritter.
          </p>
          <p>
            <span className="font-medium">c) Einwilligung</span> (Art. 6 Abs. 1
            lit. a DSGVO; Art. 31 Abs. 1 revDSG): nur für optionale Cookies und
            ggf. weitere optionale Funktionen; jederzeit widerrufbar mit
            Wirkung für die Zukunft.
          </p>
          <p>
            <span className="font-medium">d) Rechtliche Verpflichtungen</span>{" "}
            (Art. 6 Abs. 1 lit. c DSGVO): insbesondere
            steuer- und handelsrechtliche Aufbewahrungspflichten (z.B. 10 Jahre
            für Buchungsbelege).
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          5. Empfänger und Auftragsverarbeitung
        </h2>
        <p className="text-whisper leading-relaxed">
          Wir setzen sorgfältig ausgewählte Auftragsverarbeiter ein. Mit allen
          Anbietern bestehen Auftragsverarbeitungsverträge nach Art. 28 DSGVO.
          Datentransfers in Drittländer (USA) erfolgen auf Grundlage des
          EU-U.S. Data Privacy Framework (DPF) und/oder der EU-Standard­vertrags­klauseln.
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-sm border border-border">
            <thead className="bg-card">
              <tr className="text-left">
                <th className="px-3 py-2 border-b border-border font-medium">
                  Anbieter
                </th>
                <th className="px-3 py-2 border-b border-border font-medium">
                  Zweck
                </th>
                <th className="px-3 py-2 border-b border-border font-medium">
                  Sitz / Datenlage
                </th>
                <th className="px-3 py-2 border-b border-border font-medium">
                  Garantie
                </th>
              </tr>
            </thead>
            <tbody className="text-shadow">
              <tr>
                <td className="px-3 py-2 border-b border-border">
                  Supabase Inc.
                </td>
                <td className="px-3 py-2 border-b border-border">
                  Authentifizierung, Datenbank, Datei-Speicherung
                </td>
                <td className="px-3 py-2 border-b border-border">USA</td>
                <td className="px-3 py-2 border-b border-border">
                  AVV, SCC, DPF
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border-b border-border">
                  Vercel Inc.
                </td>
                <td className="px-3 py-2 border-b border-border">
                  Hosting, Edge-Auslieferung, Logs
                </td>
                <td className="px-3 py-2 border-b border-border">USA</td>
                <td className="px-3 py-2 border-b border-border">
                  AVV, SCC, DPF
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border-b border-border">
                  Anthropic PBC
                </td>
                <td className="px-3 py-2 border-b border-border">
                  KI-Generierung von Texten (Claude API)
                </td>
                <td className="px-3 py-2 border-b border-border">USA</td>
                <td className="px-3 py-2 border-b border-border">
                  AVV, SCC, DPF; keine Trainingsnutzung
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border-b border-border">
                  Featherless AI Inc. (fal.ai)
                </td>
                <td className="px-3 py-2 border-b border-border">
                  KI-Bildgenerierung
                </td>
                <td className="px-3 py-2 border-b border-border">USA</td>
                <td className="px-3 py-2 border-b border-border">AVV, SCC</td>
              </tr>
              <tr>
                <td className="px-3 py-2 border-b border-border">
                  Resend, Inc.
                </td>
                <td className="px-3 py-2 border-b border-border">
                  Versand der Magic-Link-Anmelde-E-Mails
                </td>
                <td className="px-3 py-2 border-b border-border">USA</td>
                <td className="px-3 py-2 border-b border-border">AVV, SCC</td>
              </tr>
              <tr>
                <td className="px-3 py-2 border-b border-border">
                  Stripe Payments Europe Ltd. / Stripe Inc.
                </td>
                <td className="px-3 py-2 border-b border-border">
                  Zahlungsabwicklung, Rechnungsstellung
                </td>
                <td className="px-3 py-2 border-b border-border">
                  EU (IE) / USA
                </td>
                <td className="px-3 py-2 border-b border-border">
                  AVV, SCC, DPF
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">GitHub, Inc. (Microsoft)</td>
                <td className="px-3 py-2">
                  Quellcode-Verwaltung; keine Endnutzerdaten
                </td>
                <td className="px-3 py-2">USA</td>
                <td className="px-3 py-2">AVV, SCC, DPF</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-shadow leading-relaxed text-sm pt-2">
          LinkedIn-Inhalte (z.B. eigene Beiträge) verarbeiten wir nur, soweit
          Sie diese ausdrücklich an nobod.ai übermitteln. Eine eigenständige
          Erhebung von LinkedIn-Daten durch uns findet nicht statt. Das
          Veröffentlichen erfolgt durch Sie selbst auf LinkedIn; wir
          übernehmen keine automatisierte Veröffentlichung.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          6. Speicherdauer
        </h2>
        <ul className="text-whisper leading-relaxed list-disc pl-6 space-y-2 marker:text-amber">
          <li>
            Account- und Inhaltsdaten: für die Dauer Ihres aktiven Accounts.
            Nach Account-Löschung erfolgt Löschung innerhalb von 30 Tagen,
            sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
          </li>
          <li>
            Rechnungs- und Zahlungsdaten: bis zu 10 Jahre gemäß den
            handels- und steuerrechtlichen Pflichten in der Schweiz und in der
            EU.
          </li>
          <li>
            Server-Logs: in der Regel maximal 30 Tage, anschließend Löschung
            oder Aggregation.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          7. Cookies und vergleichbare Technologien
        </h2>
        <p className="text-whisper leading-relaxed">
          Wir verwenden derzeit nur technisch notwendige Cookies (Login- und
          Sitzungs-Cookies). Optionale Cookies setzen wir nur nach Ihrer
          Einwilligung gemäß § 25 TDDDG. Details und Steuerung in unseren{" "}
          <a href="/legal/cookies" className="text-amber hover:underline">
            Cookie-Hinweisen
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          8. Automatisierte Entscheidungen, Profiling
        </h2>
        <p className="text-whisper leading-relaxed">
          Bei der Erstellung Ihrer Beiträge werten wir Ihren Stil aus und
          erstellen ein „Voice DNA"-Profil. Hierbei handelt es sich um ein
          Profiling im Sinne von Art. 4 Nr. 4 DSGVO. Eine ausschließlich
          automatisierte Entscheidung mit rechtlicher oder ähnlich
          erheblicher Wirkung gegenüber Ihnen (Art. 22 DSGVO) findet nicht
          statt; Sie entscheiden über Veröffentlichung und Verwendung der
          Inhalte selbst.
        </p>
        <p className="text-whisper leading-relaxed">
          Wir kennzeichnen KI-generierte Inhalte transparent gemäß den
          Vorgaben des EU-AI-Acts (Art. 50 KI-VO). Beim Veröffentlichen auf
          LinkedIn empfehlen wir Ihnen, diese Kennzeichnung dem dortigen
          Publikum gegenüber zu wahren.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">9. Ihre Rechte</h2>
        <p className="text-whisper leading-relaxed">
          Soweit Ihre personenbezogenen Daten verarbeitet werden, haben Sie
          die folgenden Rechte:
        </p>
        <ul className="text-whisper leading-relaxed list-disc pl-6 space-y-1 marker:text-amber">
          <li>Auskunft (Art. 15 DSGVO; Art. 25 revDSG)</li>
          <li>Berichtigung (Art. 16 DSGVO; Art. 32 revDSG)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO; Art. 28 revDSG)</li>
          <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          <li>
            Widerruf einer erteilten Einwilligung (Art. 7 Abs. 3 DSGVO) mit
            Wirkung für die Zukunft
          </li>
        </ul>
        <p className="text-whisper leading-relaxed">
          Anfragen richten Sie bitte per E-Mail an die oben genannte Adresse.
          Wir antworten innerhalb der gesetzlichen Fristen, in der Regel
          innerhalb von 30 Tagen.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          10. Beschwerderecht
        </h2>
        <p className="text-whisper leading-relaxed">
          Unbeschadet anderer Rechtsbehelfe steht Ihnen ein Beschwerderecht
          bei einer Datenschutzaufsichtsbehörde zu, insbesondere
        </p>
        <ul className="text-whisper leading-relaxed list-disc pl-6 space-y-1 marker:text-amber">
          <li>
            in der Schweiz: Eidgenössischer Datenschutz- und
            Öffentlichkeitsbeauftragter (EDÖB), Feldeggweg 1, 3003 Bern.
          </li>
          <li>
            in der Europäischen Union: bei der zuständigen Aufsichtsbehörde
            Ihres üblichen Aufenthaltsorts, Arbeitsplatzes oder Orts des
            mutmaßlichen Verstoßes.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          11. Sicherheit
        </h2>
        <p className="text-whisper leading-relaxed">
          Wir setzen technische und organisatorische Maßnahmen nach dem Stand
          der Technik ein, insbesondere Transport-Verschlüsselung (TLS),
          Zugriffsbeschränkungen, Logging, Schlüsselverwaltung und
          regelmäßige Sicherheitsprüfungen.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          12. Änderungen dieser Erklärung
        </h2>
        <p className="text-whisper leading-relaxed">
          Wir passen diese Datenschutzerklärung bei wesentlichen Änderungen
          unseres Dienstes oder der rechtlichen Rahmenbedingungen an. Die
          jeweils aktuelle Fassung ist unter dieser Adresse abrufbar.
        </p>
      </section>

      <section className="pt-6 border-t border-border">
        <p className="text-shadow text-xs">Stand: 04. Mai 2026</p>
      </section>
    </div>
  );
}
