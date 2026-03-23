import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

async function claude(system: string, user: string, maxTokens?: number): Promise<string> {
  var res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens || 2000,
      system: system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    var err = await res.text();
    throw new Error("Claude error " + res.status + ": " + err.substring(0, 200));
  }
  var data = await res.json();
  var text = "";
  if (data.content && data.content.length > 0 && data.content[0].type === "text") {
    text = data.content[0].text;
  }
  if (!text || text.trim().length < 10) {
    throw new Error("Claude returned empty or too-short response");
  }
  return text;
}

// ============================================================
// VOICE DNA BUILDER — the heart of what makes nobod.ai unique
// ============================================================
function buildVoiceDNA(voice: any, profile: any, approvedPosts: any[]): string {
  var expertise = "General Business";
  if (voice.expertise_topics && Array.isArray(voice.expertise_topics) && voice.expertise_topics.length > 0) {
    expertise = voice.expertise_topics.join(", ");
  }

  // Nuanced tone mapping from sliders
  var f = voice.tone_formality || 0.5;
  var h = voice.tone_humor || 0.3;
  var p = voice.tone_provocation || 0.5;

  var toneProfile = "";
  if (f >= 0.7) toneProfile = "Du-Form ist OK aber der Ton ist serioes und kompetent. Keine Slang-Ausdruecke. Fachsprache wenn passend.";
  else if (f >= 0.4) toneProfile = "Professionell aber menschlich. Wie ein kluger Kollege beim Mittagessen - fundiert aber nicht steif. Gelegentlich ein Anglizismus.";
  else toneProfile = "Locker, direkt, fast wie eine WhatsApp-Nachricht an einen Geschaeftsfreund. Kurze Saetze. Umgangssprache OK. Fragments erlaubt.";

  if (h >= 0.7) toneProfile += " Humor ist ein zentrales Stilmittel - Selbstironie, unerwartete Vergleiche, Pointen. Darf auch mal absurd sein.";
  else if (h >= 0.4) toneProfile += " Gelegentlich ein trockener Kommentar oder eine humorvolle Beobachtung, aber Substanz geht vor.";
  else toneProfile += " Sachlich und ernst. Humor nur wenn er den Punkt verstaerkt, nie als Selbstzweck.";

  if (p >= 0.7) toneProfile += " Polarisierend! Klare Kante zeigen. 'Unpopular Opinion'-Stil. Widerspreche dem Mainstream. Provoziere Widerspruch.";
  else if (p >= 0.4) toneProfile += " Eigene Meinung klar vertreten, aber nicht krawall-maessig. Argumentativ stark, fair gegenueber Andersdenkenden.";
  else toneProfile += " Diplomatisch. Verschiedene Perspektiven anerkennen bevor du deine Position einnimmst. Nie angreifend.";

  // Goal-specific writing guidance
  var goals = "";
  if (voice.goals && Array.isArray(voice.goals)) {
    var goalMap: Record<string, string> = {
      "thought_leadership": "ZIEL Thought Leadership: Teile Insights die andere nicht haben. Positioniere dich als jemand der Trends FRUEHER sieht als andere.",
      "lead_generation": "ZIEL Lead Generation: Demonstriere Expertise die zum Kontakt fuehrt. Jeder Post muss implizit zeigen: 'Mit mir zu arbeiten loest dieses Problem.'",
      "networking": "ZIEL Networking: Schreibe Posts die Gespraeche starten. Stelle echte Fragen. Zeige Interesse an anderen Perspektiven.",
      "recruiting": "ZIEL Recruiting: Zeige Unternehmenskultur und spannende Projekte. Mach Lust darauf, Teil des Teams zu sein.",
      "personal_brand": "ZIEL Personal Brand: Baue eine unverwechselbare Stimme auf. Jeder Post muss sich anfuehlen wie NUR du ihn geschrieben haben koenntest."
    };
    var goalDescs: string[] = [];
    for (var i = 0; i < voice.goals.length; i++) {
      if (goalMap[voice.goals[i]]) goalDescs.push(goalMap[voice.goals[i]]);
    }
    if (goalDescs.length > 0) goals = "\n\n" + goalDescs.join("\n");
  }

  // Learn from approved posts (the MOST important signal)
  var learningSection = "";
  if (approvedPosts.length > 0) {
    learningSection = "\n\n=== GELERNT AUS FREIGEGEBENEN POSTS (WICHTIGSTE SEKTION!) ===\n";
    learningSection += "Der Nutzer hat " + approvedPosts.length + " Posts freigegeben. Diese definieren den EXAKTEN Stil den du imitieren musst.\n";
    learningSection += "Analysiere BEVOR du schreibst: Satzlaenge, Wortwahl, Struktur, Hook-Stil, Hashtag-Anzahl, Absatzlaenge, ob Emojis genutzt werden, ob Fragen gestellt werden, ob Aufzaehlungen vorkommen.\n\n";
    for (var j = 0; j < Math.min(approvedPosts.length, 5); j++) {
      var postText = approvedPosts[j].revised_text || approvedPosts[j].draft_text;
      if (postText) {
        learningSection += '--- FREIGEGEBENER POST ' + (j + 1) + ' ---\n' + postText.substring(0, 800) + '\n---\n\n';
      }
    }
  }

  // Example posts from onboarding
  var exampleSection = "";
  if (voice.example_posts && Array.isArray(voice.example_posts) && voice.example_posts.length > 0) {
    exampleSection = "\n\n=== EIGENE BEISPIEL-POSTS DES NUTZERS (GOLD-STANDARD) ===\n";
    exampleSection += "Jeder neue Post MUSS sich anfuehlen als kaeme er vom selben Autor:\n\n";
    for (var k = 0; k < Math.min(voice.example_posts.length, 3); k++) {
      exampleSection += '--- BEISPIEL ' + (k + 1) + ' ---\n' + voice.example_posts[k] + '\n---\n\n';
    }
  }

  // Voice DNA from deep analysis
  var dnaSection = "";
  if (voice.voice_dna) {
    dnaSection = "\n\n=== VOICE DNA (Deep-Analysis des Schreibstils) ===\n" + voice.voice_dna + "\n";
  }

  var lang = voice.language === "en" ? "English" : "Deutsch";
  var authorName = profile?.full_name || "der Nutzer";
  var company = profile?.company ? " bei " + profile.company : "";

  return "Du bist NICHT ein KI-Assistent. Du BIST " + authorName + company + "." +
    " Du schreibst LinkedIn-Posts in der Ich-Perspektive. Jeder Post MUSS sich lesen als haettest du ihn in 10 Minuten selbst geschrieben." +
    "\n\n=== DEIN PROFIL ===" +
    "\nName: " + authorName +
    (profile?.company ? "\nFirma: " + profile.company : "") +
    "\nExpertise: " + expertise +
    "\nZielgruppe: " + (voice.target_audience || "B2B Professionals im DACH-Raum") +
    "\nSprache: " + lang +
    (voice.bio ? "\nBio: " + voice.bio : "") +
    "\n\n=== DEIN TON ===" +
    "\n" + toneProfile +
    goals +
    (voice.custom_instructions ? "\n\n=== DEINE SPEZIAL-WUENSCHE ===\n" + voice.custom_instructions : "") +
    exampleSection +
    learningSection +
    dnaSection +
    "\n\n=== AKTUELLES DATUM ===" +
    "\nHeute ist " + new Date().toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + "." +
    "\nNutze dieses Wissen fuer zeitliche Referenzen: 'diese Woche', 'gerade erst', 'seit Anfang des Jahres'." +
    "\nDu darfst auf aktuelle Zeitraeume referenzieren (Q1/Q2 2026, Fruehling 2026, etc.)." +
    "\n\n=== LINKEDIN-ALGORITHMUS 2026 (eingebettetes Wissen) ===" +
    "\n- DWELL TIME ist der wichtigste Faktor: Posts mit 61+ Sekunden Lesezeit = 15.6% Engagement (vs 1.2% unter 3s)" +
    "\n- 3-8 Stunden Evaluation Window: Der Algorithmus testet dich ueber Stunden, nicht nur die erste Stunde" +
    "\n- DEPTH SCORE ersetzt Likes: Saves, Shares-mit-Kontext, und Kommentar-Qualitaet zaehlen mehr" +
    "\n- Kommentare von Experten haben 5-7x mehr Gewicht als normale Likes" +
    "\n- Text-Posts (800-1300 Zeichen) performen am zuverlaessigsten" +
    "\n- Externe Links werden BESTRAFT — nie im Post, hoechstens in Kommentaren" +
    "\n- LinkedIn erkennt AI-Content aktiv: repetitive Strukturen, vorhersagbare Saetze, generische Phrasen werden deprioritisiert" +
    "\n\n=== ANTI-KI-DETECTION (KRITISCH!) ===" +
    "\nVERBOTEN:" +
    "\n- 'In der heutigen Zeit', 'Es ist kein Geheimnis', 'Ich bin ueberzeugt dass', 'Lassen Sie mich teilen'" +
    "\n- 'Lasst uns gemeinsam', 'Was denkt ihr?', 'Ich freue mich ueber eure Meinung', 'Agree?'" +
    "\n- Saetze die mit Emoji anfangen" +
    "\n- Mehr als 4 Hashtags" +
    "\n- Generische Beraterflosken ohne Substanz" +
    "\n- Jeder Absatz gleich lang (variiere bewusst!)" +
    "\n- Aufzaehlungen mit mehr als 4 Punkten (LinkedIn-Cringe)" +
    "\n- Woerter wie 'transformativ', 'revolutionaer', 'bahnbrechend', 'Game-Changer'" +
    "\nPFLICHT:" +
    "\n- Mindestens ein konkretes Detail (Zahl, Name, Ort, Datum, Situation)" +
    "\n- Mindestens ein Satz unter 5 Woertern (Rhythmus-Wechsel!)" +
    "\n- Mindestens ein Satz ueber 20 Woertern (fuer Dwell Time)" +
    "\n- Die letzte Zeile vor den Hashtags MUSS stark sein: Frage, Statement, oder Provokation" +
    "\n- Absaetze zwischen 1-4 Saetzen (NIEMALS Textwaende)" +
    "\n- Kontraktionen nutzen ('hab' statt 'habe', 'ist's' statt 'ist es' - wenn casual)" +
    "\n- Persoenliche Anekdoten oder Mini-Geschichten einbauen (auch fiktiv, muss authentisch klingen)";
}

