import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Eye,
  Headphones,
  Layers,
  Loader2,
  Lock,
  MessageCircle,
  Mic,
  PartyPopper,
  PencilLine,
  RotateCcw,
  Sparkles,
  Target,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { LessonRatingDialog } from "@/components/site/LessonRatingDialog";
import { invalidateMemberXp } from "@/hooks/use-member-xp";
import { supabase } from "@/integrations/supabase/client";
import { completeLesson } from "@/lib/lessons.functions";
import {
  isSoundEnabled,
  playLessonComplete,
  playCorrect,
  playPageTurn,
  playWrong,
  setSoundEnabled,
} from "@/lib/sound-fx";
import { PronunciationButton } from "@/components/PronunciationButton";
import { pronunciationService } from "@/lib/pronunciation";
import { ShadowingButton } from "@/components/ShadowingButton";
import { ListeningActivity } from "@/components/ListeningActivity";
import {
  SPEAKER_VOICE,
  DIALOGUE,
  VOCAB,
  PRONUNCIATION,
  MISSION_SCENARIOS,
  LISTENING1_TRANSCRIPT,
  LISTENING1_QUESTIONS,
  LISTENING2_TRANSCRIPT,
  LISTENING2_QUESTIONS,
} from "./lecon-02.content";

export const Route = createFileRoute("/lecon-02")({
  head: () => ({
    meta: [
      { title: "Lesson 02: Do You Understand English? | My Lessons — HiTako Academy" },
      {
        name: "description",
        content:
          "Lesson 02 of 80 in the HiT START track: Do You Understand English? — story, dialogue, vocabulary, pronunciation, exercises, and real-life mission.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LessonAccessGate,
});

const LESSON_SLUG = "lecon-02";
const LESSON_NUMBER = 2;
const TOTAL_LESSONS = 80;

/* ================================================================
   Access control
   ================================================================ */
function LessonAccessGate() {
  const navigate = useNavigate();
  const { loading, user } = useAuth();

  // Lesson 02 is one of the two /zero welcome-bonus lessons (see
  // FREE_BONUS_LESSONS in src/routes/zero.tsx), so unlike /mon-espace the
  // "free" role must NOT be bounced away here — that used to send free
  // members straight back to /zero the moment they tapped this lesson from
  // its own lesson path, so it never actually launched for them.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/connexion" });
      return;
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <LessonExperience />;
}

/* ================================================================
   Lesson content
   (dialogue, vocab, pronunciation, mission phrases, and listening
   transcripts live in ./lecon-02.content.ts — see that file's header
   for why)
   ================================================================ */
type Phase =
  | "intro"
  | "story"
  | "dialogue"
  | "vocab"
  | "listening1"
  | "pronunciation"
  | "fill"
  | "roleplay"
  | "match"
  | "listening2"
  | "mission"
  | "finish";

const STEP_ORDER: { phase: Phase; label: string; icon: LucideIcon }[] = [
  { phase: "story", label: "Tantara", icon: BookOpen },
  { phase: "dialogue", label: "Resadresaka", icon: MessageCircle },
  { phase: "vocab", label: "Voambolana", icon: Layers },
  { phase: "listening1", label: "Fihainoana 1", icon: Headphones },
  { phase: "pronunciation", label: "Fanononana", icon: Mic },
  { phase: "fill", label: "Fenoy ny banga", icon: PencilLine },
  { phase: "roleplay", label: "Role-play", icon: MessageCircle },
  { phase: "match", label: "Ampifandraiso", icon: Layers },
  { phase: "listening2", label: "Fihainoana 2", icon: Headphones },
  { phase: "mission", label: "Mission", icon: Target },
];
const FULL_ORDER: Phase[] = ["intro", ...STEP_ORDER.map((s) => s.phase), "finish"];

const METHOD = [
  { emoji: "📖", label: "Story" },
  { emoji: "💬", label: "Dialogue" },
  { emoji: "📚", label: "Vocab" },
  { emoji: "🎧", label: "Pronon." },
  { emoji: "✍️", label: "Practice" },
  { emoji: "🎯", label: "Mission" },
];

const STORY: { en: string; mg: string }[] = [
  {
    en: "It is Saturday afternoon. Toky is helping at his family's stall near the market. His best friend, Aina, is with him.",
    mg: "Asabotsy tolakandro ny andro. Manampy ao amin'ny tsenan'ny fianakaviany izay akaikin'ny tsena i Toky. Miaraka aminy i Aina, ilay namany akaiky indrindra.",
  },
  {
    en: "Aina notices a foreign man standing nearby. He looks a little lost, and he is holding a small notebook.",
    mg: "Mahatsikaritra lehilahy vahiny mijoro eo akaiky i Aina. Toa very hevitra ilay lehilahy, ary mitana kahie kely.",
  },
  {
    en: "\u201cLook, Toky! Maybe he needs help. Go and talk to him \u2014 practice your English!\u201d Aina says with a smile.",
    mg: "\u201cJereo ry Toky! Angamba mila fanampiana izy io. Mandehana miresaka aminy \u2014 ampiasao ny teny Anglisinao!\u201d hoy i Aina sady mitsiky.",
  },
  {
    en: "Toky feels a little nervous, but he takes a deep breath, walks over, and speaks slowly and politely: \u201cExcuse me. Do you understand English?\u201d",
    mg: "Somary nitebiteby kely i Toky, saingy naka rivotra lalina izy, nanatona, ary niteny moramora sady tamim-panajana hoe: \u201cAzafady tompoko. Mahazo teny Anglisy ve ianao?\u201d",
  },
  {
    en: "The man smiles warmly. \u201cYes, I do! My name is John. I am visiting Madagascar for work.\u201d Relieved and proud of himself, Toky continues the conversation with confidence.",
    mg: "Nitsiky miramirana ilay lehilahy. \u201cEny, azoko tsara! John no anarako. Tonga miasa aty Madagasikara aho.\u201d Maivamaivana sy nirehareha tamin'ny tenany i Toky, ka nanohy ny resaka tamim-pahatokisan-tena.",
  },
];

const CULTURE_TIP =
  "Rehefa te hiresaka amin'olona tsy fantatra ianao, indrindra fa vahiny, dia fanehoam-panajana ny fampiasana ny teny hoe \u201cExcuse me\u201d alohan'ny hametrahana fanontaniana na hanombohana resaka. Mitenena moramora sy mazava tsara, nefa aza miteny mafy loatra, satria mety ho raisina ho tsy fanajana ny fiantsoantsoana—indrindra raha mbola tsy tena mazava tsara amin'ny hafa ny zavatra lazainao.";

const FILL_QUESTIONS: { before: string; after: string; options: string[]; correct: string }[] = [
  {
    before: "\u201c",
    after: " me. Do you understand English?\u201d",
    options: ["Excuse", "Please", "Thanks"],
    correct: "Excuse",
  },
  {
    before: "\u201cDo you ",
    after: " English?\u201d",
    options: ["understand", "understanding", "understood"],
    correct: "understand",
  },
  { before: "\u201cYes, I ", after: ".\u201d", options: ["do", "does", "did"], correct: "do" },
  {
    before: "\u201cNo, I ",
    after: ".\u201d",
    options: ["don't", "doesn't", "not"],
    correct: "don't",
  },
  {
    before: "\u201cI am ",
    after: " English.\u201d",
    options: ["learning", "learn", "learns"],
    correct: "learning",
  },
  {
    before: "\u201cCould you ",
    after: " that, please?\u201d",
    options: ["repeat", "repeats", "repeating"],
    correct: "repeat",
  },
  { before: "\u201cA ", after: ".\u201d", options: ["little", "small", "few"], correct: "little" },
  {
    before: "\u201cNice to ",
    after: " you.\u201d",
    options: ["meet", "meat", "met"],
    correct: "meet",
  },
];

const ROLEPLAY_PROMPTS: { situation: string; mg: string; model: string }[] = [
  {
    situation: "Meeting a tourist who might not speak English",
    mg: "Mihaona amin'ny mpizahatany iray mety tsy mahay teny Anglisy ianao",
    model: "Excuse me. Do you understand English?",
  },
  {
    situation: "You don't understand what someone said",
    mg: "Tsy azonao tsara ny teny voalazan'olona iray",
    model: "Could you repeat that, please?",
  },
  {
    situation: "Someone asks if you speak English",
    mg: "Misy manontany anao raha mahay teny Anglisy ianao",
    model: "A little. I am learning.",
  },
];

const MATCH_PAIRS: { term: string; def: string }[] = [
  { term: "Excuse me", def: "A polite way to get someone's attention before speaking" },
  {
    term: "Do you understand English?",
    def: "A polite question to check if someone can communicate in English",
  },
  { term: "Yes, I do.", def: "A polite way to say you understand" },
  { term: "A little", def: "Used to say you understand or speak some, but not fluently" },
  { term: "Nice to meet you", def: "Said when meeting someone for the first time" },
];

/* ================================================================
   Page
   ================================================================ */
function LessonExperience() {
  const { user, profile } = useAuth();
  const completeLessonFn = useServerFn(completeLesson);

  const [phase, setPhase] = useState<Phase>("intro");
  const [xp, setXp] = useState(0);
  const [fillScore, setFillScore] = useState({ correct: 0, total: FILL_QUESTIONS.length });
  // Listening activity scores are tracked separately from the final quiz
  // score (fillScore) so they can be surfaced / persisted independently.
  const [listening1Score, setListening1Score] = useState<{ correct: number; total: number } | null>(
    null,
  );
  const [listening2Score, setListening2Score] = useState<{ correct: number; total: number } | null>(
    null,
  );
  const [soundOn, setSoundOn] = useState(true);
  const [priorProgress, setPriorProgress] = useState<{
    best_score: number;
    xp_earned: number;
    attempts: number;
    completed_at: string;
  } | null>(null);
  const [completionState, setCompletionState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  const cardRef = useRef<HTMLDivElement | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const completionSentRef = useRef(false);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("best_score, xp_earned, attempts, completed_at")
        .eq("user_id", user.id)
        .eq("lesson_slug", LESSON_SLUG)
        .maybeSingle();
      if (!cancelled) setPriorProgress(data ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (phase !== "intro") cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  useEffect(() => {
    if (phase !== "finish" || completionSentRef.current || !user) return;
    completionSentRef.current = true;
    const studyMinutes = Math.min(
      30,
      Math.max(3, Math.round((Date.now() - startedAtRef.current) / 60000)),
    );
    const bestScore = Math.round((fillScore.correct / Math.max(1, fillScore.total)) * 100);
    setCompletionState("saving");
    completeLessonFn({
      data: {
        lesson_slug: LESSON_SLUG,
        lesson_number: LESSON_NUMBER,
        xp_earned: xp,
        best_score: bestScore,
        study_minutes: studyMinutes,
      },
    })
      .then(() => {
        setCompletionState("saved");
        // The header's XP pill (MemberTopBar → useMemberXp) is cached for
        // the session — see src/lib/session-cache.ts — so it won't pick up
        // this lesson's XP on its own. Clear it now so the next time it
        // mounts (e.g. navigating back to /mon-espace) it refetches.
        invalidateMemberXp(user.id);
      })
      .catch((err) => {
        console.error("[lecon-02] completeLesson failed:", err);
        setCompletionState("error");
      });
  }, [phase, user, xp, fillScore, completeLessonFn]);

  const goTo = (p: Phase) => setPhase(p);
  const goNext = () => {
    playPageTurn();
    const idx = FULL_ORDER.indexOf(phase);
    goTo(FULL_ORDER[Math.min(idx + 1, FULL_ORDER.length - 1)]);
  };
  const goBack = () => {
    playPageTurn();
    const idx = FULL_ORDER.indexOf(phase);
    goTo(FULL_ORDER[Math.max(idx - 1, 0)]);
  };
  const gainAndNext = (gained: number) => {
    setXp((x) => x + gained);
    goNext();
  };

  return (
    <div className="bg-background text-foreground">
      <LessonHero
        soundOn={soundOn}
        onToggleSound={toggleSound}
        priorProgress={phase === "intro" ? priorProgress : null}
        memberName={profile?.full_name}
      />
      <section className="px-5 pb-24 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div
            ref={cardRef}
            className="scroll-mt-24 overflow-hidden rounded-3xl border border-border bg-card shadow-elegant"
          >
            <StepProgress phase={phase} />
            <div className="p-6 md:p-10">
              {phase === "intro" && (
                <IntroStep onStart={() => goTo("story")} priorProgress={priorProgress} />
              )}
              {phase === "story" && <StoryStep onNext={goNext} onBack={goBack} />}
              {phase === "dialogue" && <DialogueStep onNext={goNext} onBack={goBack} />}
              {phase === "vocab" && <VocabStep onNext={goNext} onBack={goBack} />}
              {phase === "listening1" && (
                <ListeningActivity
                  title="Fihainoana 1 — Voambolana"
                  subtitle="Henoy tsara ny feo (azo averina imbetsaka), avy eo valio ny fanontaniana. Iray monja ny valiny azo omena isaky ny fanontaniana."
                  audioLabel="Audio 1 · 2–3 fehezanteny"
                  transcript={LISTENING1_TRANSCRIPT}
                  questions={LISTENING1_QUESTIONS}
                  onBack={goBack}
                  onFinish={(correct, total) => {
                    setListening1Score({ correct, total });
                    // Progression is intentionally independent of the listening
                    // score — the student always continues to the next step.
                    goNext();
                  }}
                />
              )}
              {phase === "pronunciation" && <PronunciationStep onNext={goNext} onBack={goBack} />}
              {phase === "fill" && (
                <FillStep
                  onNext={gainAndNext}
                  onBack={goBack}
                  onScore={(correct, total) => setFillScore({ correct, total })}
                />
              )}
              {phase === "roleplay" && (
                <RoleplayStep onNext={() => gainAndNext(15)} onBack={goBack} />
              )}
              {phase === "match" && <MatchStep onNext={gainAndNext} onBack={goBack} />}
              {phase === "listening2" && (
                <ListeningActivity
                  title="Fihainoana 2 — Fahatakarana ny lesona"
                  subtitle="Resadresaka lava kokoa (30–60 segondra). Henoy tsara (azo averina), avy eo valio ny fanontaniana 5. Iray ihany ny valiny azo omena."
                  audioLabel="Audio 2 · Resadresaka lava"
                  transcript={LISTENING2_TRANSCRIPT}
                  questions={LISTENING2_QUESTIONS}
                  onBack={goBack}
                  onFinish={(correct, total) => {
                    setListening2Score({ correct, total });
                    goNext();
                  }}
                />
              )}
              {phase === "mission" && (
                <MissionStep onNext={() => gainAndNext(20)} onBack={goBack} />
              )}
              {phase === "finish" && (
                <FinishStep
                  xp={xp}
                  fillScore={fillScore}
                  listening1Score={listening1Score}
                  listening2Score={listening2Score}
                  completionState={completionState}
                  onRestart={() => {
                    setXp(0);
                    setFillScore({ correct: 0, total: FILL_QUESTIONS.length });
                    setListening1Score(null);
                    setListening2Score(null);
                    completionSentRef.current = false;
                    setCompletionState("idle");
                    startedAtRef.current = Date.now();
                    goTo("intro");
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* End-of-lesson satisfaction popup (1–5 stars). Feedback only — it
          never touches lesson logic, XP, streak or progress tracking. */}
      <LessonRatingDialog
        active={phase === "finish"}
        lessonSlug={LESSON_SLUG}
        lessonNumber={LESSON_NUMBER}
        lessonTitle="ny Lesona 02"
      />
    </div>
  );
}

/* ---------- Hero ---------- */
function LessonHero({
  soundOn,
  onToggleSound,
  priorProgress,
  memberName,
}: {
  soundOn: boolean;
  onToggleSound: () => void;
  priorProgress: {
    best_score: number;
    xp_earned: number;
    attempts: number;
    completed_at: string;
  } | null;
  memberName?: string;
}) {
  return (
    <section className="relative overflow-hidden px-5 pt-10 pb-6 md:px-8 md:pt-16">
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-15 blur-3xl" />
      <div className="mx-auto max-w-3xl text-center">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/mon-espace"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> My Lessons
          </Link>
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundOn ? "Disable sound" : "Enable sound"}
            aria-pressed={soundOn}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-primary/40 hover:text-primary"
          >
            {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            {soundOn ? "Sound On" : "Sound Off"}
          </button>
        </div>
        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Lesson {LESSON_NUMBER} / {TOTAL_LESSONS} · HiT START
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-5xl">
          Lesson 02: <span className="text-gradient-brand">Do You Understand English?</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">
          {memberName ? `${memberName}, learn` : "Learn"} how to politely ask someone if they
          understand English — a real-life phrase you'll use with tourists, foreign customers, and
          new friends throughout your <strong className="text-foreground">HiT START</strong>{" "}
          journey.
        </p>
        {priorProgress && (
          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Already completed · Best score {priorProgress.best_score}%
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Segmented progress bar ---------- */
function StepProgress({ phase }: { phase: Phase }) {
  if (phase === "intro") return <div className="h-1.5 w-full bg-muted" />;
  if (phase === "finish") return <div className="h-1.5 w-full bg-gradient-brand" />;

  const stepIndex = STEP_ORDER.findIndex((s) => s.phase === phase);
  const CurrentIcon = STEP_ORDER[stepIndex].icon;

  return (
    <div className="border-b border-border bg-muted/40 px-5 py-3 md:px-9">
      <div className="mx-auto flex max-w-xl items-center gap-1.5">
        {STEP_ORDER.map((s, i) => (
          <div
            key={s.phase}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
              i <= stepIndex ? "bg-gradient-brand" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <div className="mx-auto mt-2 flex max-w-xl items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-soft">
        <span className="inline-flex items-center gap-1.5 text-primary">
          <CurrentIcon className="h-3.5 w-3.5" /> {STEP_ORDER[stepIndex].label}
        </span>
        <span>
          {stepIndex + 1} / {STEP_ORDER.length}
        </span>
      </div>
    </div>
  );
}

/* ---------- Shared step scaffolding ---------- */
function StepHeader({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 font-display text-2xl font-extrabold">
        <span aria-hidden>{emoji}</span>
        <span>{title}</span>
      </div>
      {subtitle && <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>}
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  nextLabel = "Manaraka",
  disabled = false,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  disabled?: boolean;
}) {
  void onBack;
  return (
    <div className="mt-8 flex items-center justify-end border-t border-border pt-6">
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
      >
        {nextLabel} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ---------- 0. Intro ---------- */
function IntroStep({
  onStart,
  priorProgress,
}: {
  onStart: () => void;
  priorProgress: {
    best_score: number;
    xp_earned: number;
    attempts: number;
    completed_at: string;
  } | null;
}) {
  return (
    <div className="animate-fade-up text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
        <Sparkles className="h-3.5 w-3.5" /> Your HiT START Lesson
      </div>
      <h2 className="mt-5 font-display text-2xl font-extrabold leading-tight md:text-3xl">
        Vonona ve ianao amin'ny <span className="text-gradient-brand">Lesona faha-02</span>? 👋
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-ink-soft">
        Ity no <strong className="text-foreground">lesona faha-2 amin'ireo 80</strong> ao anatin'ny
        fandaharam-pianarana HiTako Academy. Araho tsara ny dingana rehetra — tantara, resadresaka,
        voambolana, fanononana ary fanazaran-tena — hahazoanao antoka fa mahafehy tsara ny lesona
        ianao alohan'ny hirosoana amin'ny manaraka.
      </p>

      <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-2.5 sm:grid-cols-6">
        {METHOD.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-border bg-background p-3 text-center"
          >
            <div className="text-xl">{m.emoji}</div>
            <div className="mt-1 text-[10px] font-semibold leading-tight text-ink-soft">
              {m.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
        Aorian'ity fandaharam-pianarana 2 volana ity dia hahatratra ny fari-pahaizana{" "}
        <strong>CEFR A2</strong> ianao, ary ho afaka hiresaka amim-pahatokisan-tena amin'ny
        andavanandro.
      </div>

      <div className="mx-auto mt-8 max-w-md rounded-2xl bg-gradient-brand p-5 text-left text-primary-foreground shadow-elegant">
        <div className="text-[11px] font-bold uppercase tracking-widest text-white/75">
          Lesson 02
        </div>
        <div className="mt-1 font-display text-xl font-extrabold">Do You Understand English?</div>
        <div className="mt-1 text-sm text-white/85">
          🌟 Ny fomba anontaniana am-panajana raha mahazo teny Anglisy ny olona iray
        </div>
      </div>

      {priorProgress && (
        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-left text-sm text-foreground">
          <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Efa vitanao ity lesona ity
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            Best score: <strong className="text-foreground">{priorProgress.best_score}%</strong> ·
            XP: <strong className="text-foreground">{priorProgress.xp_earned}</strong> · Isan'ny
            nanaovanao azy: <strong className="text-foreground">{priorProgress.attempts}</strong> ·
            Last completed: {new Date(priorProgress.completed_at).toLocaleDateString("en-US")}
          </p>
          <p className="mt-2 text-xs text-ink-soft">
            Afaka mamerina ny lesona ianao hanamafisana ny fahaizanao ireo voambolana.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onStart}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-8 py-4 text-base font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 hover:shadow-glow"
      >
        {priorProgress ? "Hamerina ny lesona" : "Hanomboka ny lesona"}{" "}
        <ArrowRight className="h-5 w-5" />
      </button>
      <p className="mt-3 text-xs text-ink-soft">⏱ ⏱ Tombanana haharitra 15 minitra eo ho eo.</p>
    </div>
  );
}

/* ---------- 1. Story ---------- */
function StoryStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [shown, setShown] = useState<Record<number, boolean>>({});
  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="📖"
        title="Tantara"
        subtitle="Vakio ilay tantara. Vakio aloha amin'ny teny anglisy, ary tsindrio ny « Dikan-teny malagasy » raha mila fanazavana."
      />
      <div className="mt-6 space-y-4">
        {STORY.map((p, i) => (
          <div key={i} className="rounded-2xl border border-border bg-background p-4">
            <p className="text-[15px] leading-relaxed text-foreground">{p.en}</p>
            {shown[i] ? (
              <p className="mt-2.5 flex items-start gap-1.5 text-sm text-primary">
                <span aria-hidden>🇲🇬</span> {p.mg}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setShown((s) => ({ ...s, [i]: true }))}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Eye className="h-3.5 w-3.5" /> Dikan-teny malagasy
              </button>
            )}
          </div>
        ))}
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-foreground">
          <span aria-hidden className="text-base">
            🌍
          </span>
          <p>{CULTURE_TIP}</p>
        </div>
      </div>
      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

/* ---------- 2. Dialogue ---------- */
function DialogueStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="💬"
        title="Resadresaka"
        subtitle="Tsindrio ny 🔊 hihainoanao ny fanononana marina."
      />
      <div className="mt-6 space-y-3">
        {DIALOGUE.map((line, i) => {
          const isToky = line.speaker === "Toky";
          return (
            <div key={i} className={`flex items-end gap-2.5 ${isToky ? "" : "flex-row-reverse"}`}>
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${
                  isToky ? "bg-rose-400" : "bg-sky-500"
                }`}
                aria-hidden
              >
                {isToky ? "T" : "J"}
              </div>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                  isToky
                    ? "rounded-bl-sm bg-muted text-foreground"
                    : "rounded-br-sm bg-gradient-brand text-primary-foreground"
                }`}
              >
                {line.text}
              </div>
              <PronunciationButton
                text={line.text}
                speaker={SPEAKER_VOICE[line.speaker]}
                size="sm"
                ariaLabel={`Henoy: ${line.text}`}
              />
              <ShadowingButton
                text={line.text}
                speaker={SPEAKER_VOICE[line.speaker]}
                size="sm"
                ariaLabel={`Avereno: ${line.text}`}
                locale="mg"
              />
            </div>
          );
        })}
      </div>
      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

/* ---------- 3. Vocabulary ---------- */
function VocabStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="📚"
        title="Voambolana"
        subtitle="Ireto ireo voambolana manan-danja indrindra amin'ity lesona ity."
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {VOCAB.map((v) => (
          <div key={v.en} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-base font-bold text-primary">{v.en}</span>
              <div className="flex items-center gap-1.5">
                <PronunciationButton text={v.en} size="sm" ariaLabel={`Henoy: ${v.en}`} />
                <ShadowingButton text={v.en} size="sm" ariaLabel={`Avereno: ${v.en}`} locale="mg" />
              </div>
            </div>
            <div className="mt-1.5 text-sm font-semibold text-foreground">🇲🇬 {v.mg}</div>
            <p className="mt-1.5 text-xs text-ink-soft">{v.def}</p>
          </div>
        ))}
      </div>
      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

/* ---------- 4. Pronunciation ---------- */
function PronunciationStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="🎧"
        title="Fanononana"
        subtitle="Henoy tsara aloha ny fanononana, avereno miadana, ary rehefa mahazo aina ianao dia ampitomboy tsikelikely ny hafainganam-piteninao."
      />
      <div className="mt-6 space-y-3">
        {PRONUNCIATION.map((p) => (
          <div
            key={p.en}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4"
          >
            <div>
              <div className="font-semibold text-foreground">{p.en}</div>
              <div className="mt-0.5 font-mono text-xs text-ink-soft">{p.ipa}</div>
            </div>
            <div className="flex items-center gap-2">
              <PronunciationButton text={p.en} ariaLabel={`Henoy: ${p.en}`} />
              <ShadowingButton text={p.en} ariaLabel={`Avereno: ${p.en}`} locale="mg" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-foreground">
        💡 Toromarika: Tsindrio ny 🔊, henoy tsara, ary avereno mafy in-droa na in-telo. Ny
        fanononana marina no lakilen'ny fahatokisan-tena rehefa miteny Anglisy.
      </div>
      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

/* ---------- 5. Fill in the blanks ---------- */
function FillStep({
  onNext,
  onBack,
  onScore,
}: {
  onNext: (gained: number) => void;
  onBack: () => void;
  onScore: (correct: number, total: number) => void;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const q = FILL_QUESTIONS[i];
  const total = FILL_QUESTIONS.length;

  const pick = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const good = opt === q.correct;
    if (good) {
      playCorrect();
      setScore((s) => s + 1);
    } else {
      playWrong();
    }
    window.setTimeout(() => {
      if (i + 1 >= total) {
        const finalScore = good ? score + 1 : score;
        onScore(finalScore, total);
        onNext(finalScore * 10);
      } else {
        setI((n) => n + 1);
        setPicked(null);
      }
    }, 800);
  };

  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="✍️"
        title="Fenoy ny banga"
        subtitle={`Safidio ny teny marina. Fanontaniana ${i + 1}/${total}.`}
      />
      <div className="mt-6 rounded-2xl bg-gradient-brand p-6 text-center text-primary-foreground shadow-elegant">
        <p className="font-display text-lg font-bold leading-relaxed md:text-xl">
          {q.before}
          <span className="mx-1 inline-block min-w-[70px] rounded-md border-b-2 border-dashed border-white/70 align-middle">
            &nbsp;
          </span>
          {q.after}
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {q.options.map((opt) => {
          const isPicked = picked === opt;
          const isCorrect = !!picked && opt === q.correct;
          const isWrong = isPicked && opt !== q.correct;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => pick(opt)}
              disabled={!!picked}
              className={[
                "rounded-2xl border p-4 text-center font-semibold transition-all",
                !picked &&
                  "border-border bg-background hover:-translate-y-0.5 hover:border-primary/40",
                isCorrect &&
                  "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                isWrong && "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                picked &&
                  !isPicked &&
                  opt !== q.correct &&
                  "border-border bg-background opacity-50",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                {opt}
                {isCorrect && <Check className="h-4 w-4" />}
                {isWrong && <X className="h-4 w-4" />}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-8 flex items-center justify-end border-t border-border pt-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
          Isa: {score}/{total}
        </span>
      </div>
    </div>
  );
}

/* ---------- 6. Role-play ---------- */
function RoleplayStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [answers, setAnswers] = useState<Record<number, string>>({});

  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="✍️"
        title="Role-play: Manontany raha mahazo teny Anglisy"
        subtitle="Alaivo sary an-tsaina hoe mihaona amin'olona tsy fantatrao ianao. Inona no holazainao aminy?"
      />
      <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
        <span className="font-semibold">Ohatra:</span> “Excuse me. Do you understand English?”
      </div>
      <p className="mt-6 text-sm font-semibold text-foreground">
        Ankehitriny, andramo foronina ny fehezanteny mifanaraka amin'ireto tranga ireto:
      </p>
      <div className="mt-4 space-y-4">
        {ROLEPLAY_PROMPTS.map((r, i) => (
          <div key={r.situation} className="rounded-2xl border border-border bg-background p-4">
            <div className="font-semibold text-foreground">{r.situation}</div>
            <div className="text-xs text-ink-soft">{r.mg}</div>
            <textarea
              value={answers[i] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
              placeholder="Soraty eto ny valinao…"
              rows={2}
              className="mt-3 w-full resize-none rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
            {revealed[i] ? (
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                <Check className="h-4 w-4 shrink-0" /> {r.model}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRevealed((s) => ({ ...s, [i]: true }))}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Eye className="h-3.5 w-3.5" /> Jereo ny ohatra
              </button>
            )}
          </div>
        ))}
      </div>
      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

/* ---------- 7. Vocabulary matching ---------- */
function MatchStep({ onNext, onBack }: { onNext: (gained: number) => void; onBack: () => void }) {
  const [defs] = useState(() => [...MATCH_PAIRS].sort(() => Math.random() - 0.5));
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongDef, setWrongDef] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const total = MATCH_PAIRS.length;
  const allDone = matched.size === total;
  const gained = Math.max(10, 30 - attempts * 2);

  // As soon as every term is linked to its correct definition, move on
  // automatically — no need to make the learner hunt for the "Manaraka"
  // button. A short pause lets them see the final match land first.
  useEffect(() => {
    if (!allDone) return;
    const timer = window.setTimeout(() => onNext(gained), 1100);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  const handleTermClick = (term: string) => {
    if (matched.has(term)) return;
    setSelectedTerm((t) => (t === term ? null : term));
    // Hearing the English word the moment it's tapped reinforces the sound
    // ↔ spelling link right when the learner is focused on that word.
    pronunciationService.speak(term).catch((err) => {
      console.warn("[MatchStep] could not play pronunciation", err);
    });
  };
  const handleDefClick = (def: string) => {
    if (!selectedTerm) return;
    const pair = MATCH_PAIRS.find((p) => p.term === selectedTerm);
    setAttempts((a) => a + 1);
    if (pair && pair.def === def) {
      playCorrect();
      setMatched((m) => new Set(m).add(selectedTerm));
      setSelectedTerm(null);
    } else {
      playWrong();
      setWrongDef(def);
      window.setTimeout(() => setWrongDef(null), 450);
      setSelectedTerm(null);
    }
  };

  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="🧩"
        title="Ampifandraiso"
        subtitle="Tsindrio ny teny iray avy eo ankavia, ary safidio ny hevitra mifanaraka aminy eo ankavanana."
      />
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="space-y-2.5">
          {MATCH_PAIRS.map((p) => {
            const isMatched = matched.has(p.term);
            const isSelected = selectedTerm === p.term;
            return (
              <button
                key={p.term}
                type="button"
                disabled={isMatched}
                onClick={() => handleTermClick(p.term)}
                className={[
                  "w-full rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-all",
                  isMatched &&
                    "border-emerald-500 bg-emerald-500/10 text-emerald-700 opacity-60 dark:text-emerald-300",
                  !isMatched && isSelected && "border-primary bg-primary/10 text-primary",
                  !isMatched &&
                    !isSelected &&
                    "border-border bg-background hover:border-primary/40",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {p.term}
              </button>
            );
          })}
        </div>
        <div className="space-y-2.5">
          {defs.map((p) => {
            const isMatched = matched.has(p.term);
            const isWrong = wrongDef === p.def;
            return (
              <button
                key={p.def}
                type="button"
                disabled={isMatched}
                onClick={() => handleDefClick(p.def)}
                className={[
                  "w-full rounded-xl border px-3 py-2.5 text-left text-xs leading-snug transition-all",
                  isMatched &&
                    "border-emerald-500 bg-emerald-500/10 text-emerald-700 opacity-60 dark:text-emerald-300",
                  !isMatched &&
                    isWrong &&
                    "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                  !isMatched && !isWrong && "border-border bg-background hover:border-primary/40",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {p.def}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-6">
        {allDone && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Vita daholo! Mandrosoa...
          </span>
        )}
        <button
          type="button"
          onClick={() => onNext(gained)}
          disabled={!allDone}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          Manaraka <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ---------- 8. Real-life mission ---------- */
function MissionStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setDone((d) => {
      const n = new Set(d);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="🎯"
        title="Tranga tena misy"
        subtitle="Lazao mafy ireto fehezanteny ireto, ary ataovy toy ny hoe tena eo anatin'ilay toe-javatra ianao."
      />
      <div className="mt-6 space-y-3">
        {MISSION_SCENARIOS.map((s, i) => (
          <div
            key={s.title}
            className={`rounded-2xl border p-4 transition-colors ${
              done.has(i) ? "border-emerald-500/50 bg-emerald-500/5" : "border-border bg-background"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  Tranga {i + 1} · {s.title}
                </div>
                <p className="mt-1 text-sm text-ink-soft">{s.context}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-label="Vita"
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                  done.has(i) ? "border-emerald-500 bg-emerald-500" : "border-border"
                }`}
              >
                {done.has(i) && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-muted/60 px-3 py-2.5">
              <span className="flex-1 text-sm font-semibold text-foreground">“{s.phrase}”</span>
              <PronunciationButton text={s.phrase} size="sm" ariaLabel={`Henoy: ${s.phrase}`} />
              <ShadowingButton
                text={s.phrase}
                size="sm"
                ariaLabel={`Avereno: ${s.phrase}`}
                locale="mg"
              />
            </div>
          </div>
        ))}
      </div>
      <StepNav onBack={onBack} onNext={onNext} nextLabel="Vita ny lesona" />
    </div>
  );
}

/* ---------- 9. Finish ---------- */
function FinishStep({
  xp,
  fillScore,
  listening1Score,
  listening2Score,
  completionState,
  onRestart,
}: {
  xp: number;
  fillScore: { correct: number; total: number };
  listening1Score: { correct: number; total: number } | null;
  listening2Score: { correct: number; total: number } | null;
  completionState: "idle" | "saving" | "saved" | "error";
  onRestart: () => void;
}) {
  useEffect(() => {
    playLessonComplete();
  }, []);

  const scorePercent = Math.round((fillScore.correct / Math.max(1, fillScore.total)) * 100);

  return (
    <div className="animate-pop-in text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-brand shadow-glow">
        <PartyPopper className="h-9 w-9 text-primary-foreground" />
      </div>
      <h2 className="mt-5 font-display text-3xl font-extrabold md:text-4xl">
        Arahabaina! Vita ny Lesona faha-02! 🎉
      </h2>
      <p className="mx-auto mt-3 max-w-md text-ink-soft">
        Vao avy nianatra ny fomba anontaniana am-panajana olona iray raha mahazo teny Anglisy izy
        ianao — tahaka izao ny fomba fianarana ao amin'ny{" "}
        <strong className="text-foreground">HiT START</strong> isan'andro, mandritra ny 2 volana.
      </p>

      <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-background py-4">
          <div className="text-2xl font-extrabold text-gradient-brand">+{xp} XP</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
            Isa azo
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background py-4">
          <div className="text-2xl font-extrabold text-gradient-brand">{scorePercent}%</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
            Fenoy ny banga
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background py-4">
          <div className="text-2xl font-extrabold text-gradient-brand">
            {LESSON_NUMBER}/{TOTAL_LESSONS}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
            Lesona
          </div>
        </div>
      </div>

      {(listening1Score || listening2Score) && (
        <div className="mx-auto mt-4 grid max-w-sm grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-background py-4">
            <div className="text-xl font-extrabold text-primary">
              {listening1Score ? `${listening1Score.correct}/${listening1Score.total}` : "—"}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
              Fihainoana 1
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background py-4">
            <div className="text-xl font-extrabold text-primary">
              {listening2Score ? `${listening2Score.correct}/${listening2Score.total}` : "—"}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
              Fihainoana 2
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto mt-4 max-w-sm text-xs text-ink-soft">
        {completionState === "saving" && (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mitahiry ny fivoaranao...
          </span>
        )}
        {completionState === "saved" && (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Voatahiry ao amin'ny « My Lessons » ny
            fivoaranao.
          </span>
        )}
        {completionState === "error" && (
          <span className="text-amber-600 dark:text-amber-400">
            Tsy voatahiry ny fivoaranao noho ny olana ara-teknika — andramo indray azafady rehefa
            avy eo.
          </span>
        )}
      </div>

      {/* Quick vocab recap — a mini cheat-sheet the member can screenshot or re-listen to before moving on. */}
      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-border bg-background p-5 text-left">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BookOpen className="h-4 w-4 text-primary" /> Quick Review Guide
        </div>
        <ul className="mt-3 space-y-2">
          {VOCAB.slice(0, 5).map((v) => (
            <li key={v.en} className="flex items-center justify-between gap-2 text-sm">
              <span>
                <span className="font-semibold text-foreground">{v.en}</span>
                <span className="text-ink-soft"> — {v.mg}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <PronunciationButton text={v.en} size="sm" ariaLabel={`Henoy: ${v.en}`} />
                <ShadowingButton text={v.en} size="sm" ariaLabel={`Avereno: ${v.en}`} locale="mg" />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-left">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
          <Lock className="h-4 w-4" /> Lesson 03
        </div>
        <p className="mt-1.5 text-xs text-ink-soft">
          Tsy ho ela ao amin'ny 'My Lessons' — mbola misy lesona <strong>78</strong> hafa miandry
          anao mandra-pahatratranao ny fari-pahaizana <strong>CEFR A2</strong>.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-background"
        >
          <RotateCcw className="h-4 w-4" /> Avereno ny lesona
        </button>
        <Link
          to="/mon-espace"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
        >
          Back to My Lessons <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
