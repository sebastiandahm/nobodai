"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const EXPERTISE_OPTIONS = [
  "Digital Commerce",
  "E-Commerce",
  "Supply Chain",
  "Marketing",
  "Sales",
  "Leadership",
  "KI / AI",
  "Data & Analytics",
  "Digital Transformation",
  "Finance",
  "HR / People",
  "Product Management",
  "Sustainability",
  "Strategy",
  "Operations",
  "Tech / Engineering",
];

const GOAL_OPTIONS = [
  {
    id: "thought_leadership",
    label: "Thought Leadership",
    desc: "Be recognized as an industry expert",
    icon: "💡",
  },
  {
    id: "lead_generation",
    label: "Lead Generation",
    desc: "Attract clients and opportunities",
    icon: "🎯",
  },
  {
    id: "recruiting",
    label: "Recruiting",
    desc: "Attract top talent to your company",
    icon: "🧲",
  },
  {
    id: "employer_branding",
    label: "Employer Branding",
    desc: "Build your company's reputation",
    icon: "🏢",
  },
  {
    id: "networking",
    label: "Networking",
    desc: "Connect with decision-makers",
    icon: "🤝",
  },
];

const STEP_INFO = [
  { title: "About you", subtitle: "So we know who we're writing for" },
  { title: "Your expertise", subtitle: "Pick 3-5 topics you want to be known for" },
  { title: "Your goals", subtitle: "What should your LinkedIn presence achieve?" },
  { title: "Your tone", subtitle: "How should you sound on LinkedIn?" },
  { title: "Your voice", subtitle: "Optional: show us how you write" },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const toggleTopic = (t: string) =>
    setTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const toggleGoal = (g: string) =>
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );

  const canProceed = () => {
    if (step === 1) return fullName.length > 0;
    if (step === 2) return topics.length >= 2;
    if (step === 3) return goals.length >= 1;
    return true;
  };

  const handleFinish = async () => {
    if (!userId) return;
    setLoading(true);

    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        company,
        linkedin_url: linkedinUrl,
        website_url: websiteUrl,
        onboarding_completed: true,
      })
      .eq("id", userId);

    const systemPrompt = `Du bist der persoenliche LinkedIn-Ghostwriter fuer ${fullName}${company ? ` (${company})` : ""}.

STIMME & STIL:
- Formalitaet: ${formality < 0.3 ? "sehr casual/locker" : formality < 0.7 ? "professionell aber nahbar" : "formell/serioes"}
- Humor: ${humor < 0.3 ? "sachlich, kein Humor" : humor < 0.7 ? "gelegentlich humorvoll" : "oft witzig und selbstironisch"}
- Provokation: ${provocation < 0.3 ? "diplomatisch und zurueckhaltend" : provocation < 0.7 ? "meinungsstark aber fair" : "provokant und polarisierend"}
- Sprache: ${language === "de" ? "Deutsch" : "English"}

EXPERTISE: ${topics.join(", ")}
ZIELGRUPPE: ${targetAudience || "B2B Entscheider im DACH-Raum"}
ZIELE: ${goals.join(", ")}

${examplePosts ? `STIL-BEISPIELE (so schreibt ${fullName}):\n${examplePosts}` : ""}

REGELN:
- Schreibe immer in der Ich-Form
- Kein "Ich freue mich" oder "Ich bin stolz" - das klingt nach KI
- Verwende konkrete Zahlen und Beispiele wo moeglich
- Jeder Post braucht einen starken Hook (erste 2 Zeilen)
- Maximale Laenge: 1.300 Zeichen
- Verwende Absaetze und Zeilenumbrueche fuer Lesbarkeit
- Keine Emojis ausser der Nutzer verwendet sie in seinen Beispielen
- Hashtags nur am Ende, maximal 5
- Klingt NICHT wie KI. Klingt wie ein Mensch der nachgedacht hat.`;

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

  const toneLabel = (val: number, low: string, mid: string, high: string) =>
    val < 0.3 ? low : val < 0.7 ? mid : high;

  return (
    <div className="min-h-screen bg-void flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between max-w-xl mx-auto w-full">
        <div className="text-xl tracking-tight">
          <span className="font-serif text-whisper">nobod</span>
          <span className="font-serif text-amber italic">.ai</span>
        </div>
        <div className="text-xs text-shadow">
          Step {step} of 5
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-xl mx-auto w-full px-6 mb-2">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-amber rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Title */}
      <div className="max-w-xl mx-auto w-full px-6 mt-6 mb-8">
        <h2 className="font-serif text-2xl md:text-3xl text-whisper">
          {STEP_INFO[step - 1].title}
        </h2>
        <p className="text-shadow text-sm mt-1">
          {STEP_INFO[step - 1].subtitle}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-xl mx-auto w-full px-6">
        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="text-xs text-shadow mb-1.5 block font-medium">
                Full name *
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Max Mustermann"
                className="bg-card border border-border rounded-xl px-4 py-3 text-sm w-full focus:border-amber/40 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-shadow mb-1.5 block font-medium">
                Company
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="ACME GmbH"
                className="bg-card border border-border rounded-xl px-4 py-3 text-sm w-full focus:border-amber/40 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-shadow mb-1.5 block font-medium">
                LinkedIn Profile URL
              </label>
              <input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className="bg-card border border-border rounded-xl px-4 py-3 text-sm w-full focus:border-amber/40 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-shadow mb-1.5 block font-medium">
                Website
                <span className="text-shadow/40 ml-1">(optional)</span>
              </label>
              <input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://your-company.com"
                className="bg-card border border-border rounded-xl px-4 py-3 text-sm w-full focus:border-amber/40 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Step 2: Expertise */}
        {step === 2 && (
          <div>
            <div className="flex flex-wrap gap-2">
              {EXPERTISE_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTopic(t)}
                  className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                    topics.includes(t)
                      ? "bg-amber text-void font-medium shadow-lg shadow-amber/20"
                      : "bg-card border border-border text-shadow hover:border-amber/30 hover:text-whisper"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-4 text-xs text-shadow flex items-center gap-2">
              <span
                className={`inline-block w-5 h-5 rounded-full text-center leading-5 text-xs font-medium ${
                  topics.length >= 2
                    ? "bg-amber/20 text-amber"
                    : "bg-border text-shadow"
                }`}
              >
                {topics.length}
              </span>
              {topics.length < 2
                ? "Select at least 2 topics"
                : topics.length <= 5
                ? "Looking good!"
                : "Maybe a few less? Focus is key."}
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div>
            <div className="space-y-3">
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`w-full text-left px-5 py-4 rounded-xl transition-all flex items-center gap-4 ${
                    goals.includes(g.id)
                      ? "bg-amber/10 border border-amber/30 shadow-lg shadow-amber/5"
                      : "bg-card border border-border hover:border-amber/20"
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-whisper">
                      {g.label}
                    </div>
                    <div className="text-xs text-shadow mt-0.5">{g.desc}</div>
                  </div>
                  {goals.includes(g.id) && (
                    <span className="ml-auto text-amber text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <label className="text-xs text-shadow mb-1.5 block font-medium">
                Target audience
                <span className="text-shadow/40 ml-1">(optional)</span>
              </label>
              <input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. CTOs in mid-market, E-Commerce managers"
                className="bg-card border border-border rounded-xl px-4 py-3 text-sm w-full focus:border-amber/40 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Step 4: Tone */}
        {step === 4 && (
          <div className="space-y-10">
            {[
              {
                label: "Formality",
                value: formality,
                setter: setFormality,
                left: "Casual",
                right: "Formal",
                preview: toneLabel(
                  formality,
                  "Hey, check this out...",
                  "Here's what I learned...",
                  "I'd like to share a perspective on..."
                ),
              },
              {
                label: "Humor",
                value: humor,
                setter: setHumor,
                left: "Straight",
                right: "Playful",
                preview: toneLabel(
                  humor,
                  "The data is clear.",
                  "The data is clear (and surprising).",
                  "The data is clear. My reaction wasn't."
                ),
              },
              {
                label: "Edge",
                value: provocation,
                setter: setProvocation,
                left: "Diplomatic",
                right: "Provocative",
                preview: toneLabel(
                  provocation,
                  "There are different approaches...",
                  "Most companies get this wrong.",
                  "Let me tell you why this is broken."
                ),
              },
            ].map((slider) => (
              <div key={slider.label}>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-whisper font-medium">
                    {slider.label}
                  </label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={slider.value}
                  onChange={(e) =>
                    slider.setter(parseFloat(e.target.value))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-shadow mt-1.5">
                  <span>{slider.left}</span>
                  <span>{slider.right}</span>
                </div>
                <div className="mt-3 bg-card border border-border rounded-lg px-4 py-2.5 text-xs text-shadow italic">
                  Preview: &ldquo;{slider.preview}&rdquo;
                </div>
              </div>
            ))}

            <div>
              <label className="text-xs text-shadow mb-2 block font-medium">
                Language
              </label>
              <div className="flex gap-2">
                {[
                  { id: "de", label: "🇩🇪 Deutsch" },
                  { id: "en", label: "🇬🇧 English" },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id)}
                    className={`px-5 py-2.5 rounded-xl text-sm transition-all ${
                      language === l.id
                        ? "bg-amber text-void font-medium"
                        : "bg-card border border-border text-shadow hover:border-amber/30"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Examples */}
        {step === 5 && (
          <div>
            <div className="bg-card border border-border rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="text-sm text-shadow leading-relaxed">
                  <p className="text-whisper font-medium mb-1">Pro tip</p>
                  Paste 2-3 LinkedIn posts you've written before.
                  This helps nobody learn your unique style — your word choices,
                  sentence length, and personality. Separate posts with ---
                </div>
              </div>
            </div>

            <textarea
              value={examplePosts}
              onChange={(e) => setExamplePosts(e.target.value)}
              placeholder={"My first example post about a topic I care about...\n\n---\n\nAnother post I wrote that performed well..."}
              rows={12}
              className="resize-none bg-card border border-border rounded-xl px-4 py-3 text-sm w-full focus:border-amber/40 focus:outline-none transition-colors"
            />

            <div className="mt-3 text-xs text-shadow/60">
              No examples? No problem — nobody will learn from your profile and
              improve over time.
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="max-w-xl mx-auto w-full px-6 py-8">
        <div className="flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm text-shadow hover:text-whisper transition-colors flex items-center gap-1"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-amber text-void px-6 py-3 rounded-xl text-sm font-semibold hover:bg-amber/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="bg-amber text-void px-8 py-3 rounded-xl text-sm font-semibold hover:bg-amber/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                  Setting up...
                </>
              ) : (
                "Let nobody write for me →"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