// ============================================================
// TOPIC DISCOVERY — AI-powered, expertise-matched
// ============================================================
async function discoverTopics(expertise: string[], recentTopics: string[], lang: string, bio?: string, customInstructions?: string): Promise<string[]> {
  var expertiseStr = expertise.join(", ");
  var avoidStr = recentTopics.length > 0 ? "\n\nVERMEIDE diese bereits behandelten Themen:\n- " + recentTopics.join("\n- ") : "";

  var contextStr = "";
  if (bio) contextStr += "\n\nKONTEXT ZUM AUTOR:\n" + bio;
  if (customInstructions) contextStr += "\n\nTHEMEN-VORGABEN DES AUTORS:\n" + customInstructions;

  var currentMonth = new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  var result = await claude(
    "Du bist ein LinkedIn Content-Stratege der fuer Top-Executives im DACH-Raum schreibt. Generiere NUR Thementitel, keine Erklaerungen. Wir sind in " + currentMonth + ".",
    "Generiere 6 SPEZIFISCHE LinkedIn-Post-Themen fuer einen Experten in: " + expertiseStr +
    contextStr +
    "\n\nJedes Thema MUSS:" +
    "\n1. DIREKT aus der Erfahrungswelt des Autors kommen - beziehe dich auf seine Firma, seine Projekte, seinen Alltag" +
    "\n2. Eine STARKE MEINUNG provozieren - Leser muessen widersprechen oder zustimmen wollen" +
    "\n3. AKTUELL sein (" + currentMonth + " - referenziere aktuelle Entwicklungen, Quartalsthemen)" +
    "\n4. Eine PERSOENLICHE GESCHICHTE ermoeglichen - der Autor muss aus eigener Erfahrung schreiben koennen" +
    "\n5. SPEZIFISCH sein - nicht 'KI im Business' sondern z.B. 'Warum unsere 17 KI-Agenten bessere Arbeit liefern als 50 McKinsey-Berater'" +
    avoidStr +
    "\n\nMix: 2x kontraere Meinung, 2x persoenliche Erfahrung aus dem Firmenalltag, 1x praktischer Tipp, 1x Branchenbeobachtung" +
    "\n\n6 Themen, eins pro Zeile. NUR Titel. " + (lang === "en" ? "English." : "Deutsch."),
    600
  );

  var lines = result.split("\n").filter(function (l) { return l.trim().length > 10; });
  var cleaned: string[] = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim()
      .replace(/^\d+[\.\)]\s*/, "")
      .replace(/^[-*]\s*/, "")
      .replace(/^["']|["']$/g, "")
      .trim();
    if (line.length > 10 && cleaned.length < 6) cleaned.push(line);
  }

  if (cleaned.length < 2) {
    cleaned = [
      "Die unterschaetzte Rolle von Daten in der digitalen Transformation",
      "Warum 90% aller LinkedIn-Posts niemanden interessieren"
    ];
  }
  return cleaned;
}

