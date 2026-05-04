import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie-Hinweise — nobod.ai",
  robots: { index: false, follow: false },
};

export default function CookiesPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-whisper">
          Cookie-Hinweise
        </h1>
        <p className="text-shadow mt-2 text-sm">
          Information gemäß § 25 TDDDG und Art. 6 Abs. 1 DSGVO
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">1. Was sind Cookies</h2>
        <p className="text-whisper leading-relaxed">
          Cookies sind kleine Textdateien, die Ihr Browser auf Ihrem Endgerät
          speichert. Wir verwenden ergänzend ähnliche Technologien wie
          Local-Storage. Diese Hinweise gelten für beides gleichermaßen.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          2. Einsatz auf nobod.ai
        </h2>
        <p className="text-whisper leading-relaxed">
          Wir setzen ausschließlich Cookies und Speichertechnologien ein, die
          für den Betrieb des Dienstes technisch erforderlich sind. Cookies für
          Analyse oder Marketing sind derzeit nicht im Einsatz. Sollten wir
          solche Technologien zukünftig einsetzen, holen wir vorher Ihre
          Einwilligung über unseren Consent-Banner ein.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          3. Übersicht der eingesetzten Technologien
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border">
            <thead className="bg-card">
              <tr className="text-left">
                <th className="px-3 py-2 border-b border-border font-medium">
                  Name
                </th>
                <th className="px-3 py-2 border-b border-border font-medium">
                  Anbieter
                </th>
                <th className="px-3 py-2 border-b border-border font-medium">
                  Zweck
                </th>
                <th className="px-3 py-2 border-b border-border font-medium">
                  Typ / Dauer
                </th>
                <th className="px-3 py-2 border-b border-border font-medium">
                  Kategorie
                </th>
              </tr>
            </thead>
            <tbody className="text-shadow">
              <tr>
                <td className="px-3 py-2 border-b border-border">
                  sb-access-token, sb-refresh-token
                </td>
                <td className="px-3 py-2 border-b border-border">
                  Supabase / nobod.ai
                </td>
                <td className="px-3 py-2 border-b border-border">
                  Aufrechterhaltung der Login-Sitzung
                </td>
                <td className="px-3 py-2 border-b border-border">
                  HTTP-Cookie / Sitzung bzw. bis Logout
                </td>
                <td className="px-3 py-2 border-b border-border">
                  Technisch notwendig
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border-b border-border">
                  nobodai_cookie_consent_v1
                </td>
                <td className="px-3 py-2 border-b border-border">nobod.ai</td>
                <td className="px-3 py-2 border-b border-border">
                  Speicherung Ihrer Cookie-Einstellungen
                </td>
                <td className="px-3 py-2 border-b border-border">
                  Local-Storage / 12 Monate
                </td>
                <td className="px-3 py-2 border-b border-border">
                  Technisch notwendig
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">__stripe_mid, __stripe_sid</td>
                <td className="px-3 py-2">Stripe</td>
                <td className="px-3 py-2">
                  Betrugsprävention im Bezahlvorgang (nur beim Checkout aktiv)
                </td>
                <td className="px-3 py-2">HTTP-Cookie / bis 12 Monate</td>
                <td className="px-3 py-2">Technisch notwendig</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-shadow leading-relaxed text-sm pt-2">
          Die genannten Cookies dienen dem Funktionieren des Dienstes und
          fallen unter § 25 Abs. 2 TDDDG. Sie werden ohne Einwilligung
          gesetzt, da sie unbedingt erforderlich sind. Stripe-Cookies werden
          nur auf den Bezahlseiten geladen.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          4. Verwaltung Ihrer Einstellungen
        </h2>
        <p className="text-whisper leading-relaxed">
          Sobald optionale Cookies eingesetzt werden, blendet unser
          Consent-Banner eine Auswahlmöglichkeit ein. Sie können Ihre Auswahl
          jederzeit anpassen, indem Sie die im Banner gespeicherte
          Einstellung über Ihren Browser oder durch Löschen des Eintrags{" "}
          <span className="font-mono text-xs bg-card px-1 py-0.5 rounded">
            nobodai_cookie_consent_v1
          </span>{" "}
          im Local-Storage zurücksetzen. Beim nächsten Aufruf erscheint dann
          erneut der Banner.
        </p>
        <p className="text-whisper leading-relaxed">
          Zusätzlich können Sie Cookies über die Einstellungen Ihres Browsers
          steuern oder vollständig blockieren. Beachten Sie, dass dies die
          Funktion des Dienstes einschränken kann.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">5. Weitere Hinweise</h2>
        <p className="text-whisper leading-relaxed">
          Allgemeine Informationen zur Verarbeitung Ihrer Daten finden Sie in
          unserer{" "}
          <a href="/legal/datenschutz" className="text-amber hover:underline">
            Datenschutzerklärung
          </a>
          .
        </p>
      </section>

      <section className="pt-6 border-t border-border">
        <p className="text-shadow text-xs">Stand: 04. Mai 2026</p>
      </section>
    </div>
  );
}
