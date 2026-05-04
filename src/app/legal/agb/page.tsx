import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen — nobod.ai",
  robots: { index: false, follow: false },
};

export default function AGBPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-whisper">
          Allgemeine Geschäftsbedingungen
        </h1>
        <p className="text-shadow mt-2 text-sm">
          OPCORE Partners AG für die Plattform nobod.ai
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-amber">
        <span className="h-1.5 w-1.5 rounded-full bg-amber" />
        Entwurf in finaler juristischer Abstimmung — Stand 04. Mai 2026
      </div>

      {/* 1 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          1. Geltungsbereich, Vertragspartner
        </h2>
        <p className="text-whisper leading-relaxed">
          1.1 Diese Allgemeinen Geschäftsbedingungen („AGB") gelten für sämtliche
          Verträge zwischen der OPCORE Partners AG, Hinterbergstrasse 16, 6312
          Steinhausen ZG, Schweiz, eingetragen im Handelsregister des Kantons
          Zug, UID CHE-252.293.359 („Anbieter", „wir") und den Nutzerinnen und
          Nutzern („Nutzer", „Sie") der Plattform{" "}
          <span className="font-medium">nobod.ai</span> einschließlich aller
          zugehörigen Dienste und Schnittstellen („Dienst").
        </p>
        <p className="text-whisper leading-relaxed">
          1.2 Verbraucher im Sinne dieser AGB ist jede natürliche Person, die
          den Vertrag zu Zwecken abschließt, die überwiegend weder ihrer
          gewerblichen noch ihrer selbstständigen beruflichen Tätigkeit
          zugerechnet werden können. Unternehmer ist eine natürliche oder
          juristische Person oder eine rechtsfähige Personengesellschaft, die
          den Vertrag in Ausübung ihrer gewerblichen oder selbstständigen
          beruflichen Tätigkeit abschließt.
        </p>
        <p className="text-whisper leading-relaxed">
          1.3 Abweichende, entgegenstehende oder ergänzende Bedingungen des
          Nutzers werden nicht Vertragsbestandteil, es sei denn, wir haben
          ihrer Geltung ausdrücklich schriftlich zugestimmt.
        </p>
      </section>

      {/* 2 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          2. Vertragsschluss, Account
        </h2>
        <p className="text-whisper leading-relaxed">
          2.1 Die Darstellung des Dienstes auf der Website stellt kein
          rechtlich bindendes Angebot dar, sondern eine Aufforderung zur Abgabe
          eines Angebots. Mit der Registrierung und Bestätigung Ihrer
          E-Mail-Adresse über den zugesandten Magic Link geben Sie ein
          verbindliches Angebot zum Abschluss eines Nutzungsvertrags ab.
        </p>
        <p className="text-whisper leading-relaxed">
          2.2 Der Vertrag kommt mit Freischaltung Ihres Accounts zustande. Bei
          kostenpflichtigen Plänen kommt ein gesonderter
          Subscription-Vertrag mit Abschluss des Bezahlvorgangs über unseren
          Zahlungsdienstleister Stripe zustande.
        </p>
        <p className="text-whisper leading-relaxed">
          2.3 Sie sichern zu, beim Anlegen des Accounts wahrheitsgemäße und
          vollständige Angaben zu machen und diese aktuell zu halten. Die
          Zugangsdaten sind vertraulich zu behandeln und nicht an Dritte
          weiterzugeben. Bei Verdacht auf unbefugte Nutzung sind wir
          unverzüglich zu informieren.
        </p>
        <p className="text-whisper leading-relaxed">
          2.4 Der Dienst richtet sich an Personen, die das 18. Lebensjahr
          vollendet haben und unbeschränkt geschäftsfähig sind.
        </p>
      </section>

      {/* 3 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          3. Leistungen
        </h2>
        <p className="text-whisper leading-relaxed">
          3.1 nobod.ai ist eine KI-gestützte Plattform zur Erstellung,
          Überarbeitung und Verwaltung von LinkedIn-Beiträgen einschließlich
          ergänzender Bildelemente. Die Plattform analysiert
          beispielhafte Inhalte des Nutzers, um daraus ein Stilprofil
          („Voice DNA") abzuleiten und Beitrags-Entwürfe zu generieren.
        </p>
        <p className="text-whisper leading-relaxed">
          3.2 Wir bieten den Dienst in unterschiedlichen Plänen an. Der
          aktuelle Funktionsumfang und die Preise sind auf der Website
          dargestellt. Die zum Zeitpunkt des Vertragsschlusses geltenden
          Angaben werden Vertragsinhalt.
        </p>
        <p className="text-whisper leading-relaxed">
          3.3 Wir übernehmen <span className="italic">keine</span>{" "}
          automatisierte Veröffentlichung von Beiträgen auf LinkedIn oder
          anderen Plattformen. Die Veröffentlichung erfolgt ausschließlich
          durch den Nutzer selbst.
        </p>
        <p className="text-whisper leading-relaxed">
          3.4 Die Plattform wird laufend weiterentwickelt. Wir behalten uns
          vor, einzelne Funktionen zu ändern, zu ersetzen oder einzustellen,
          sofern dies dem Nutzer zumutbar ist und der Hauptzweck des
          Vertrags nicht gefährdet wird. Wesentliche Änderungen kündigen wir
          mit angemessener Frist an.
        </p>
      </section>

      {/* 4 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          4. Preise, Zahlung, Verlängerung
        </h2>
        <p className="text-whisper leading-relaxed">
          4.1 Die Preise verstehen sich gegenüber Verbrauchern als
          Bruttopreise inklusive der jeweils gesetzlichen Mehrwertsteuer.
          Gegenüber Unternehmern verstehen sich die Preise zuzüglich der
          gesetzlichen Mehrwertsteuer. Die Zahlung erfolgt monatlich oder
          jährlich im Voraus über Stripe.
        </p>
        <p className="text-whisper leading-relaxed">
          4.2 Der Free-Plan ist unentgeltlich. Wir behalten uns vor, dessen
          Funktionsumfang anzupassen oder den Free-Plan einzustellen. Eine
          Vergütung ist hierfür nicht geschuldet.
        </p>
        <p className="text-whisper leading-relaxed">
          4.3 Kostenpflichtige Pläne verlängern sich nach Ablauf der jeweils
          gewählten Laufzeit (monatlich bzw. jährlich) automatisch um
          dieselbe Dauer, sofern sie nicht zuvor unter Einhaltung der in
          Ziffer 5 genannten Frist gekündigt werden. Eine Pflicht zur
          Erinnerung an die Verlängerung besteht nicht.
        </p>
        <p className="text-whisper leading-relaxed">
          4.4 Preisänderungen werden dem Nutzer mit einer Frist von
          mindestens 30 Tagen vor Inkrafttreten in Textform mitgeteilt und
          gelten nur für nach Wirksamwerden beginnende
          Verlängerungszeiträume. Der Nutzer kann den Vertrag bis zum
          Wirksamwerden der Änderung außerordentlich zum Wirksamwerden der
          Änderung kündigen.
        </p>
      </section>

      {/* 5 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          5. Laufzeit, Kündigung
        </h2>
        <p className="text-whisper leading-relaxed">
          5.1 Der Free-Plan läuft auf unbestimmte Zeit und kann von beiden
          Seiten jederzeit ohne Frist beendet werden, etwa durch Löschung des
          Accounts.
        </p>
        <p className="text-whisper leading-relaxed">
          5.2 Kostenpflichtige Pläne mit monatlicher Laufzeit können von
          beiden Seiten zum Ende des laufenden Monats gekündigt werden. Pläne
          mit jährlicher Laufzeit können mit einer Frist von einem Monat zum
          Ende der jeweiligen Vertragslaufzeit gekündigt werden. Gegenüber
          Verbrauchern gilt: Die Kündigungsfrist überschreitet in keinem Fall
          einen Monat zum Ende des laufenden Abrechnungszeitraums.
        </p>
        <p className="text-whisper leading-relaxed">
          5.3 Die Kündigung kann jederzeit über die Account-Einstellungen
          oder per E-Mail an{" "}
          <a
            href="mailto:legal@nobod.ai"
            className="text-amber hover:underline"
          >
            legal@nobod.ai
          </a>{" "}
          erfolgen.
        </p>
        <p className="text-whisper leading-relaxed">
          5.4 Das Recht zur außerordentlichen Kündigung aus wichtigem Grund
          bleibt unberührt. Ein wichtiger Grund liegt für uns insbesondere
          bei wiederholten Verstößen gegen Ziffer 7 oder bei
          Zahlungsverzug von mehr als 30 Tagen vor.
        </p>
      </section>

      {/* 6 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          6. Widerrufsrecht für Verbraucher
        </h2>
        <p className="text-whisper leading-relaxed">
          Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Die
          ausführliche Widerrufsbelehrung sowie das Muster-Widerrufsformular
          finden Sie unten in diesen AGB unter Ziffer 16.
        </p>
        <p className="text-whisper leading-relaxed">
          Beim Erwerb eines digitalen Produkts oder einer digitalen Leistung
          erlischt das Widerrufsrecht vorzeitig nur, wenn Sie ausdrücklich
          zugestimmt haben, dass mit der Leistungserbringung vor Ablauf der
          Widerrufsfrist begonnen wird, dies bestätigt haben und Kenntnis
          davon hatten, dass Sie damit Ihr Widerrufsrecht verlieren. Diese
          Zustimmung holen wir, sofern relevant, im Bezahlvorgang ein.
        </p>
      </section>

      {/* 7 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          7. Pflichten und zulässige Nutzung
        </h2>
        <p className="text-whisper leading-relaxed">
          7.1 Der Nutzer verpflichtet sich, den Dienst nicht zu missbrauchen.
          Untersagt ist insbesondere:
        </p>
        <ul className="text-whisper leading-relaxed list-disc pl-6 space-y-1 marker:text-amber">
          <li>
            das Erstellen oder Verbreiten rechtswidriger, irreführender,
            diffamierender, gewaltverherrlichender, diskriminierender,
            jugendgefährdender oder das Persönlichkeitsrecht Dritter
            verletzender Inhalte;
          </li>
          <li>
            das Erstellen von Inhalten, die gegen Urheber-, Marken- oder
            sonstige Schutzrechte Dritter verstoßen;
          </li>
          <li>
            die Imitation realer Personen ohne deren Einwilligung;
          </li>
          <li>
            die Umgehung technischer Schutzmaßnahmen, die automatisierte
            Massenabfrage von Daten oder das Reverse Engineering der
            Plattform;
          </li>
          <li>
            die Nutzung des Dienstes für unaufgeforderte Werbung (Spam) oder
            Verfahren, die der Nutzungsbedingungen von LinkedIn oder anderer
            Drittplattformen widersprechen.
          </li>
        </ul>
        <p className="text-whisper leading-relaxed">
          7.2 Sie sind allein verantwortlich für die Inhalte, die Sie an den
          Dienst übermitteln, sowie für die Veröffentlichung der
          generierten Beiträge. Sie sichern zu, dass übermittelte Inhalte
          frei von Rechten Dritter sind oder dass entsprechende Rechte
          eingeholt wurden.
        </p>
        <p className="text-whisper leading-relaxed">
          7.3 Bei Verstoß gegen Ziffer 7.1 sind wir berechtigt, Inhalte zu
          entfernen, den Account vorübergehend zu sperren oder den Vertrag
          außerordentlich zu kündigen.
        </p>
      </section>

      {/* 8 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          8. Geistiges Eigentum
        </h2>
        <p className="text-whisper leading-relaxed">
          8.1 Sämtliche Rechte an der Plattform, der Software, dem Design und
          den Marken verbleiben bei uns oder unseren Lizenzgebern.
        </p>
        <p className="text-whisper leading-relaxed">
          8.2 Inhalte, die Sie an den Dienst übermitteln („Eingangsinhalte"),
          verbleiben Ihr geistiges Eigentum. Sie räumen uns das einfache,
          weltweite, zeitlich auf die Vertragsdauer beschränkte Recht ein,
          diese Eingangsinhalte zu verarbeiten, soweit dies zur Erbringung
          des Dienstes erforderlich ist. Eine Nutzung Ihrer individuellen
          Inhalte zum Training öffentlicher Modelle Dritter findet nicht
          statt.
        </p>
        <p className="text-whisper leading-relaxed">
          8.3 An den von der Plattform für Sie erzeugten Beiträgen
          („Ausgangsinhalte") räumen wir Ihnen ein einfaches, übertragbares,
          unbefristetes und entgeltfreies Nutzungsrecht ein, soweit
          gesetzlich zulässig. Sie sind berechtigt, diese Ausgangsinhalte
          insbesondere auf LinkedIn unter Ihrem Namen zu veröffentlichen.
        </p>
        <p className="text-whisper leading-relaxed">
          8.4 Wir sind berechtigt, statistisch aggregierte und anonymisierte
          Daten aus der Nutzung des Dienstes zur Verbesserung der
          Plattform zu verwenden.
        </p>
      </section>

      {/* 9 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          9. Hinweise zu KI-Inhalten
        </h2>
        <p className="text-whisper leading-relaxed">
          9.1 Inhalte, die mit Hilfe der Plattform erzeugt werden, sind
          KI-generiert. Wir kennzeichnen solche Inhalte gemäß den Vorgaben
          des EU-AI-Acts (Art. 50 KI-VO) intern entsprechend.
        </p>
        <p className="text-whisper leading-relaxed">
          9.2 Sofern Sie KI-generierte Beiträge öffentlich veröffentlichen,
          sind Sie als Bereitsteller im Sinne des EU-AI-Acts unter Umständen
          verpflichtet, das Publikum auf den KI-Charakter hinzuweisen. Wir
          empfehlen, dies in geeigneter Form zu tun. Eine entsprechende
          Funktion stellen wir innerhalb der Plattform zur Verfügung.
        </p>
        <p className="text-whisper leading-relaxed">
          9.3 KI-Systeme können Fehler enthalten. Sie sind verantwortlich
          dafür, generierte Inhalte vor Veröffentlichung auf Richtigkeit,
          Angemessenheit und rechtliche Zulässigkeit zu prüfen.
        </p>
      </section>

      {/* 10 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          10. Verfügbarkeit
        </h2>
        <p className="text-whisper leading-relaxed">
          10.1 Wir sind bemüht, eine Verfügbarkeit von 99 % im
          Jahresdurchschnitt zu erreichen, gemessen am produktiven Zeitfenster
          und ohne Berücksichtigung angekündigter Wartungsfenster oder
          Ausfälle aufgrund höherer Gewalt oder Störungen bei
          Vorleistern.
        </p>
        <p className="text-whisper leading-relaxed">
          10.2 Wartungs- und Aktualisierungsarbeiten werden, soweit möglich,
          in nutzungsschwachen Zeiten durchgeführt.
        </p>
      </section>

      {/* 11 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">11. Haftung</h2>
        <p className="text-whisper leading-relaxed">
          11.1 Wir haften unbeschränkt bei Vorsatz und grober
          Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit,
          nach dem Produkthaftungsgesetz, soweit dieses anwendbar ist, sowie
          im Rahmen einer übernommenen Garantie.
        </p>
        <p className="text-whisper leading-relaxed">
          11.2 Bei leicht fahrlässiger Verletzung wesentlicher
          Vertragspflichten (Pflichten, deren Erfüllung den Vertrag
          überhaupt erst ermöglicht und auf deren Einhaltung der
          Vertragspartner regelmäßig vertrauen darf) ist unsere Haftung der
          Höhe nach auf den vertragstypischen, vorhersehbaren Schaden
          beschränkt.
        </p>
        <p className="text-whisper leading-relaxed">
          11.3 Im Übrigen ist die Haftung – auch für Erfüllungsgehilfen –
          ausgeschlossen.
        </p>
        <p className="text-whisper leading-relaxed">
          11.4 Die Einschränkungen in Ziffer 11.2 und 11.3 gelten nicht
          gegenüber Verbrauchern, soweit zwingende gesetzliche Vorschriften
          entgegenstehen.
        </p>
        <p className="text-whisper leading-relaxed">
          11.5 Wir haften nicht für die wirtschaftliche Wirkung von
          veröffentlichten Beiträgen oder für die Reaktion Dritter
          (insbesondere von LinkedIn) auf das Veröffentlichungsverhalten der
          Nutzer.
        </p>
      </section>

      {/* 12 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">12. Datenschutz</h2>
        <p className="text-whisper leading-relaxed">
          Hinweise zur Verarbeitung personenbezogener Daten finden Sie in
          unserer{" "}
          <a href="/legal/datenschutz" className="text-amber hover:underline">
            Datenschutzerklärung
          </a>
          .
        </p>
      </section>

      {/* 13 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          13. Änderungen dieser AGB
        </h2>
        <p className="text-whisper leading-relaxed">
          13.1 Wir behalten uns vor, diese AGB anzupassen, sofern dies aus
          rechtlichen, regulatorischen oder sachlichen Gründen erforderlich
          ist und der Nutzer hierdurch nicht entgegen Treu und Glauben
          benachteiligt wird.
        </p>
        <p className="text-whisper leading-relaxed">
          13.2 Die geänderten AGB werden dem Nutzer mindestens sechs Wochen
          vor Inkrafttreten in Textform zugesandt. Widerspricht der Nutzer
          den Änderungen nicht innerhalb von sechs Wochen ab Zugang und
          werden Hinweis und Wirkung des Schweigens deutlich gemacht, gelten
          die geänderten AGB als angenommen. Im Falle eines fristgerechten
          Widerspruchs sind beide Seiten zur Kündigung des Vertrags
          berechtigt.
        </p>
      </section>

      {/* 14 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          14. Schlussbestimmungen
        </h2>
        <p className="text-whisper leading-relaxed">
          14.1 Es gilt schweizerisches Recht unter Ausschluss des
          UN-Kaufrechts. Gegenüber Verbrauchern mit gewöhnlichem Aufenthalt
          in der EU bleibt der Schutz durch zwingende Verbraucher­schutz­vorschriften
          des Aufenthaltsstaates unberührt.
        </p>
        <p className="text-whisper leading-relaxed">
          14.2 Ausschließlicher Gerichtsstand für alle Streitigkeiten aus
          oder im Zusammenhang mit diesem Vertrag ist Zug, Schweiz, sofern
          der Nutzer Unternehmer, juristische Person des öffentlichen Rechts
          oder öffentlich-rechtliches Sondervermögen ist. Gegenüber
          Verbrauchern verbleibt es bei den gesetzlichen Gerichts­ständen,
          insbesondere am Wohnsitz des Verbrauchers.
        </p>
        <p className="text-whisper leading-relaxed">
          14.3 Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder
          werden, bleibt die Wirksamkeit der übrigen Bestimmungen davon
          unberührt. Die unwirksame Bestimmung wird durch eine wirksame
          ersetzt, die dem wirtschaftlichen Zweck der unwirksamen
          Bestimmung am nächsten kommt.
        </p>
      </section>

      {/* 15 */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-whisper">
          15. Online-Streitbeilegung
        </h2>
        <p className="text-whisper leading-relaxed">
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit, abrufbar unter{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber hover:underline"
          >
            https://ec.europa.eu/consumers/odr
          </a>
          . Wir sind nicht bereit oder verpflichtet, an
          Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>

      {/* 16 — Widerrufsbelehrung */}
      <section className="space-y-4 pt-6 border-t border-border">
        <h2 className="font-serif text-2xl text-whisper">
          16. Widerrufsbelehrung für Verbraucher
        </h2>

        <div className="space-y-3">
          <h3 className="font-medium text-whisper">Widerrufsrecht</h3>
          <p className="text-whisper leading-relaxed">
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
            diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn
            Tage ab dem Tag des Vertragsschlusses.
          </p>
          <p className="text-whisper leading-relaxed">
            Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
          </p>
          <div className="text-whisper leading-relaxed pl-4">
            <div>OPCORE Partners AG</div>
            <div>Hinterbergstrasse 16</div>
            <div>6312 Steinhausen ZG, Schweiz</div>
            <div>
              E-Mail:{" "}
              <a
                href="mailto:legal@nobod.ai"
                className="text-amber hover:underline"
              >
                legal@nobod.ai
              </a>
            </div>
          </div>
          <p className="text-whisper leading-relaxed">
            mittels einer eindeutigen Erklärung (z.B. ein mit der Post
            versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen
            Vertrag zu widerrufen, informieren. Sie können dafür das
            untenstehende Muster-Widerrufsformular verwenden, das jedoch
            nicht vorgeschrieben ist. Zur Wahrung der Widerrufsfrist reicht
            es aus, dass Sie die Mitteilung über die Ausübung des
            Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-whisper">Folgen des Widerrufs</h3>
          <p className="text-whisper leading-relaxed">
            Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle
            Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und
            spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an
            dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns
            eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe
            Zahlungsmittel, das Sie bei der ursprünglichen Transaktion
            eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas
            anderes vereinbart; in keinem Fall werden Ihnen wegen dieser
            Rückzahlung Entgelte berechnet.
          </p>
          <p className="text-whisper leading-relaxed">
            Haben Sie verlangt, dass die Dienstleistung während der
            Widerrufsfrist beginnen soll, so haben Sie uns einen
            angemessenen Betrag zu zahlen, der dem Anteil der bis zum
            Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts
            hinsichtlich dieses Vertrags unterrichten, bereits erbrachten
            Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag
            vorgesehenen Dienstleistungen entspricht.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-whisper">
            Vorzeitiges Erlöschen des Widerrufsrechts
          </h3>
          <p className="text-whisper leading-relaxed">
            Bei einem Vertrag über die Bereitstellung digitaler Inhalte oder
            digitaler Dienstleistungen, die nicht auf einem körperlichen
            Datenträger geliefert werden, erlischt Ihr Widerrufsrecht, wenn
            wir mit der Vertragserfüllung begonnen haben, nachdem Sie
            ausdrücklich zugestimmt haben, dass wir mit der
            Vertragserfüllung vor Ablauf der Widerrufsfrist beginnen, und
            Sie Ihre Kenntnis davon bestätigt haben, dass Sie durch Ihre
            Zustimmung mit Beginn der Vertragserfüllung Ihr Widerrufsrecht
            verlieren, und wir Ihnen eine Bestätigung des Vertrags
            bereitgestellt haben.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-whisper">
            Muster-Widerrufsformular
          </h3>
          <p className="text-shadow leading-relaxed text-sm">
            (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte
            dieses Formular aus und senden Sie es zurück.)
          </p>
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-whisper leading-relaxed space-y-2 font-mono">
            <p>
              An OPCORE Partners AG, Hinterbergstrasse 16, 6312 Steinhausen
              ZG, Schweiz, legal@nobod.ai:
            </p>
            <p>
              Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*)
              abgeschlossenen Vertrag über die Erbringung der folgenden
              Dienstleistung (*):
            </p>
            <p>______________________________________________________</p>
            <p>Bestellt am (*) / erhalten am (*): ____________________</p>
            <p>Name des/der Verbraucher(s): _________________________</p>
            <p>Anschrift des/der Verbraucher(s): ____________________</p>
            <p>
              Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf
              Papier): ___________
            </p>
            <p>Datum: ____________</p>
            <p className="text-shadow text-xs">
              (*) Unzutreffendes streichen.
            </p>
          </div>
        </div>
      </section>

      <section className="pt-6 border-t border-border">
        <p className="text-shadow text-xs">Stand: 04. Mai 2026</p>
      </section>
    </div>
  );
}