// ============================================================
// DRAFT GENERATION — format-guided, voice-matched
// ============================================================
async function generateDraft(systemPrompt: string, topic: string, format: string): Promise<string> {
  return await claude(
    systemPrompt,
    "Schreibe einen LinkedIn-Post zum Thema:\n\n" + topic +
    "\n\n=== FORMAT ===\n" + format +
    "\n\n=== ANFORDERUNGEN ===" +
    "\n- Schreibe GENAU so wie in den Beispiel-Posts / freigegebenen Posts (falls vorhanden)" +
    "\n- Die ersten 2 Zeilen sind ALLES - sie muessen neugierig machen, zum Weiterlesen zwingen" +
    "\n- Nutze ein konkretes Beispiel, eine Zahl, oder eine Mini-Geschichte" +
    "\n- Variiere die Satzlaengen BEWUSST (kurz. Dann laenger und erklaerend. Wieder kurz.)" +
    "\n- Ende mit etwas das zum Kommentieren einlaedt (KEINE generische Frage wie 'Was denkt ihr?')" +
    "\n- 800-1.300 Zeichen total" +
    "\n- 3-4 Hashtags am Ende, getrennt durch Leerzeile" +
    "\n\nSchreibe NUR den Post-Text. Keine Erklaerungen, keine Meta-Kommentare.",
    1500
  );
}

