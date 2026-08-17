import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { LessonRatingDialog } from "@/components/site/LessonRatingDialog";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Check,
  Layers,
  ListChecks,
  MessageCircle,
  Mic,
  PartyPopper,
  PencilLine,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { PronunciationButton } from "@/components/PronunciationButton";
import { ShadowingButton } from "@/components/ShadowingButton";
import { ListeningActivity } from "@/components/ListeningActivity";
import { playCorrect, playLessonComplete, playPageTurn, playWrong } from "@/lib/sound-fx";
import {
  LESSON_META,
  LISTENING_TRANSCRIPT,
  LISTENING_QUESTIONS,
  PATTERN,
  PRONUNCIATION,
  RESPONSES,
  RESPONSES_NOTE,
  EXAMPLES,
  AVOID_CONTEXTS,
  FORMAL_ALTERNATIVES,
  PRACTICE_QUESTIONS,
  SPEAKING_LINES,
  SELF_CHECK,
  PRO_TIP,
  REVIEW_PAIRS,
} from "./expression-du-jour_.jour-1.content";

export const Route = createFileRoute("/expression-du-jour_/jour-1")({
  head: () => ({
    meta: [
      { title: "Expression du jour — Day 1 « What's Up? » | HiTako Academy" },
      {
        name: "description",
        content:
          "Hianatra ny fomba fiteny « What's up? » sy ny famaliana azy — expression anglisy fahita isan'andro, explainé en malgache.",
      },
      { property: "og:title", content: "Expression du jour — What's Up?" },
      {
        property: "og:description",
        content: "Une expression américaine du quotidien, expliquée en malgache — 100% gratuit.",
      },
    ],
  }),
  component: ExpressionDayPage,
});

/* ================================================================
   Phases
   ================================================================ */
type Phase =
  | "intro"
  | "listening"
  | "pattern"
  | "pronunciation"
  | "responses"
  | "examples"
  | "avoid"
  | "practice"
  | "speaking"
  | "review"
  | "finish";

const STEP_ORDER: { phase: Phase; label: string; icon: LucideIcon }[] = [
  { phase: "listening", label: "Fihainoana", icon: Volume2 },
  { phase: "pattern", label: "Endrika", icon: Layers },
  { phase: "pronunciation", label: "Fanononana", icon: Mic },
  { phase: "responses", label: "Famaliana", icon: MessageCircle },
  { phase: "examples", label: "Ohatra", icon: Sparkles },
  { phase: "avoid", label: "Aza atao", icon: Ban },
  { phase: "practice", label: "Fampiharana", icon: PencilLine },
  { phase: "speaking", label: "Firesahana", icon: Mic },
  { phase: "review", label: "Famerenana", icon: ListChecks },
];
const FULL_ORDER: Phase[] = ["intro", ...STEP_ORDER.map((s) => s.phase), "finish"];

/* ================================================================
   Page
   ================================================================ */
function ExpressionDayPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [xp, setXp] = useState(0);
  const [listeningScore, setListeningScore] = useState<{ correct: number; total: number } | null>(
    null,
  );
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (phase !== "intro") cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

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
      <LessonHero />
      <section className="px-5 pb-24 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div
            ref={cardRef}
            className="scroll-mt-24 overflow-hidden rounded-3xl border border-border bg-card shadow-elegant"
          >
            <StepProgress phase={phase} />
            <div className="p-6 md:p-10">
              {phase === "intro" && <IntroStep onStart={() => goTo("listening")} />}
              {phase === "listening" && (
                <ListeningActivity
                  title="Henoy tsara ilay resaka"
                  subtitle="Azo averina imbetsaka ny feo. Tsindrio ny valiny marina rehefa vonona ianao."
                  audioLabel="Audio · Fiarahabana fohy"
                  transcript={LISTENING_TRANSCRIPT}
                  questions={LISTENING_QUESTIONS}
                  onBack={goBack}
                  onFinish={(correct, total) => {
                    setListeningScore({ correct, total });
                    goNext();
                  }}
                />
              )}
              {phase === "pattern" && <PatternStep onNext={goNext} onBack={goBack} />}
              {phase === "pronunciation" && <PronunciationStep onNext={goNext} onBack={goBack} />}
              {phase === "responses" && <ResponsesStep onNext={goNext} onBack={goBack} />}
              {phase === "examples" && <ExamplesStep onNext={goNext} onBack={goBack} />}
              {phase === "avoid" && <AvoidStep onNext={goNext} onBack={goBack} />}
              {phase === "practice" && <PracticeStep onNext={gainAndNext} onBack={goBack} />}
              {phase === "speaking" && (
                <SpeakingStep onNext={() => gainAndNext(15)} onBack={goBack} />
              )}
              {phase === "review" && <ReviewStep onNext={() => gainAndNext(10)} onBack={goBack} />}
              {phase === "finish" && (
                <FinishStep
                  xp={xp}
                  listeningScore={listeningScore}
                  onRestart={() => {
                    setXp(0);
                    setListeningScore(null);
                    goTo("intro");
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <LessonRatingDialog
        active={phase === "finish"}
        lessonSlug="expression-du-jour-1"
        lessonNumber={1}
        lessonTitle="ity Expression du jour ity"
      />
    </div>
  );
}

/* ---------- Hero ---------- */
function LessonHero() {
  return (
    <section className="relative overflow-hidden px-5 pt-10 pb-6 md:px-8 md:pt-16">
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-15 blur-3xl" />
      <div className="mx-auto max-w-3xl text-center">
        <Link
          to="/expression-du-jour"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour — Expression du jour
        </Link>
        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-600">
          <Sparkles className="h-3.5 w-3.5" /> Expression du jour · 100% maimaim-poana
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-5xl">
          {LESSON_META.flag} {LESSON_META.day}:{" "}
          <span className="text-gradient-brand">{LESSON_META.title}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">{LESSON_META.intro}</p>
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
function IntroStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-fade-up text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-600">
        <Sparkles className="h-3.5 w-3.5" /> Expression of the Day
      </div>
      <h2 className="mt-5 font-display text-2xl font-extrabold leading-tight md:text-3xl">
        {LESSON_META.flag} {LESSON_META.day} —{" "}
        <span className="text-gradient-brand">{LESSON_META.title}</span>
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-ink-soft">{LESSON_META.intro}</p>

      <div className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-2.5">
        <span className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground">
          Level: {LESSON_META.level}
        </span>
        <span className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground">
          Category: {LESSON_META.category}
        </span>
      </div>

      <div className="mx-auto mt-8 max-w-md rounded-2xl bg-gradient-brand p-5 text-left text-primary-foreground shadow-elegant">
        <div className="text-[11px] font-bold uppercase tracking-widest text-white/75">
          {LESSON_META.day}
        </div>
        <div className="mt-1 font-display text-xl font-extrabold">{LESSON_META.title}</div>
        <div className="mt-1 text-sm text-white/85">
          🇲🇬 Fiarahabana casual — fomba fiarahaba ny namanao amin'ny teny Anglisy
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-8 py-4 text-base font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 hover:shadow-glow"
      >
        Atombohy <ArrowRight className="h-5 w-5" />
      </button>
      <p className="mt-3 text-xs text-ink-soft">
        ⏱ Tombanana haharitra 8 minitra eo ho eo — maimaim-poana.
      </p>
    </div>
  );
}

/* ---------- 1. Pattern breakdown ---------- */
function PatternStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="🧠"
        title="Pattern Breakdown"
        subtitle="Ny fiarahabana casual dia matetika fohezina rehefa miteny haingana ny Amerikanina."
      />

      <div className="mt-6 rounded-2xl border border-border bg-background p-5 text-center">
        <div className="text-xs font-bold uppercase tracking-wider text-ink-soft">
          Izay henonao matetika
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 font-display text-2xl font-extrabold">
          <span className="text-primary">{PATTERN.short}</span>
          <ArrowRight className="h-5 w-5 text-ink-soft" />
          <span>{PATTERN.full}</span>
        </div>
        <div className="mt-2 text-sm text-ink-soft">{PATTERN.meanings.join("  •  ")}</div>
      </div>

      <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-relaxed text-foreground">
        🔍 {PATTERN.explanation}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-background p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-ink-soft">
          Amin'ny fiteny haingana
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 font-display text-lg font-bold text-foreground">
          {PATTERN.reduction.map((step, i) => (
            <span key={step} className="inline-flex items-center gap-2">
              {i > 0 && <ArrowRight className="h-4 w-4 text-ink-soft" />}
              <span className={i === PATTERN.reduction.length - 1 ? "text-primary" : ""}>
                {step}
              </span>
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-soft">{PATTERN.reductionNote}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PATTERN.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-muted px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-soft"
          >
            {tag}
          </span>
        ))}
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

/* ---------- 2. Pronunciation ---------- */
function PronunciationStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="🗣️"
        title="Fanononana"
        subtitle="Henoy tsara ny fanononana, avereno mora aloha, ary ampiakaro tsikelikely ny hafainganam-piteninao."
      />

      <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4">
        <div>
          <div className="font-semibold text-foreground">Phonetic</div>
          <div className="mt-0.5 font-mono text-sm text-ink-soft">{PRONUNCIATION.ipa}</div>
          <div className="mt-1 text-xs text-ink-soft">{PRONUNCIATION.easy}</div>
        </div>
        <PronunciationButton text={PATTERN.full} ariaLabel="Écouter : What's up?" />
      </div>

      <div className="mt-4 space-y-2.5">
        {PRONUNCIATION.reps.map((rep, i) => (
          <div
            key={`${rep}-${i}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4"
          >
            <div className="font-semibold text-foreground">
              {i + 1}. {rep}
            </div>
            <div className="flex items-center gap-2">
              <PronunciationButton text={rep} ariaLabel={`Écouter : ${rep}`} />
              <ShadowingButton text={rep} ariaLabel={`Répéter : ${rep}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-background p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-ink-soft">
          Mifandray rehefa miteny haingana
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <X className="h-4 w-4" /> {PRONUNCIATION.connected.wrong}
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" /> {PRONUNCIATION.connected.right}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-foreground">
        <div className="font-semibold">💡 Torohevitra (Tips)</div>
        <ul className="mt-2 space-y-1.5">
          {PRONUNCIATION.tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

/* ---------- 3. How to respond ---------- */
function ResponsesStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="💬"
        title="How to Respond"
        subtitle="Ahoana no famaliana — fomba 07 fahita indrindra."
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {RESPONSES.map((r, i) => (
          <div key={r.en} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-base font-bold text-primary">
                {i + 1}. {r.en}
              </span>
              <div className="flex items-center gap-1.5">
                <PronunciationButton text={r.en} size="sm" ariaLabel={`Écouter : ${r.en}`} />
                <ShadowingButton text={r.en} size="sm" ariaLabel={`Répéter : ${r.en}`} />
              </div>
            </div>
            <p className="mt-2 whitespace-pre-line text-xs text-ink-soft">{r.promptEn}</p>
            <div className="mt-2 text-sm font-semibold text-foreground">🇲🇬 {r.mg}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-foreground">
        ⚠️ {RESPONSES_NOTE}
      </div>
      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

/* ---------- 4. Real-life examples ---------- */
function ExamplesStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="🌎"
        title="Real-Life Examples"
        subtitle="Ohatra tena izy — fomba fampiasana ny « What's up? » amin'ny fiainana andavanandro."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {EXAMPLES.map((ex) => (
          <div key={ex.title} className="rounded-2xl border border-border bg-background p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">
              {ex.title}
            </div>
            <div className="mt-2 space-y-1 text-sm text-foreground">
              {ex.lines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-ink-soft">
              {ex.mg.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

/* ---------- 5. When NOT to use it ---------- */
function AvoidStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="🚫"
        title="When NOT to Use It"
        subtitle="Rahoviana no tsy tokony hampiasaina — « What's up? » dia casual, ka aza ampiasaina amin'ny toe-javatra ofisialy."
      />
      <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {AVOID_CONTEXTS.map((ctx) => (
          <div
            key={ctx}
            className="flex items-center gap-2.5 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-3.5 text-sm text-foreground"
          >
            <Ban className="h-4 w-4 shrink-0 text-rose-500" /> {ctx}
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          ✅ Amin'ireny toe-javatra ireny, tsara kokoa ny mampiasa
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {FORMAL_ALTERNATIVES.map((alt) => (
            <span
              key={alt}
              className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm"
            >
              {alt}
              <PronunciationButton text={alt} size="sm" ariaLabel={`Écouter : ${alt}`} />
            </span>
          ))}
        </div>
      </div>
      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

/* ---------- 6. Mini practice ---------- */
function PracticeStep({
  onNext,
  onBack,
}: {
  onNext: (gained: number) => void;
  onBack: () => void;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const q = PRACTICE_QUESTIONS[i];
  const total = PRACTICE_QUESTIONS.length;

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
        onNext((good ? score + 1 : score) * 10);
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
        title="Mini Practice"
        subtitle="Fenoy ny valiny mety — safidio ny teny mifanaraka amin'ny resaka."
      />
      <div className="mt-6 rounded-2xl bg-gradient-brand p-6 text-center text-primary-foreground shadow-elegant">
        <p className="whitespace-pre-line font-display text-lg font-bold leading-relaxed md:text-xl">
          {q.promptBefore}
          <span className="mx-1 inline-block min-w-[90px] rounded-md border-b-2 border-dashed border-white/70 align-middle">
            &nbsp;
          </span>
          {q.promptAfter}
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
      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Miverina
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
          Isa: {score}/{total} · Fanontaniana {Math.min(i + 1, total)}/{total}
        </span>
      </div>
    </div>
  );
}

/* ---------- 7. Speaking challenge ---------- */
function SpeakingStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setChecked((c) => {
      const n = new Set(c);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="🎯"
        title="Speaking Challenge"
        subtitle="Vakio mafy in-3 — tsindrio 🔊 raha te hihaino ny fanononana marina, ary 🎤 raha te hiezaka manaraka."
      />
      <div className="mt-6 space-y-2.5">
        {SPEAKING_LINES.map((line, i) => (
          <div
            key={`${line}-${i}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4"
          >
            <span className="font-semibold text-foreground">
              {i + 1}. {line}
            </span>
            <div className="flex items-center gap-2">
              <PronunciationButton text={line} ariaLabel={`Écouter : ${line}`} />
              <ShadowingButton text={line} ariaLabel={`Répéter : ${line}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-background p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-ink-soft">
          📱 Self-Check — Raketo amin'ny findainao ny feonao ary henoy indray
        </div>
        <div className="mt-3 space-y-2">
          {SELF_CHECK.map((item, i) => {
            const isChecked = checked.has(i);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggle(i)}
                className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-sm transition-colors hover:border-primary/30"
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                    isChecked ? "border-emerald-500 bg-emerald-500" : "border-border"
                  }`}
                >
                  {isChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </span>
                <span className={isChecked ? "text-foreground" : "text-ink-soft"}>{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-foreground">
        💡 <span className="font-semibold">Pro Tip:</span> {PRO_TIP}
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel="Vita" />
    </div>
  );
}

/* ---------- 8. Quick review ---------- */
function ReviewStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="animate-fade-up">
      <StepHeader
        emoji="✅"
        title="Quick Review"
        subtitle="Famerenana haingana — jereo indray alohan'ny hamaranana ny lesona."
      />
      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        {REVIEW_PAIRS.map((p, i) => (
          <div
            key={p.en}
            className={`flex items-center justify-between gap-3 px-4 py-3 text-sm ${
              i % 2 === 0 ? "bg-background" : "bg-muted/40"
            }`}
          >
            <span className="font-semibold text-foreground">{p.en}</span>
            <span className="text-right text-ink-soft">{p.mg}</span>
          </div>
        ))}
      </div>
      <StepNav onBack={onBack} onNext={onNext} nextLabel="Hamarana ny lesona" />
    </div>
  );
}

/* ---------- 9. Finish ---------- */
function FinishStep({
  xp,
  listeningScore,
  onRestart,
}: {
  xp: number;
  listeningScore: { correct: number; total: number } | null;
  onRestart: () => void;
}) {
  const { user } = useAuth();

  useEffect(() => {
    playLessonComplete();
  }, []);

  return (
    <div className="animate-pop-in text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-brand shadow-glow">
        <PartyPopper className="h-9 w-9 text-primary-foreground" />
      </div>
      <h2 className="mt-5 font-display text-3xl font-extrabold md:text-4xl">
        Vita ny Expression du jour! 🎉
      </h2>
      <p className="mx-auto mt-3 max-w-md text-ink-soft">
        Vao avy nianatra ny fomba filazana « <strong className="text-foreground">What's up?</strong>{" "}
        » amin'ny teny Anglisy ianao — anisan'ny expression fahita isan'andro any Amerika.
      </p>

      <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-background py-4">
          <div className="text-2xl font-extrabold text-gradient-brand">+{xp} XP</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
            Isa azo
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background py-4">
          <div className="text-2xl font-extrabold text-gradient-brand">
            {listeningScore ? `${listeningScore.correct}/${listeningScore.total}` : "—"}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
            Fihainoana
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm text-foreground">
        Mianara 10–15 minitra isan'andro ao amin'ny <strong>HiTako Academy</strong> — lesona
        mifanaraka aminao, ary miaraka amin'ny coach mivantana.
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-background"
        >
          <RotateCcw className="h-4 w-4" /> Avereno
        </button>
        <Link
          to={user ? "/mon-espace" : "/free-registration"}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
        >
          Misoratra anarana maimaim-poana <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <Link
          to="/expression-du-jour"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Expression du jour
        </Link>
        <Link
          to="/lecon-demo-18"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-primary hover:underline"
        >
          Essayer la leçon démo complète <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </p>
    </div>
  );
}
