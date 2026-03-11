# 🚀 nobod.ai — Deploy Guide

## Schritt 1: Supabase Schema aufsetzen (2 Min)

1. Geh zu **Supabase Dashboard** → Dein Projekt → **SQL Editor** (links im Menü)
2. Klick **"New Query"**
3. Kopiere den gesamten Inhalt von `supabase-schema.sql` rein
4. Klick **"Run"** (grüner Button)
5. Du solltest sehen: "Success. No rows returned" — das ist korrekt

### Auth konfigurieren:
1. Geh zu **Authentication** → **URL Configuration**
2. Setze **Site URL** auf: `http://localhost:3000` (für Dev) bzw. deine Vercel-URL später
3. Unter **Redirect URLs** füge hinzu: `http://localhost:3000/onboarding`

---

## Schritt 2: Lokal starten (5 Min)

```bash
# 1. In den Projektordner gehen
cd nobodai

# 2. Dependencies installieren
npm install

# 3. .env.local prüfen — Supabase Keys sind schon drin
# Füge deinen Anthropic API Key hinzu:
# ANTHROPIC_API_KEY=sk-ant-...

# 4. Dev Server starten
npm run dev
```

Öffne http://localhost:3000 — du solltest die nobod.ai Landing Page sehen.

---

## Schritt 3: Auf Vercel deployen (3 Min)

### Option A: Via GitHub (empfohlen)
1. Erstelle ein neues GitHub Repo: `nobodai`
2. Pushe den Code:
```bash
git init
git add .
git commit -m "nobod.ai MVP"
git remote add origin https://github.com/DEIN-USERNAME/nobodai.git
git push -u origin main
```
3. Geh zu **vercel.com** → "Add New Project" → Importiere das GitHub Repo
4. Unter **Environment Variables** füge hinzu:
   - `NEXT_PUBLIC_SUPABASE_URL` = https://awmastpeybhlaiqqvace.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = eyJhbG...  (dein Anon Key)
   - `ANTHROPIC_API_KEY` = sk-ant-... (dein Claude API Key)
5. Klick "Deploy"

### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
# Environment Variables im Vercel Dashboard setzen
```

---

## Schritt 4: Domain verbinden

1. In Vercel: **Settings** → **Domains** → füge `nobod.ai` hinzu
2. Bei deinem Domain-Registrar: Setze die DNS-Records wie Vercel anzeigt
3. In Supabase: **Authentication** → **URL Configuration** → Site URL auf `https://nobod.ai` ändern
4. Redirect URLs: `https://nobod.ai/onboarding` hinzufügen

---

## Schritt 5: Testen

1. Geh auf deine Live-URL
2. Gib deine E-Mail ein → Magic Link kommt
3. Durchlaufe das Onboarding (5 Schritte)
4. Im Dashboard: "Neue Posts generieren" klicken
5. Drafts erscheinen → Freigeben / Bearbeiten / Ablehnen

---

## Nächste Schritte (Woche 2)

- [ ] Anthropic API Key in Vercel Environment Variables eintragen
- [ ] Supabase Service Role Key für API Route (für server-side Zugriff)
- [ ] Echte Topic-Discovery via Claude Web Search statt Sample-Topics
- [ ] Bildgenerierung via Flux API
- [ ] E-Mail Notifications für neue Drafts (via Resend)
- [ ] LinkedIn API Antrag einreichen
- [ ] Stripe Integration für Payments