// ============================================================
// SELF-CRITIQUE — robust parsing with multiple fallbacks
// ============================================================
async function critiqueAndPolish(draft: string, authorName: string, expertise: string): Promise<{ polished: string; hooks: string[]; score: number }> {
  var critiquePrompt = "Hier ist ein LinkedIn-Post-Entwurf von " + authorName + " (Experte fuer " + expertise + "):\n\n" +
    '---START---\n' + draft + '\n---ENDE---\n\n' +
    "Analysiere KRITISCH und antworte in EXAKT diesem Format (behalte die Marker!):\n\n" +
    "SCORE: [Zahl 1-10]\n" +
    "Scoring-Rubrik:\n" +
    "- 1-3: Generisch, klingt wie ChatGPT, keine persoenliche Note, Buzzword-Bingo\n" +
    "- 4-5: Hat eine Idee, aber zu abstrakt, fehlende Beispiele, schwacher Hook\n" +
    "- 6-7: Solider Post, guter Hook, aber noch austauschbar — koennte von jedem Berater kommen\n" +
    "- 8: Starker Post mit echtem Insight, konkretem Beispiel, und Persoenlichkeit. Wuerde Kommentare bekommen.\n" +
    "- 9: Exzellent. Provokant, persoenlich, unverwechselbar. Leser teilen das.\n" +
    "- 10: Viral-Potential. Perfekter Hook, emotionale Resonanz, konkreter Value. Extrem selten.\n" +
    "SEI EHRLICH. Die meisten ersten Entwuerfe sind 4-6. Ein 8+ ist selten.\n\n" +
    "SCHWAECHEN:\n[1-3 Schwaechen, je eine Zeile]\n\n" +
    "POLISHED_POST_START\n[Der verbesserte Post. Behalte was gut ist, fixe die Schwaechen. Gleiche Laenge. Ziel: mindestens 1 Punkt besser als der Score.]\nPOLISHED_POST_END\n\n" +
    "HOOK_ALT_1_START\n[Alternative erste 2 Zeilen - provokanter, konkreter]\nHOOK_ALT_1_END\n\n" +
    "HOOK_ALT_2_START\n[Alternative erste 2 Zeilen - persoenlicher Story-Einstieg mit konkretem Detail]\nHOOK_ALT_2_END";

  var result = "";
  try {
    result = await claude(
      "Du bist ein brutal-ehrlicher LinkedIn Content Editor. Posts von 'ganz ok' auf 'holy shit das ist gut' bringen. Sei konkret. Kein Lob ohne Substanz.",
      critiquePrompt,
      2500
    );
  } catch (e) {
    // If critique fails, return the original draft
    return { polished: draft, hooks: [], score: 7 };
  }

  // Parse score (multiple patterns)
  var score = 7;
  var scorePatterns = [/SCORE:\s*(\d+)/, /Score:\s*(\d+)/, /(\d+)\/10/];
  for (var sp = 0; sp < scorePatterns.length; sp++) {
    var sm = result.match(scorePatterns[sp]);
    if (sm) { score = Math.min(10, Math.max(1, parseInt(sm[1]))); break; }
  }

  // Parse polished post (robust: try markers first, then regex, then fallback)
  var polished = draft;
  var polishedMatch = result.match(/POLISHED_POST_START\n([\s\S]*?)\nPOLISHED_POST_END/);
  if (polishedMatch && polishedMatch[1].trim().length > 50) {
    polished = polishedMatch[1].trim();
  } else {
    // Fallback: try the old format
    var fallbackMatch = result.match(/POLISHED_POST:\n([\s\S]*?)(?=\nHOOK_ALT|$)/);
    if (fallbackMatch && fallbackMatch[1].trim().length > 50) {
      polished = fallbackMatch[1].trim();
    }
    // If still nothing, the original draft is fine — it was already decent
  }

  // Parse hooks
  var hooks: string[] = [];
  var hook1Match = result.match(/HOOK_ALT_1_START\n([\s\S]*?)\nHOOK_ALT_1_END/);
  var hook2Match = result.match(/HOOK_ALT_2_START\n([\s\S]*?)\nHOOK_ALT_2_END/);
  if (!hook1Match) hook1Match = result.match(/HOOK_ALT_1:\n([\s\S]*?)(?=\nHOOK_ALT_2|$)/);
  if (!hook2Match) hook2Match = result.match(/HOOK_ALT_2:\n([\s\S]*?)$/);
  if (hook1Match && hook1Match[1].trim().length > 10) hooks.push(hook1Match[1].trim());
  if (hook2Match && hook2Match[1].trim().length > 10) hooks.push(hook2Match[1].trim());

  return { polished: polished, hooks: hooks, score: score };
}

