# 📦 Übergabepaket — nobod.ai

> **Zweck:** Vollständige Übergabe der Verantwortung für die nobod.ai-Homepage/App an
> **Michael Witzenleiter**. Dieses Dokument enthält alles, um sofort in die
> Weiterentwicklung einstarten zu können: Architektur, Setup, Zugänge, Deployment
> und offene Punkte.
>
> Stand: 2026-06-26 · Übergeben von: Sebastian Dahm (sebastian.dahm@opcore-partners.ch)

> ## 🚨 ZUERST LESEN: Welche Homepage?
>
> Es existieren **zwei verwandte Projekte** (beide im Vercel-Team „OPCORE
> Geschäftsmodelle", beide via Claude entwickelt):
>
> | | **rinascai-web** (= die LIVE-Homepage) | **nobodai** (Vorgänger) |
> |---|---|---|
> | GitHub-Repo | `sebastiandahm/rinascai-web` (**privat**) | `sebastiandahm/nobodai` |
> | Vercel-Projekt | `rinascai-web` | `nobodai` |
> | Domains | **rinasc.ai**, rinascai.ch/.de/.com (+www) | nobod.ai, www.nobod.ai |
> | Status | **aktive Production** | älterer Stand |
>
> `rinasc.ai` ist ein **Rebranding** von nobod.ai. Wenn Michael „die Homepage"
> übernimmt, ist damit **`rinascai-web` / rinasc.ai** gemeint.
>
> **Einschränkung dieses Dokuments:** Es wurde im `nobodai`-Repo erstellt, weil
> diese Claude-Session **nur** Zugriff auf `sebastiandahm/nobodai` hat. Architektur,
> Stack und Setup sind durch das Rebranding **weitgehend übertragbar**, aber Code,
> Routen und konkrete Env-Werte von `rinascai-web` sind hier **nicht verifiziert**.
> Für ein vollständig verifiziertes Paket bitte eine Claude-Code-Session starten,
> die auf `sebastiandahm/rinascai-web` gescoped ist (siehe Abschnitt 12).

---

## 0. In 15 Minuten startklar (TL;DR)

```bash
# 1. Repo klonen
git clone https://github.com/sebastiandahm/nobodai.git
cd nobodai

# 2. Dependencies
npm install

# 3. Environment-Datei anlegen und ausfüllen (siehe Abschnitt 5)
cp .env.local.example .env.local

# 4. Dev-Server starten
npm run dev
# → http://localhost:3000
```

Voraussetzung: **Node.js ≥ 18**. Danach brauchst du die Zugänge aus
**Abschnitt 7 (Access-Checkliste)** — die muss Sebastian dir in den jeweiligen
Dashboards freigeben.

> ⚠️ **Dein lokaler Ordner `C:\dev\rinascai-web`** gehört zur **Live-Homepage
> rinasc.ai** (Repo `sebastiandahm/rinascai-web`) — nicht zu diesem `nobodai`-Repo.
> Siehe Banner ganz oben. Das hier gezeigte `git clone` betrifft das `nobodai`-Repo;
> für rinasc.ai entsprechend `sebastiandahm/rinascai-web` klonen.

---

## 1. Was ist nobod.ai?

Ein **AI-LinkedIn-Ghostwriter** (SaaS). Der Nutzer durchläuft ein Onboarding, in
dem ein „Voice Profile" (Schreibstil-DNA) erstellt wird. Anschließend generiert
die App automatisch LinkedIn-Post-Entwürfe im Stil des Nutzers, optional mit
KI-generierten Bildern. Der Nutzer gibt Entwürfe frei, bearbeitet oder verwirft
sie. Abrechnung über Stripe-Pläne (free / starter / pro / enterprise).

**Wichtig (rechtlich):** Die App postet **nicht** selbst auf LinkedIn und greift
**nicht** auf LinkedIn-Zugangsdaten zu — Nutzer kopieren freigegebene Posts
manuell. Das ist bewusst so und in den AGB verankert (Abschnitt 6).

---

## 2. Tech-Stack

| Bereich            | Technologie                                             |
|--------------------|---------------------------------------------------------|
| Framework          | **Next.js 14.2** (App Router), React 18, **TypeScript** |
| Styling            | Tailwind CSS 3.4, PostCSS                               |
| Auth + DB + Storage| **Supabase** (Magic-Link-Login, Postgres, Storage)     |
| Text-Generierung   | **Anthropic Claude** (`claude-sonnet-4-20250514`)       |
| Bild-Generierung   | **fal.ai** (Flux Pro / Ideogram v3) + `sharp`           |
| Zahlungen          | **Stripe** (Checkout + Webhook)                        |
| PDF                | `pdf-lib`                                               |
| Hosting + Cron     | **Vercel** (täglicher Cron 05:00 UTC)                  |
| E-Mail (geplant)   | **Resend** (in Datenschutz erwähnt, noch nicht im Code)|

---

## 3. Repository-Struktur

```
nobodai/
├── src/
│   ├── lib/
│   │   └── supabase.ts            # Supabase-Client + TypeScript-Typen (Profile, VoiceProfile, Draft)
│   └── app/                       # Next.js App Router
│       ├── page.tsx               # Landing Page (Marketing, "$5M Agency"-Design)
│       ├── layout.tsx             # Root-Layout, Fonts, Metadata
│       ├── globals.css            # Tailwind + globale Styles
│       ├── onboarding/page.tsx    # 5-Schritt-Onboarding → erzeugt Voice Profile
│       ├── dashboard/page.tsx     # Hauptansicht: Drafts ansehen/freigeben/bearbeiten
│       ├── account/page.tsx       # Konto + Brand Kit (Logo, Farben, Fonts)
│       ├── auth/callback/page.tsx # Magic-Link-Rücksprung
│       ├── legal/                 # Impressum, Datenschutz, AGB, Cookies (+ Layout)
│       ├── _components/
│       │   └── cookie-banner.tsx  # Consent-Banner (localStorage)
│       ├── _archive/              # Alte Landing-Page-Version (*.bak, ignorieren)
│       └── api/                   # API-Routen (siehe Abschnitt 4)
├── supabase/
│   └── migrations/
│       └── 20260416_add_brand_kit.sql
├── scripts/
│   └── seed-brand-kit-sebastian.sql   # Demo-Seed
├── supabase-schema.sql            # Basis-Schema (Tabellen, RLS, Trigger)
├── vercel.json                    # Cron-Konfiguration
├── DEPLOY.md                      # Ursprüngliche Deploy-Anleitung
├── HANDOVER.md                    # ← dieses Dokument
└── .env.local.example             # ENV-Template
```

---

## 4. API-Routen (`src/app/api/`)

| Route                    | Zweck                                                                 |
|--------------------------|-----------------------------------------------------------------------|
| `generate/`              | Generiert Post-Entwürfe für einen Nutzer (Claude).                    |
| `cron/generate/`         | Tägliche Batch-Generierung; per Vercel-Cron getriggert, `CRON_SECRET`-geschützt, mit Retry-Logik. |
| `regenerate/`            | Einzelnen Draft neu schreiben (mit User-Feedback).                    |
| `generate-visual/`       | Bilder via fal.ai — 4 Modi: `quote`, `scene`, `avatar`, `infographic`. Rate-Limit 10 s/User. |
| `generate-image/`        | Bildgenerierung (separate Route).                                     |
| `generate-carousel/`     | Mehrseitige Carousel-Bilder.                                          |
| `upload-image/`          | Eigenes Bild zu einem Draft hochladen (Supabase Storage).            |
| `checkout/`              | Stripe-Checkout-Session für Plan-Upgrade.                            |
| `webhook/`               | Stripe-Webhook: setzt `plan` auf dem Profil nach Zahlung.            |
| `debug/`                 | Diagnose-Route (nicht für Produktion gedacht).                       |

**Architektur-Hinweise:**
- API-Routen sprechen die Anthropic-/Stripe-APIs direkt per `fetch` an (kein SDK-Wrapper).
- Sie nutzen aktuell den **anon key** für DB-Zugriffe. Für sicheren server-seitigen
  Zugriff sollte ein **Supabase Service-Role-Key** eingeführt werden (siehe Roadmap).
- `maxDuration` ist je Route gesetzt (bis 300 s für den Cron).

---

## 5. Lokales Setup & Environment-Variablen

1. `cp .env.local.example .env.local`
2. Werte ausfüllen — Quellen stehen als Kommentar in der Datei. Übersicht:

| Variable                        | Wofür                          | Quelle                                            |
|---------------------------------|--------------------------------|---------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase-Projekt-URL           | Supabase → Settings → API                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Client-Key              | Supabase → Settings → API                         |
| `ANTHROPIC_API_KEY`             | Claude (Text)                  | console.anthropic.com → API Keys                  |
| `FAL_KEY`                       | fal.ai (Bilder)                | fal.ai/dashboard/keys                             |
| `CRON_SECRET`                   | Schützt die Cron-Route         | frei wählbar, identisch in Vercel hinterlegen     |
| `STRIPE_SECRET_KEY`             | Stripe-API                     | dashboard.stripe.com → Developers → API keys      |
| `STRIPE_PRICE_STARTER/PRO/ENTERPRISE` | Plan-Preis-IDs           | Stripe → Products → Pricing                       |

> Die produktiven Werte liegen bereits im **Vercel-Projekt** (Settings →
> Environment Variables). Für lokale Entwicklung am besten eigene Dev-Keys nutzen,
> wo möglich (v. a. Stripe **Test-Mode**).

---

## 6. Datenbank (Supabase)

**Projekt-Ref:** `awmastpeybhlaiqqvace`
**Tabellen** (Details in `supabase-schema.sql`):

- **`profiles`** — erweitert `auth.users`; Plan, Onboarding-Status, Brand-Kit-Spalten.
- **`voice_profiles`** — Schreibstil-DNA (Tonalität, Themen, Beispiel-Posts, generierter System-Prompt).
- **`drafts`** — generierte Posts inkl. Status (`generated/approved/rejected/edited/published`), Bild-URL, Engagement-Metriken.
- **`topics`** — Themen-/Trend-Feed für die Generierung.

**Sicherheit:** Row Level Security ist aktiv — Nutzer sehen nur eigene Daten.
Ein Trigger (`handle_new_user`) legt bei Registrierung automatisch ein Profil an.

**Migrationen / manuelle Schritte:**
- Basis-Schema: `supabase-schema.sql` einmalig im SQL-Editor ausführen.
- Brand-Kit: `supabase/migrations/20260416_add_brand_kit.sql`.
- **Manuell anzulegen:** Storage-Bucket **`brand-assets`** (public = true) — siehe Kommentar in der Migration.
- Auth: Site-URL und Redirect-URLs (`/onboarding`, `/auth/callback`) müssen für Prod-Domain gesetzt sein.

---

## 7. ✅ Access-Checkliste für Michael

> Diese Zugänge muss **Sebastian** (als Owner) in den jeweiligen Dashboards
> freigeben. Michaels Account-/E-Mail-Adresse hier eintragen und abhaken.

**Michael — Kontaktdaten:**
- E-Mail: `michael.witzenleiter@rinascai.com`
- GitHub-Username: `__________________` (noch offen — für die Repo-Einladung nötig)

| # | System              | Was freigeben                                              | Wo                                                                 | Status |
|---|---------------------|------------------------------------------------------------|--------------------------------------------------------------------|--------|
| 1 | **GitHub (Homepage)** | Collaborator (Write/Maintain) zum **privaten** Repo `sebastiandahm/rinascai-web` | GitHub → Repo → Settings → Collaborators                          | ☐ |
| 1b| **GitHub (Vorgänger)** | Optional: Collaborator zu `sebastiandahm/nobodai`        | GitHub → Repo → Settings → Collaborators                            | ☐ |
| 2 | **Vercel**          | Member ins Team „OPCORE Geschäftsmodelle" (`team_0zoR0bec8IM8KWUAaQeCQEqV`); mind. Projekt `rinascai-web` | Vercel → Team → Settings → Members | ☐ |
| 3 | **Supabase**        | Member zur Org `vcrrjratrqnvnfggcyvi` / Projekt `nobodai` (`awmastpeybhlaiqqvace`, eu-west-1) | Supabase → Organization → Team / Members          | ☐ |
| 4 | **Anthropic**       | Zugang zur Console-Org bzw. eigenen API-Key bereitstellen  | console.anthropic.com → Settings → Members                         | ☐ |
| 5 | **fal.ai**          | Team-Zugang oder API-Key teilen                            | fal.ai → Dashboard → Keys/Team                                     | ☐ |
| 6 | **Stripe**          | Als Team-Member einladen (Rolle nach Bedarf)               | dashboard.stripe.com → Settings → Team                             | ☐ |
| 7 | **Domain (nobod.ai)** | DNS-/Registrar-Zugang oder Delegation klären             | beim Domain-Registrar                                              | ☐ |
| 8 | **E-Mail-Aliasse**  | nobod.ai-Mail-Aliasse (aus Impressum/Legal) übergeben      | Mail-Provider                                                      | ☐ |
| 9 | **Resend** (falls genutzt) | Account-Zugang, sobald E-Mail-Versand aktiv         | resend.com                                                         | ☐ |

> **Hinweis:** Ich (Claude Code) kann diese externen Einladungen nicht selbst
> auslösen — sie erfordern Owner-Rechte in den jeweiligen Dashboards. Die obige
> Liste ist als abhakbare Anleitung für Sebastian gedacht.

---

## 8. Deployment (Vercel)

- **Hosting:** Vercel, automatisches Deploy bei Push auf `main` (Production).
  Feature-Branches erzeugen Preview-Deployments.
- **Cron:** `vercel.json` triggert täglich um **05:00 UTC** `POST /api/cron/generate`.
  Die Route prüft `CRON_SECRET`.
- **Environment-Variablen:** im Vercel-Projekt unter Settings → Environment
  Variables (Production / Preview / Development getrennt pflegbar).
- Detaillierte Erst-Einrichtung: siehe `DEPLOY.md`.

**Branch-Strategie (Empfehlung):** Feature-Branches → PR → Review → Merge nach
`main`. `main` ist die Produktions-Quelle.

---

## 9. Rechtliches / Verantwortlicher

Betreiber laut Impressum:

```
OPCORE Partners AG
Hinterbergstrasse 16, 6312 Steinhausen ZG, Schweiz
UID: CHE-252.293.359
Vertretung: Sebastian Dahm, Stefan Wetzler, Johannes Wollenburg (Managing Partners)
```

Legal-Seiten liegen unter `src/app/legal/` (Impressum, Datenschutz nach revDSG/DSGVO,
AGB, Cookies). **Bei Änderungen an Datenverarbeitung/Dienstleistern (z. B. neuer
KI-/E-Mail-Anbieter) müssen Datenschutzerklärung und AGB angepasst werden.**

---

## 10. Roadmap & offene Punkte

Aus `DEPLOY.md` und Code-Stand übernommen — gute Startpunkte für die Weiterentwicklung:

- [ ] **Supabase Service-Role-Key** für sichere server-seitige API-Zugriffe (statt anon key).
- [ ] Echte **Topic-Discovery** via Claude Web Search statt Sample-Topics.
- [ ] **E-Mail-Notifications** für neue Drafts (Resend) — Datenschutz nennt Resend bereits.
- [ ] **LinkedIn-API-Antrag** (für spätere Integrationen).
- [ ] **Stripe** vollständig produktiv schalten (Webhook-Signatur-Verifizierung prüfen!).
- [ ] `api/debug/`-Route vor Produktion entfernen/absichern.
- [ ] `src/app/_archive/` aufräumen (alte Landing-Page-Backups).

> Interne Notizen (`PROGRESS.md`, `BLOCKERS.md`, `DECISIONS.md`) sind per
> `.gitignore` ausgeschlossen — bei Sebastian erfragen, falls vorhanden.

---

## 11. Erste Schritte für Michael (Onboarding-Reihenfolge)

1. Zugänge aus **Abschnitt 7** von Sebastian freigeben lassen.
2. Repo klonen, `.env.local` mit Dev-Keys füllen, `npm run dev` (Abschnitt 0).
3. Supabase-Dashboard ansehen: Tabellen, Auth-Settings, Storage-Bucket.
4. Vercel-Projekt ansehen: ENV-Variablen, letzte Deployments, Cron-Logs.
5. End-to-End lokal testen: Magic-Link-Login → Onboarding → Dashboard → „Posts generieren".
6. Kleinen Test-Branch anlegen und Preview-Deploy auf Vercel verifizieren.

**Bei Fragen:** Sebastian Dahm — sebastian.dahm@opcore-partners.ch

---

## 12. Verifizierte Infrastruktur (Stand 2026-06-26)

Folgende Werte wurden in dieser Session direkt aus Vercel/Supabase ausgelesen:

**Vercel-Team:** „OPCORE Geschäftsmodelle" · `team_0zoR0bec8IM8KWUAaQeCQEqV`
Relevante Projekte im Team:

| Projekt        | Repo                          | Domains                                   | Rolle           |
|----------------|-------------------------------|-------------------------------------------|-----------------|
| `rinascai-web` | `sebastiandahm/rinascai-web` (privat) | rinasc.ai, rinascai.ch/.de/.com (+www) | **Live-Homepage** |
| `nobodai`      | `sebastiandahm/nobodai`       | nobod.ai, www.nobod.ai                    | Vorgänger        |

(Im Team existieren außerdem `opcore-hub` und `fritz-health-check-v2` — nicht Teil dieser Übergabe.)

**Supabase:** Projekt `nobodai` · Ref `awmastpeybhlaiqqvace` · Org `vcrrjratrqnvnfggcyvi`
· Region `eu-west-1` · Postgres 17 · Status ACTIVE_HEALTHY
> Ob `rinascai-web` dieselbe Supabase-Instanz nutzt oder eine eigene, ist in dieser
> Session **nicht verifizierbar** (Repo nicht zugänglich) — in der rinascai-web-Session prüfen.

### Vollständig verifiziertes Paket für rinasc.ai erstellen

Diese Session konnte den `rinascai-web`-Code nicht lesen (GitHub-Scope = nur `nobodai`).
Um ein 1:1 verifiziertes Übergabepaket für die Live-Homepage zu erzeugen:

1. Neue **Claude-Code-Web-Session** starten, **gescoped auf `sebastiandahm/rinascai-web`**.
2. Diesen Prompt geben: *„Erstelle ein Übergabepaket (HANDOVER.md + .env.local.example)
   für die Übernahme dieser Homepage durch Michael Witzenleiter — analog zur
   HANDOVER.md im nobodai-Repo, aber mit dem echten Code/Env/Schema dieses Repos."*
3. Das hier erstellte `HANDOVER.md` als Vorlage/Referenz mitgeben.
