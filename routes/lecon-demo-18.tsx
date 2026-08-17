import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getFreeHomeHref } from "@/lib/free-tier";
import { LessonRatingDialog } from "@/components/site/LessonRatingDialog";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Eye,
  Gift,
  Headphones,
  Layers,
  MessageCircle,
  Mic,
  PartyPopper,
  PencilLine,
  RotateCcw,
  Target,
  X,
} from "lucide-react";
import { PronunciationButton } from "@/components/PronunciationButton";
import { pronunciationService } from "@/lib/pronunciation";
import { ShadowingButton } from "@/components/ShadowingButton";
import { ListeningActivity } from "@/components/ListeningActivity";
import { playCorrect, playLessonComplete, playPageTurn, playWrong } from "@/lib/sound-fx";
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
} from "./lecon-demo-18.content";

export const Route = createFileRoute("/lecon-demo-18")({
  head: () => ({
    meta: [
      { title: 'Demo Lesson gratuite — Leçon 18 "Asking for Help" | HiTako Academy' },
      {
        name: "description",
        content:
          "Essayez gratuitement une vraie leçon HiT START : histoire, dialogue, vocabulaire, prononciation, exercices et mission réelle, expliqués en malgache.",
      },
      { property: "og:title", content: "Demo Lesson — HiT START, Leçon 18" },
      {
        property: "og:description",
        content:
          "Une leçon complète et gratuite pour découvrir la méthode HiTako Academy avant de vous inscrire.",
      },
    ],
  }),
  component: DemoLessonPage,
});

/* ================================================================
   Lesson content — Lesson 18: Asking for Help
   (dialogue, vocab, pronunciation, mission phrases, and listening
   transcripts now live in ./lecon-demo-18.content.ts — see that file's
   header for why)
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
  { phase: "listening1", label: "Fihainoana voalohany", icon: Headphones },
  { phase: "pronunciation", label: "Fanononana", icon: Mic },
  { phase: "fill", label: "Fenoy ny banga", icon: PencilLine },
  { phase: "roleplay", label: "Role-play", icon: MessageCircle },
  { phase: "match", label: "Ampifandraiso", icon: Layers },
  { phase: "listening2", label: "Fihainoana faharoa", icon: Headphones },
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
    en: "Emma is at the train station. She wants to buy a ticket, but she doesn't understand the machine. She feels a little nervous.",
    mg: "Ao amin'ny gara i Emma. Te hividy tapakila izy, saingy tsy hainy ny mampiasa ilay milina. Somary mitebiteby izy.",
  },
  {
    en: "She sees a station worker nearby. Emma takes a deep breath and asks politely: \u201cExcuse me, could you please help me?\u201d",
    mg: "Nahita mpiasan'ny gara teo akaiky teo izy. Naka rivotra lalina i Emma ary nanontany tamim-panajana hoe: \u201cAzafady tompoko, afaka manampy ahy ve ianao?\u201d",
  },
  {
    en: "The worker smiles and says, \u201cOf course! What do you need?\u201d",
    mg: "Nitsiky ilay mpiasa ary niteny hoe: \u201cMazava ho azy! Inona no azoko anampiana anao?\u201d",
  },
  {
    en: "Emma explains, \u201cI want to buy a ticket to the city, but I don't know how to use this machine.\u201d",
    mg: "Nanazava i Emma hoe: \u201cTe hividy tapakila mankany an-tanàn-dehibe aho, saingy tsy haiko ny mampiasa ity milina ity.\u201d",
  },
  {
    en: "The worker shows her how to do it, and Emma thanks him happily.",
    mg: "Natoron'ilay mpiasa azy ny fampiasana izany, ary faly i Emma nisaotra azy.",
  },
];

const FILL_QUESTIONS: { before: string; after: string; options: string[]; correct: string }[] = [
  {
    before: "\u201c",
    after: " me, could you please help me?\u201d",
    options: ["Excuse", "Sorry", "Please"],
    correct: "Excuse",
  },
  {
    before: "\u201cI want to buy a ",
    after: " to the city.\u201d",
    options: ["ticket", "machine", "show"],
    correct: "ticket",
  },
  {
    before: "\u201cThe worker will ",
    after: " me how to use the machine.\u201d",
    options: ["show", "thank", "buy"],
    correct: "show",
  },
];

const ROLEPLAY_PROMPTS: { situation: string; mg: string; model: string }[] = [
  {
    situation: "Finding a seat",
    mg: "Mitady toerana hipetrahana",
    model: "Excuse me, could you please help me find a seat?",
  },
  {
    situation: "Ordering food",
    mg: "Manafatra sakafo",
    model: "Excuse me, could you please help me order some food?",
  },
  {
    situation: "Asking about Wi-Fi",
    mg: "Manontany ny tenimiafina Wi-Fi",
    model: "Excuse me, could you please tell me the Wi-Fi password?",
  },
];

const MATCH_PAIRS: { term: string; def: string }[] = [
  { term: "Ticket", def: "A card you buy to travel or enter somewhere" },
  { term: "Help", def: "To assist someone" },
  { term: "Machine", def: "An electronic device" },
  { term: "Gratitude", def: "An expression of thanks" },
  { term: "Polite", def: "Showing good manners" },
];

/* ================================================================
   Page
   ================================================================ */
function DemoLessonPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [xp, setXp] = useState(0);
  // Listening activity scores are tracked separately from the other exercises
  // so lessons can surface / persist them independently of the final quiz.
  const [listening1Score, setListening1Score] = useState<{ correct: number; total: number } | null>(
    null,
  );
  const [listening2Score, setListening2Score] = useState<{ correct: number; total: number } | null>(
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
              {phase === "intro" && <IntroStep onStart={() => goTo("story")} />}
              {phase === "story" && <StoryStep onNext={goNext} onBack={goBack} />}
              {phase === "dialogue" && <DialogueStep onNext={goNext} onBack={goBack} />}
              {phase === "vocab" && <VocabStep onNext={goNext} onBack={goBack} />}
              {phase === "listening1" && (
                <ListeningActivity
                  title="Listening 1 — Vocabulary"
                  subtitle="Henoy tsara ilay feo (azo averina imbetsaka), dia valio ny fanontaniana avy eo. Valiny iray isaky ny fanontaniana ihany loatra o!"
                  audioLabel="Audio 1 · 2–3 fehezanteny"
                  transcript={LISTENING1_TRANSCRIPT}
                  questions={LISTENING1_QUESTIONS}
                  onBack={goBack}
                  onFinish={(correct, total) => {
                    setListening1Score({ correct, total });
                    // Lesson progression is unchanged: the student always moves on,
                    // regardless of their listening score.
                    goNext();
                  }}
                />
              )}
              {phase === "pronunciation" && <PronunciationStep onNext={goNext} onBack={goBack} />}
              {phase === "fill" && <FillStep onNext={gainAndNext} onBack={goBack} />}
              {phase === "roleplay" && (
                <RoleplayStep onNext={() => gainAndNext(15)} onBack={goBack} />
              )}
              {phase === "match" && <MatchStep onNext={gainAndNext} onBack={goBack} />}
              {phase === "listening2" && (
                <ListeningActivity
                  title="Listening 2 — Understanding the lesson"
                  subtitle="Resadresaka lava kokoa (30–60 segondra). Henoy tsara (azo averina), avy eo valio ny fanontaniana 5. Iray ihany ny valiny azo omena isaky ny fanontaniana."
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
                  listening1Score={listening1Score}
                  listening2Score={listening2Score}
                  onRestart={() => {
                    setXp(0);
                    setListening1Score(null);
                    setListening2Score(null);
                    goTo("intro");
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* End-of-lesson satisfaction popup (1–5 stars). Signed-in learners
          only — anonymous visitors simply never see it. */}
      <LessonRatingDialog
        active={phase === "finish"}
        lessonSlug="lecon-demo-18"
        lessonNumber={18}
        lessonTitle="ity lesona demo ity"
      />
    </div>
  );
}

/* ---------- Hero ---------- */
function LessonHero() {
  // /lecon-demo-18 has two entry points with two different goals:
  // - an existing "free" member coming from /zero, previewing a lesson
  //   before confirming/paying — send them back to that flow.
  // - a brand-new, anonymous visitor (the common case since /lecons-demo
  //   now redirects here) — for them the goal is a first registration, so
  //   a "back to registration" link would be a dead end (it just bounces
  //   through /connexion). Send them home instead.
  const { user, role, profile } = useAuth();
  const isFreeMember = !!user && role === "free";
  const freeHomeHref = getFreeHomeHref(profile?.preferred_format);

  return (
    <section className="relative overflow-hidden px-5 pt-10 pb-6 md:px-8 md:pt-16">
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-15 blur-3xl" />
      <div className="mx-auto max-w-3xl text-center">
        {isFreeMember ? (
          <Link
            to={freeHomeHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Miverina amin'ny fisoratana anarana
          </Link>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Retour à l'accueil
          </Link>
        )}
        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-600">
          <Gift className="h-3.5 w-3.5" /> Demo Lesson · 100% maimaim-poana
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-5xl">
          Lesson 18: <span className="text-gradient-brand">Asking for Help</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">
          Andramo ity lesona feno avy amin'ny fandaharana{" "}
          <strong className="text-foreground">HiT START</strong> ity — mba hahitanao sahady ny fomba
          fianarana ao amin'ny HiTako Academy.
        </p>
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
        <Gift className="h-3.5 w-3.5" /> Free Demo Lesson
      </div>
      <h2 className="mt-5 font-display text-2xl font-extrabold leading-tight md:text-3xl">
        Welcome to <span className="text-gradient-brand">HiT START</span> 👋
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-ink-soft">
        Ity no <strong className="text-foreground">Lesona faha-18 amin'ireo lesona 80</strong> ao
        amin'ny fandaharam-pianarana feno ho an'ireo vao mianatra. Andramo maimaim-poana izany mba
        hahitanao ny fomba fianarana eto amin'ny HiTako, alohan'ny handraisanao fanapahan-kevitra.
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
        <strong>CEFR A2</strong> ianao, ary ho afaka hiresaka amim-pahatokiana amin'ny fiainana
        andavanandro.
      </div>

      <div className="mx-auto mt-8 max-w-md rounded-2xl bg-gradient-brand p-5 text-left text-primary-foreground shadow-elegant">
        <div className="text-[11px] font-bold uppercase tracking-widest text-white/75">
          Lesson 18
        </div>
        <div className="mt-1 font-display text-xl font-extrabold">Asking for Help</div>
        <div className="mt-1 text-sm text-white/85">
          🌟 Ahoana ny fomba fangatahana fanampiana amim-panajana
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-8 py-4 text-base font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 hover:shadow-glow"
      >
        Atombohy ny lesona <ArrowRight className="h-5 w-5" />
      </button>
      <p className="mt-3 text-xs text-ink-soft">
        ⏱ Tombanana haharitra 15 minitra eo ho eo — maimaim-poana tanteraka.
      </p>
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
        subtitle="Vakio ilay tantara. Tsindrio ny « Dikany amin'ny teny Malagasy » raha misy teny tsy azonao tsara."
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
                <Eye className="h-3.5 w-3.5" /> Dikany amin'ny teny Malagasy
              </button>
            )}
          </div>
        ))}
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
        subtitle="Tsindrio ny bokotra 🔊 mba hihainoana ny fanononana marina."
      />
      <div className="mt-6 space-y-3">
        {DIALOGUE.map((line, i) => {
          const isEmma = line.speaker === "Emma";
          return (
            <div key={i} className={`flex items-end gap-2.5 ${isEmma ? "" : "flex-row-reverse"}`}>
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${
                  isEmma ? "bg-rose-400" : "bg-sky-500"
                }`}
                aria-hidden
              >
                {isEmma ? "E" : "W"}
              </div>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                  isEmma
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
                ariaLabel={`Écouter : ${line.text}`}
              />
              <ShadowingButton
                text={line.text}
                speaker={SPEAKER_VOICE[line.speaker]}
                size="sm"
                ariaLabel={`Répéter : ${line.text}`}
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
        subtitle="Ireto avy ireo voambolana fototra amin'ity lesona ity."
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {VOCAB.map((v) => (
          <div key={v.en} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-base font-bold text-primary">{v.en}</span>
              <div className="flex items-center gap-1.5">
                <PronunciationButton text={v.en} size="sm" ariaLabel={`Écouter : ${v.en}`} />
                <ShadowingButton text={v.en} size="sm" ariaLabel={`Répéter : ${v.en}`} />
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
        subtitle="Henoy tsara ny fanononana, avereno mora aloha, ary ampiakaro tsikelikely ny hafainganam-piteninao."
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
              <PronunciationButton text={p.en} ariaLabel={`Écouter : ${p.en}`} />
              <ShadowingButton text={p.en} ariaLabel={`Répéter : ${p.en}`} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-foreground">
        💡 Torolalana: Tsindrio ny 🔊, henoy tsara, ary avereno mafy in-droa na in-telo. Ny
        fanononana no lakilen'ny fahatokisan-tena rehefa miteny Anglisy.
      </div>
      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

/* ---------- 5. Fill in the blanks ---------- */
function FillStep({ onNext, onBack }: { onNext: (gained: number) => void; onBack: () => void }) {
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
        title="Fenoy ny banga"
        subtitle={`Safidio ny teny mifanaraka. Fanontaniana ${i + 1}/${total}.`}
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
        title="Role-play: Ao amin'ny cafeteria"
        subtitle="Alao sary an-tsaina hoe ao amin'ny toerana fisotroana kafe ianao ary mila fanampiana amin'ny mpiasa ao."
      />
      <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
        <span className="font-semibold">Ohatra:</span> “Excuse me, could you please help me? I'd
        like to see the menu.”
      </div>
      <p className="mt-6 text-sm font-semibold text-foreground">
        Ankehitriny, andramo foronina ny resaka ho an'ireto tranga manaraka ireto:
      </p>
      <div className="mt-4 space-y-4">
        {ROLEPLAY_PROMPTS.map((r, i) => (
          <div key={r.situation} className="rounded-2xl border border-border bg-background p-4">
            <div className="font-semibold text-foreground">{r.situation}</div>
            <div className="text-xs text-ink-soft">{r.mg}</div>
            <textarea
              value={answers[i] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
              placeholder="Soraty eto ny fanontanianao amim-panajana…"
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
        subtitle="Tsindrio ny teny iray eo ankavia, ary tsindrio ny dikany mifanaraka aminy eo ankavanana."
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
            <CheckCircle2 className="h-4 w-4" /> Vita daholo! Mandroso…
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
        subtitle="Andramo tononina mafy ireto fehezanteny ireto, toy ny hoe tena ao anatin'izany tranga izany tokoa ianao."
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
                aria-label="Voamarina"
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                  done.has(i) ? "border-emerald-500 bg-emerald-500" : "border-border"
                }`}
              >
                {done.has(i) && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-muted/60 px-3 py-2.5">
              <span className="flex-1 text-sm font-semibold text-foreground">“{s.phrase}”</span>
              <PronunciationButton text={s.phrase} size="sm" ariaLabel={`Écouter : ${s.phrase}`} />
              <ShadowingButton text={s.phrase} size="sm" ariaLabel={`Répéter : ${s.phrase}`} />
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
  listening1Score,
  listening2Score,
  onRestart,
}: {
  xp: number;
  listening1Score: { correct: number; total: number } | null;
  listening2Score: { correct: number; total: number } | null;
  onRestart: () => void;
}) {
  // Same split as LessonHero: a "free" member who came from /zero to preview
  // this lesson is already registered, so the natural next step is to go
  // confirm/pay there. Everyone else — the new default path, now that
  // /lecons-demo redirects straight here — hasn't registered at all yet, so
  // the CTA that actually moves the needle for them is creating a free
  // account, not "confirming" a registration they don't have.
  const { user, role, profile } = useAuth();
  const isFreeMember = !!user && role === "free";
  const freeHomeHref = getFreeHomeHref(profile?.preferred_format);

  useEffect(() => {
    playLessonComplete();
  }, []);

  return (
    <div className="animate-pop-in text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-brand shadow-glow">
        <PartyPopper className="h-9 w-9 text-primary-foreground" />
      </div>
      <h2 className="mt-5 font-display text-3xl font-extrabold md:text-4xl">
        Vita ny Lesona faha 18! 🎉
      </h2>
      <p className="mx-auto mt-3 max-w-md text-ink-soft">
        Vao avy nianatra ny fomba fangatahana fanampiana amim-panajana amin'ny teny Anglisy ianao —
        tahaka izao ny fomba fianarana ao amin'ny{" "}
        <strong className="text-foreground">HiT START</strong>, isan'andro, mandritra ny 2 volana.
      </p>

      <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-background py-4">
          <div className="text-2xl font-extrabold text-gradient-brand">+{xp} XP</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
            Isa azo
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background py-4">
          <div className="text-2xl font-extrabold text-gradient-brand">18/80</div>
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
              Fihainoana voalohany
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background py-4">
            <div className="text-xl font-extrabold text-primary">
              {listening2Score ? `${listening2Score.correct}/${listening2Score.total}` : "—"}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
              Fihainoana faharoa
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm text-foreground">
        Mbola misy lesona <strong>79</strong> hafa miandry anao — momba ny fianakaviana, ny asa, ny
        fiantsenana, ny fikarakarana tena, ary maro hafa — mandra-pahatratranao ny{" "}
        <strong>CEFR A2</strong>.
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-background"
        >
          <RotateCcw className="h-4 w-4" /> Avereno
        </button>
        {isFreeMember ? (
          <Link
            to={freeHomeHref}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
          >
            Hanamafy ny fisoratako anarana <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            to="/free-registration"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
          >
            Misoratra anarana maimaim-poana <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <p className="mt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour à l'accueil
        </Link>
      </p>
    </div>
  );
}