// ============================================================
// VARIATION — different angle, same voice
// ============================================================
async function generateVariation(systemPrompt: string, topic: string, originalPost: string): Promise<string> {
  try {
    return await claude(
      systemPrompt,
      "Hier ist ein LinkedIn-Post zum Thema '" + topic + "':\n\n" +
      '---\n' + originalPost.substring(0, 700) + '\n---\n\n' +
      "Schreibe eine KOMPLETT ANDERE Version zum selben Thema. Anderer Hook, anderer Blickwinkel, andere Struktur. " +
      "Gleicher Autor, gleicher Ton, gleiche Laenge.\n\nNUR den Post-Text.",
      1500
    );
  } catch (e) {
    return ""; // Variation is optional — don't fail the whole pipeline
  }
}

// ============================================================
// VOICE DNA UPDATE — deep style analysis
// ============================================================
async function updateVoiceDNA(supabase: any, userId: string, posts: any[], authorName: string): Promise<void> {
  var postTexts = "";
  for (var i = 0; i < Math.min(posts.length, 5); i++) {
    var text = posts[i].revised_text || posts[i].draft_text;
    if (text) postTexts += "--- POST " + (i + 1) + " ---\n" + text.substring(0, 600) + "\n\n";
  }

  var analysis = await claude(
    "Du bist ein Linguist der Schreibstile analysiert. Sei EXTREM spezifisch und konkret. Keine Allgemeinplaetze.",
    "Analysiere diese " + posts.length + " LinkedIn-Posts von " + authorName + " und erstelle ein Stimmprofil:\n\n" + postTexts +
    "\nAnalysiere GENAU:\n" +
    "1. SATZLAENGE: Durchschnittlich kurz/mittel/lang? Wie stark variiert sie?\n" +
    "2. WORTWAHL: Formell/casual? Welche spezifischen Woerter nutzt der Autor haeufig? Anglizismen?\n" +
    "3. STRUKTUR: Wie beginnen Posts typischerweise? Wie enden sie? Durchschnittliche Absatzlaenge?\n" +
    "4. HOOKS: Welche Art von Einstieg? Frage? Provokation? Geschichte? Zahl?\n" +
    "5. STILMITTEL: Rhetorische Fragen? Metaphern? Aufzaehlungen? Direkte Ansprache? Fragments?\n" +
    "6. HASHTAGS: Wie viele? Welche Art? Am Ende oder im Text?\n" +
    "7. EINZIGARTIGKEITEN: Was macht diesen Autor UNVERWECHSELBAR? Was wuerde sofort auffallen wenn es fehlte?\n\n" +
    "Schreibe ein kompaktes Stimmprofil (max 400 Woerter) das ein Ghostwriter nutzen kann.",
    1500
  );

  await supabase.rpc("update_voice_dna", { p_user_id: userId, p_voice_dna: analysis });
}

