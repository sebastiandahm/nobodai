"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const EXPERTISE_OPTIONS = [
  "Digital Commerce", "E-Commerce", "Supply Chain", "Marketing",
  "Sales", "Leadership", "KI / AI", "Data & Analytics",
  "Digital Transformation", "Finance", "HR / People", "Product Management",
  "Sustainability", "Strategy", "Operations", "Tech / Engineering",
];

const GOAL_OPTIONS = [
  { id: "thought_leadership", label: "Thought Leadership", desc: "Als Experte wahrgenommen werden" },
  { id: "lead_generation", label: "Lead Generation", desc: "Kunden und Aufträge gewinnen" },
  { id: "recruiting", label: "Recruiting", desc: "Talente anziehen" },
  { id: "employer_branding", label: "Employer Branding", desc: "Arbeitgebermarke stärken" },
  { id: "networking", label: "Networking", desc: "Relevante Kontakte aufbauen" },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [company, setCompany] = useState("");
  const [fullName, setFullName] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [formality, setFormality] = useState(0.5);
  const [humor, setHumor] = useState(0.3);
  const [provocation, setProvocation] = useState(0.5);
  const [examplePosts, setExamplePosts] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [language, setLanguage] = useState("de");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/");
        return;
      }
      setUserId(data.user.id);
      setFullName(data.user.user_metadata?.full_name || "");
    });
  }, [router]);

  const toggleTopic = (t: string) => {
    setTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const toggleGoal = (g: string) => {
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleFinish = async () => {
    if (!userId) return;
    setLoading(true);

    // Update profile
    await supabase.from("profiles").update({
      full_name: fullName,
      company,
      linkedin_url: linkedinUrl,
      website_url: websiteUrl,
      onboarding_completed: true,
    }).eq("id", userId);

    // Build system prompt for Claude
    const systemPrompt = `Du bist der persönliche LinkedIn-Ghostwriter für ${fullName}${company ? ` (${company})` : ""}.

STIMME & STIL:
- Formalität: ${formality < 0.3 ? "sehr casual/locker" : formality < 0.7 ? "professionell aber nahbar" : "formell/seriös"}
- Humor: ${humor < 0.3 ? "sachlich, kein Humor" : humor < 0.7 ? "gelegentlich humorvoll" : "oft witzig und selbstironisch"}
- Provokation: ${provocation < 0.3 ? "diplomatisch und zurückhaltend" : provocation < 0.7 ? "meinungsstark aber fair" : "provokant und polarisierend"}
- Sprache: ${language === "de" ? "Deutsch" : "English"}

EXPERTISE: ${topics.join(", ")}
ZIELGRUPPE: ${targetAudience || "B2B Entscheider im DACH-Raum"}
ZIELE: ${goals.join(", ")}

${examplePosts ? `STIL-BEISPIELE (so schreibt ${fullName}):\n${examplePosts}` : ""}

REGELN:
- Schreibe immer in der Ich-Form
- Kein "Ich freue mich" oder "Ich bin stolz" - das klingt nach KI
- Verwende konkrete Zahlen und Beispiele wo möglich
- Jeder Post braucht einen starken Hook (erste 2 Zeilen)
- Maximale Länge: 1.300 Zeichen
- Verwende Absätze und Zeilenumbrüche für Lesbarkeit
- Keine Emojis außer der Nutzer verwendet sie in seinen Beispielen
- Hashtags nur am Ende, maximal 5
- Klingt NICHT wie KI. Klingt wie ein Mensch der nachgedacht hat.`;

    // Create voice profile
    await supabase.from("voice_profiles").insert({
      user_id: userId,
      bio: "",
      expertise_topics: topics,
      tone_formality: formality,
      tone_humor: humor,
      tone_provocation: provocation,
      example_posts: examplePosts
        ? examplePosts.split("\n---\n").filter(Boolean)
        : [],
      target_audience: targetAudience,
      goals,
      language,
      system_prompt: systemPrompt,
    });

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12">
      {/* Logo */}
      <div className="text-2xl tracking-tight mb-2">
        <span className="font-serif text-whisper">nobod</span>
        <span className="font-serif text-amber italic">.ai</span>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-10 mt-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-1 w-10 rounded-full transition-colors ${
              s <= step ? "bg-amber" : "bg-border"
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-lg">
        {/* Step 1: Basics */}
        {step === 1 && (
          <div>
            <h2 className="font-serif text-2xl mb-1">Wer bist du?</h2>
            <p className="text-shadow text-sm mb-8">
              Damit wir wissen, für wen wir schreiben.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-shadow mb-1 block">Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Max Mustermann"
                />
              </div>
              <div>
                <label className="text-xs text-shadow mb-1 block">Unternehmen</label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="ACME GmbH"
                />
              </div>
              <div>
                <label className="text-xs text-shadow mb-1 block">LinkedIn Profil URL</label>
                <input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/maxmustermann"
                />
              </div>
              <div>
                <label className="text-xs text-shadow mb-1 block">Website (optional)</label>
                <input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://acme.de"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Expertise */}
        {step === 2 && (
          <div>
            <h2 className="font-serif text-2xl mb-1">Deine Expertise</h2>
            <p className="text-shadow text-sm mb-8">
              Wähle 3-5 Themen, über die du auf LinkedIn sprechen willst.
            </p>
            <div className="flex flex-wrap gap-2">
              {EXPERTISE_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTopic(t)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    topics.includes(t)
                      ? "bg-amber text-void font-medium"
                      : "bg-card border border-border text-shadow hover:border-amber/30"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-4 text-xs text-shadow">
              {topics.length} von 3-5 gewählt
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div>
            <h2 className="font-serif text-2xl mb-1">Was willst du erreichen?</h2>
            <p className="text-shadow text-sm mb-8">
              Damit wir den richtigen Ton treffen.
            </p>
            <div className="space-y-3">
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`w-full text-left px-5 py-4 rounded-xl transition-all ${
                    goals.includes(g.id)
                      ? "bg-amber/10 border border-amber/30"
                      : "bg-card border border-border hover:border-amber/20"
                  }`}
                >
                  <div className="text-sm font-medium text-whisper">
                    {g.label}
                  </div>
                  <div className="text-xs text-shadow mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <label className="text-xs text-shadow mb-1 block">
                Zielgruppe (optional)
              </label>
              <input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="z.B. CTOs im Mittelstand, E-Commerce Manager"
              />
            </div>
          </div>
        )}

        {/* Step 4: Tone */}
        {step === 4 && (
          <div>
            <h2 className="font-serif text-2xl mb-1">Dein Ton</h2>
            <p className="text-shadow text-sm mb-8">
              Wie willst du auf LinkedIn klingen?
            </p>
            <div className="space-y-8">
              {[
                {
                  label: "Formalität",
                  value: formality,
                  setter: setFormality,
                  left: "Locker & Casual",
                  right: "Formell & Seriös",
                },
                {
                  label: "Humor",
                  value: humor,
                  setter: setHumor,
                  left: "Sachlich",
                  right: "Humorvoll",
                },
                {
                  label: "Provokation",
                  value: provocation,
                  setter: setProvocation,
                  left: "Diplomatisch",
                  right: "Polarisierend",
                },
              ].map((slider) => (
                <div key={slider.label}>
                  <label className="text-sm text-whisper mb-3 block">
                    {slider.label}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={slider.value}
                    onChange={(e) => slider.setter(parseFloat(e.target.value))}
                    className="w-full accent-amber"
                    style={{ background: "transparent" }}
                  />
                  <div className="flex justify-between text-xs text-shadow mt-1">
                    <span>{slider.left}</span>
                    <span>{slider.right}</span>
                  </div>
                </div>
              ))}
              <div>
                <label className="text-xs text-shadow mb-1 block">Sprache</label>
                <div className="flex gap-2">
                  {[
                    { id: "de", label: "Deutsch" },
                    { id: "en", label: "English" },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLanguage(l.id)}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        language === l.id
                          ? "bg-amber text-void font-medium"
                          : "bg-card border border-border text-shadow"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Examples */}
        {step === 5 && (
          <div>
            <h2 className="font-serif text-2xl mb-1">Deine Stimme</h2>
            <p className="text-shadow text-sm mb-8">
              Optional: Füge 2-3 LinkedIn-Posts ein, die du selbst geschrieben
              hast. Damit lernen wir deinen Stil. Trenne Posts mit ---
            </p>
            <textarea
              value={examplePosts}
              onChange={(e) => setExamplePosts(e.target.value)}
              placeholder={"Mein erster Beispiel-Post...\n\n---\n\nMein zweiter Beispiel-Post..."}
              rows={10}
              className="resize-none"
            />
            <div className="text-xs text-shadow mt-2">
              Keine Beispiele? Kein Problem — wir lernen aus deinem LinkedIn-Profil.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm text-shadow hover:text-whisper transition-colors"
            >
              ← Zurück
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-amber text-void px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber/90 transition-colors"
            >
              Weiter →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="bg-amber text-void px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Wird gespeichert..." : "Let nobody write for me →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