// ============================================================
// POST FORMAT TEMPLATES — proven viral frameworks
// ============================================================
var FORMATS = [
  "STORY-HOOK: Beginne mit einem KONKRETEN Moment. 'Letzte Woche sass ich in einem Meeting als...' oder 'Vor 3 Monaten habe ich etwas gemacht das alle fuer verrueckt hielten.' Erzaehle was passiert ist. Die Erkenntnis. Der Takeaway. WICHTIG: Die Geschichte muss SPEZIFISCH sein — Ort, Zeit, Person, Detail.",
  "KONTRAERE THESE: Beginne mit einer These die dem Mainstream widerspricht. 'Alle reden von X. Ich halte das fuer gefaehrlich.' Dann 2-3 STARKE Argumente mit konkreten Beispielen. Dann deine Alternative. WICHTIG: Nicht einfach dagegen sein — eine bessere Loesung anbieten.",
  "ZAHLEN-HOOK: Beginne mit einer ueberraschenden Zahl. 'Ich habe 47 Kundengespraeche analysiert.' oder '93% aller Unternehmen machen diesen Fehler.' Dann die Analyse dahinter. Dann was der Leser konkret anders machen kann. WICHTIG: Die Zahl muss im ersten Satz stehen.",
  "BEICHTE: Beginne mit einem ehrlichen Eingestaendnis. 'Ich muss etwas zugeben:' oder 'Drei Jahre lang habe ich meinen Kunden etwas erzaehlt, das nicht stimmte.' Zeige Verletzlichkeit. Erklaere was du gelernt hast. WICHTIG: Echte Verletzlichkeit, nicht inszeniert.",
  "BEOBACHTUNG: 'Mir faellt etwas auf das niemand ausspricht...' oder 'Ich beobachte seit Monaten einen Trend der mich beunruhigt.' Beschreibe das Muster. Erklaere warum es wichtig ist. Frage ob andere es auch sehen. WICHTIG: Spezifische Beobachtung, nicht abstrakt.",
  "FRAMEWORK: 'Seit ich X mache, hat sich Y veraendert. Hier mein Ansatz:' Dann 3 konkrete Schritte mit je einem Satz Erklaerung. Am Ende das Ergebnis. WICHTIG: Jeder Schritt muss SOFORT umsetzbar sein — kein 'denke strategisch nach'."
];

// ============================================================
// MAIN HANDLER
// ============================================================
export async function POST(request: NextRequest) {
  var startTime = Date.now();
  try {
    var supabase = getSupabase();
    var json = await request.json();
    var userId = json.userId;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // === Load voice profile (try full, fallback to basic) ===
    var voice: any = null;
    var fullVpRes = await supabase.rpc("get_full_voice_profile", { p_user_id: userId });
    if (!fullVpRes.error && fullVpRes.data && fullVpRes.data.length > 0) {
      voice = fullVpRes.data[0];
    } else {
      var basicVpRes = await supabase.rpc("get_voice_profile", { p_user_id: userId });
      if (basicVpRes.error || !basicVpRes.data || basicVpRes.data.length === 0) {
        return NextResponse.json({ error: "No voice profile found" }, { status: 404 });
      }
      voice = basicVpRes.data[0];
    }

    // === Load profile via RPC (no RLS issues) ===
    var profile: any = { full_name: "", company: "", email: "" };
    var profileRes = await supabase.rpc("get_profile_by_id", { p_user_id: userId });
    if (profileRes.data && profileRes.data.length > 0) {
      profile = profileRes.data[0];
    }

    // === Load approved posts for voice learning ===
    var approvedPosts: any[] = [];
    var approvedRes = await supabase.rpc("get_approved_posts", { p_user_id: userId, p_limit: 10 });
    if (approvedRes.data) approvedPosts = approvedRes.data;

    // === Get recent topics for deduplication (via RPC to bypass RLS) ===
    var recentTopics: string[] = [];
    var recentRes = await supabase.rpc("get_recent_topics", { p_user_id: userId, p_limit: 15 });
    if (recentRes.data) {
      for (var r = 0; r < recentRes.data.length; r++) {
        if (recentRes.data[r].source_topic) recentTopics.push(recentRes.data[r].source_topic);
      }
    }

    var expertise: string[] = [];
    if (voice.expertise_topics && Array.isArray(voice.expertise_topics) && voice.expertise_topics.length > 0) {
      expertise = voice.expertise_topics;
    }
    if (expertise.length === 0) expertise = ["Business", "Technology"];

    // === STEP 0: Build deep voice profile ===
    var systemPrompt = buildVoiceDNA(voice, profile, approvedPosts);

    // === STEP 1: Discover killer topics ===
    var allTopics = await discoverTopics(expertise, recentTopics, voice.language || "de", voice.bio || "", voice.custom_instructions || "");
    var shuffled = allTopics.slice().sort(function () { return Math.random() - 0.5; });
    var selectedTopics = shuffled.slice(0, 2);

    // === STEPS 2-4: Generate, critique, polish each post ===
    var drafts: any[] = [];
    var formatPool = FORMATS.slice().sort(function () { return Math.random() - 0.5; });
    // Ensure different formats for each post
    if (formatPool.length >= 2 && formatPool[0] === formatPool[1]) {
      var temp = formatPool[1];
      formatPool[1] = formatPool[2] || formatPool[0];
      if (temp) formatPool[2] = temp;
    }

    for (var t = 0; t < selectedTopics.length; t++) {
      try {
        var topic = selectedTopics[t];
        var format = formatPool[t % formatPool.length];

        // Step 2: Generate raw draft
        var rawDraft = await generateDraft(systemPrompt, topic, format);

        // Step 3: Self-critique and polish
        var expertiseStr = expertise.join(", ");
        var critique = await critiqueAndPolish(rawDraft, profile.full_name || "Author", expertiseStr);

        // Step 4: Generate one variation (non-blocking failure)
        var variation = await generateVariation(systemPrompt, topic, critique.polished);

        // Save the polished draft with full metadata
        var insertRes = await supabase.rpc("create_rich_draft", {
          p_user_id: userId,
          p_source_topic: topic,
          p_draft_text: critique.polished,
          p_variations: variation ? [variation] : [],
          p_hook_options: critique.hooks,
          p_engagement_score: critique.score,
          p_generation_metadata: {
            format: format.split(":")[0],
            raw_draft_length: rawDraft.length,
            polished_length: critique.polished.length,
            topics_discovered: allTopics.length,
            approved_posts_used: approvedPosts.length,
            voice_dna_active: !!voice.voice_dna,
            pipeline: "multi-step-v3",
            duration_ms: Date.now() - startTime,
            generated_at: new Date().toISOString()
          }
        });

        if (!insertRes.error && insertRes.data) {
          drafts.push({
            id: insertRes.data,
            topic: topic,
            score: critique.score,
            hooks: critique.hooks.length,
            has_variation: !!variation
          });
        }
      } catch (postError: any) {
        // If one post fails, continue with the next
        console.error("Post generation failed for topic:", selectedTopics[t], postError?.message);
      }
    }

    // === BONUS: Update Voice DNA if enough data and not yet done ===
    if (approvedPosts.length >= 3 && !voice.voice_dna) {
      try {
        await updateVoiceDNA(supabase, userId, approvedPosts, profile.full_name || "");
      } catch (dnaError) {
        console.error("Voice DNA update failed (non-critical):", dnaError);
      }
    }

    return NextResponse.json({
      success: true,
      drafts_created: drafts.length,
      drafts: drafts,
      topics_discovered: allTopics,
      pipeline: "multi-step-v3",
      voice_learning: voice.voice_dna ? "active_with_dna" : approvedPosts.length > 0 ? "learning" : "waiting_for_approvals",
      duration_ms: Date.now() - startTime
    });
  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Failed to generate drafts", detail: error?.message }, { status: 500 });
  }
}
