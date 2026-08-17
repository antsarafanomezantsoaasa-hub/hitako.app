import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Flame,
  Layers,
  Loader2,
  PartyPopper,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { PronunciationButton } from "@/components/PronunciationButton";
import { useAuth } from "@/hooks/use-auth";
import { pronunciationService } from "@/lib/pronunciation";
import { playGameComplete, playCorrect, playPageTurn, playWrong } from "@/lib/sound-fx";
import { DECK_META, FLASHCARDS, type FlashCard } from "./jeux_.flashcards.content";

/**
 * /jeux/flashcards — HiTCards, the first playable game of the Game Arena.
 *
 * Standalone experience (no site chrome, own back button) exactly like the
 * lesson routes. Purely self-contained: it reads the Lesson 18 deck from
 * jeux_.flashcards.content.ts and touches no lesson logic, progress
 * tracking, auth or database code.
 *
 * The route file is `jeux_.flashcards.tsx` (trailing underscore) on purpose:
 * it serves /jeux/flashcards WITHOUT turning /jeux into a layout route.
 */
export const Route = createFileRoute("/jeux_/flashcards")({
  head: () => ({
    meta: [
      { title: "HiTCards — Karatra voambolana | HiTako Academy" },
      {
        name: "description",
        content:
          "Mianara voambolana anglisy amin'ny karatra mahafinaritra, mifototra amin'ny Lesona 18 “Asking for Help”.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: FlashcardsGamePage,
});

type Verdict = "known" | "unknown";
type TurnDirection = "to-back" | "to-front";

/** Duration of the flip-turn keyframe animation — kept in sync with the
 *  `card-flip-to-back` / `card-flip-to-front` keyframes in styles.css. */
const TURN_MS = 640;

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function FlashcardsGamePage() {
  const navigate = useNavigate();
  const { loading, user } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/connexion" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-member-canvas">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <FlashcardsGame />;
}

function FlashcardsGame() {
  const total = FLASHCARDS.length;

  const [queue, setQueue] = useState<FlashCard[]>(() => shuffle(FLASHCARDS));
  const [flipped, setFlipped] = useState(false);
  // Which way the card is turning right now, purely to drive the flip
  // keyframe animation (see toggleFlip below) — null once it's settled.
  const [turning, setTurning] = useState<TurnDirection | null>(null);
  const turnTimeoutRef = useRef<number | undefined>(undefined);
  const [mastered, setMastered] = useState<string[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [seen, setSeen] = useState(1);
  // Snapshot of the card that was just answered, kept alive for one beat so it
  // can play its exit animation (flies off as "mastered", or dips back down
  // as "returning to the deck") while the next card deals in underneath.
  const [justAnswered, setJustAnswered] = useState<{ card: FlashCard; verdict: Verdict } | null>(
    null,
  );
  const finishedRef = useRef(false);

  const card = queue[0];
  const done = queue.length === 0;
  const masteredCount = mastered.length;
  const progress = Math.round((masteredCount / total) * 100);
  const xp = masteredCount * DECK_META.xpPerCard;

  useEffect(() => {
    if (done && !finishedRef.current) {
      finishedRef.current = true;
      playGameComplete();
    }
  }, [done]);

  // Flip the card, playing the same "beautiful turn" animation whether
  // triggered by a click/tap on the card or the Space/Enter keyboard shortcut.
  const toggleFlip = useCallback(() => {
    playPageTurn();
    setTurning(flipped ? "to-front" : "to-back");
    window.clearTimeout(turnTimeoutRef.current);
    turnTimeoutRef.current = window.setTimeout(() => setTurning(null), TURN_MS);
    setFlipped((f) => !f);
  }, [flipped]);

  useEffect(() => () => window.clearTimeout(turnTimeoutRef.current), []);

  // Auto-play the real pronunciation the instant the card lands showing its
  // English face — no need to reach for the 🔊 button first. Flipping back
  // to Malagasy (or moving on) stops it immediately so clips never overlap.
  useEffect(() => {
    if (!flipped || !card) return;
    pronunciationService.speak(card.en, { speaker: card.speaker }).catch((err) => {
      // Autoplay can be blocked in rare cases (e.g. no prior user gesture) —
      // the 🔊 button on the card still works as a manual fallback.
      console.warn("[HiTCards] could not auto-play pronunciation", err);
    });
    return () => pronunciationService.stop();
  }, [flipped, card]);

  const answer = useCallback(
    (verdict: Verdict) => {
      // Self-rating works whether or not the card has been flipped — a
      // learner who already recalls the English shouldn't be forced to
      // reveal it just to move on.
      if (!card || justAnswered) return;

      setJustAnswered({ card, verdict });
      window.setTimeout(() => setJustAnswered(null), 420);

      if (verdict === "known") {
        playCorrect();
        setMastered((m) => [...m, card.id]);
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
        setQueue((q) => q.slice(1));
      } else {
        playWrong();
        setStreak(0);
        setReviewCount((r) => r + 1);
        // Send it back into the deck a few cards later — light spaced repetition.
        setQueue((q) => {
          const [head, ...rest] = q;
          const at = Math.min(3, rest.length);
          return [...rest.slice(0, at), head, ...rest.slice(at)];
        });
      }

      setFlipped(false);
      setSeen((s) => s + 1);
      window.clearTimeout(turnTimeoutRef.current);
      setTurning(null);
    },
    [card, justAnswered],
  );

  const restart = useCallback(() => {
    finishedRef.current = false;
    setQueue(shuffle(FLASHCARDS));
    setFlipped(false);
    window.clearTimeout(turnTimeoutRef.current);
    setTurning(null);
    setMastered([]);
    setReviewCount(0);
    setStreak(0);
    setBestStreak(0);
    setSeen(1);
    setJustAnswered(null);
  }, []);

  const shuffleRemaining = useCallback(() => {
    setFlipped(false);
    window.clearTimeout(turnTimeoutRef.current);
    setTurning(null);
    setQueue((q) => shuffle(q));
  }, []);

  // Keyboard play: space/enter flips, ← don't know, → know.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        toggleFlip();
      } else if (e.code === "ArrowLeft") {
        answer("unknown");
      } else if (e.code === "ArrowRight") {
        answer("known");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, done, toggleFlip]);

  return (
    <div className="min-h-screen bg-member-canvas">
      <GameTopBar title={DECK_META.title} subtitle={DECK_META.deckName} />

      <main className="mx-auto w-full max-w-xl px-5 pb-16 pt-6 md:px-8">
        {done ? (
          <ResultsScreen
            total={total}
            reviewCount={reviewCount}
            bestStreak={bestStreak}
            xp={xp}
            onRestart={restart}
          />
        ) : (
          <>
            <ProgressHeader
              masteredCount={masteredCount}
              total={total}
              progress={progress}
              seen={seen}
              remaining={queue.length}
              streak={streak}
            />

            <p className="mt-5 text-center text-sm text-ink-soft">{DECK_META.intro}</p>

            <div className="relative mt-5">
              <Flashcard
                key={`${card.id}-${seen}`}
                card={card}
                flipped={flipped}
                turning={turning}
                onFlip={toggleFlip}
              />
              {justAnswered && <CardExitOverlay verdict={justAnswered.verdict} />}
            </div>

            <p className="mt-4 text-center text-[11px] text-ink-soft">
              Azonao valiana avy hatrany ny karatra — tsy voatery mamadika azy aloha.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!!justAnswered}
                onClick={() => answer("unknown")}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-destructive/50 bg-destructive px-4 py-4 font-display text-sm font-bold text-destructive-foreground shadow-card transition hover:brightness-105 active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0 sm:text-base"
              >
                <X className="h-5 w-5 transition-transform group-active:scale-90" />
                Mbola tsy haiko
              </button>
              <button
                type="button"
                disabled={!!justAnswered}
                onClick={() => answer("known")}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-primary/60 bg-gradient-brand px-4 py-4 font-display text-sm font-bold text-primary-foreground shadow-elegant transition hover:brightness-105 active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0 sm:text-base"
              >
                <Check className="h-5 w-5 transition-transform group-active:scale-90" />
                Haiko
              </button>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={shuffleRemaining}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-ink-soft transition hover:bg-accent hover:text-foreground"
              >
                <Shuffle className="h-3.5 w-3.5" />
                Afangaro
              </button>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-ink-soft transition hover:bg-accent hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Atombohy indray
              </button>
            </div>

            <p className="mt-6 hidden text-center text-[11px] text-ink-soft md:block">
              Clavier : <kbd className="rounded bg-muted px-1.5 py-0.5 font-semibold">Espace</kbd>{" "}
              hamadika · <kbd className="rounded bg-muted px-1.5 py-0.5 font-semibold">←</kbd> tsy
              haiko · <kbd className="rounded bg-muted px-1.5 py-0.5 font-semibold">→</kbd> haiko
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function GameTopBar({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center gap-3 px-5 py-3 md:px-8">
        <Link
          to="/jeux"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Hiverina
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-extrabold text-foreground">{title}</p>
          <p className="truncate text-[11px] text-ink-soft">{subtitle}</p>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Layers className="h-4 w-4" />
        </span>
      </div>
    </header>
  );
}

function ProgressHeader({
  masteredCount,
  total,
  progress,
  seen,
  remaining,
  streak,
}: {
  masteredCount: number;
  total: number;
  progress: number;
  seen: number;
  remaining: number;
  streak: number;
}) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="inline-flex items-center gap-1.5 text-primary">
          <Check className="h-3.5 w-3.5" />
          Efa hainao amin'ity
        </span>
        <span className="text-foreground">
          {masteredCount} / {total}
        </span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-brand transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-ink-soft">
        <span>
          Karatra {seen} · sisa {remaining}
        </span>
        {streak >= 2 && (
          <span className="inline-flex animate-pop-in items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary">
            <Flame className="h-3 w-3" />
            {streak} misesy
          </span>
        )}
      </div>
    </div>
  );
}

function Flashcard({
  card,
  flipped,
  turning,
  onFlip,
}: {
  card: FlashCard;
  flipped: boolean;
  turning: "to-back" | "to-front" | null;
  onFlip: () => void;
}) {
  const turnClass =
    turning === "to-back"
      ? "animate-flip-to-back"
      : turning === "to-front"
        ? "animate-flip-to-front"
        : "";

  return (
    <div className="card3d animate-card-deal">
      <div
        role="button"
        tabIndex={0}
        aria-label="Tsindrio ny karatra hamadika azy"
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onFlip();
          }
        }}
        className={`card3d-inner ${flipped ? "card3d-flipped" : ""} ${turnClass} h-[19rem] w-full cursor-pointer rounded-3xl outline-none sm:h-[21rem]`}
      >
        {/* FRONT — Malagasy */}
        <CardFace className="bg-card">
          <span className="absolute left-5 top-5 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
            Malagasy
          </span>
          <p className="px-6 text-center font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
            {card.mg}
          </p>
          <span className="absolute bottom-6 text-[11px] text-ink-soft">
            Tsindrio ny karatra hamadika azy
          </span>
        </CardFace>

        {/* BACK — natural English */}
        <CardFace className="card3d-back absolute inset-0 bg-gradient-brand">
          <span className="absolute left-5 top-5 rounded-full bg-primary-foreground/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
            English
          </span>
          <div
            className="absolute right-4 top-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <PronunciationButton
              text={card.en}
              speaker={card.speaker}
              ariaLabel={`Henoy: ${card.en}`}
              className="bg-primary-foreground/20 shadow-none backdrop-blur"
            />
          </div>
          <p className="px-7 text-center font-display text-2xl font-extrabold leading-snug text-primary-foreground sm:text-3xl">
            {card.en}
          </p>
          {card.hint && (
            <p className="absolute bottom-6 left-6 right-6 text-center text-[11px] leading-relaxed text-primary-foreground/85">
              {card.hint}
            </p>
          )}
        </CardFace>
      </div>
    </div>
  );
}

function CardFace({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`card3d-face flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border border-border/70 shadow-elegant ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Sits on top of the freshly-dealt next card for one beat, showing the card
 * that was just answered as it exits: flying off when mastered ("Haiko!"),
 * or dipping back down when it's returning into the deck for another pass
 * ("Mbola tsy haiko" → light spaced repetition).
 */
function CardExitOverlay({ verdict }: { verdict: Verdict }) {
  const known = verdict === "known";
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 flex h-[19rem] items-center justify-center rounded-3xl border shadow-elegant sm:h-[21rem] ${
        known
          ? "animate-card-master-out border-primary/30 bg-gradient-brand"
          : "animate-card-return-out border-border/70 bg-card"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <span
          className={`grid h-14 w-14 place-items-center rounded-2xl ${
            known ? "bg-white/20 text-primary-foreground" : "bg-muted text-ink-soft"
          }`}
        >
          {known ? (
            <Check className="h-7 w-7" strokeWidth={3} />
          ) : (
            <RotateCcw className="h-7 w-7" />
          )}
        </span>
        <p
          className={`font-display text-sm font-bold ${known ? "text-primary-foreground" : "text-ink-soft"}`}
        >
          {known ? "Haiko! ✨" : "Hiverina any aoriana"}
        </p>
      </div>
    </div>
  );
}

function ResultsScreen({
  total,
  reviewCount,
  bestStreak,
  xp,
  onRestart,
}: {
  total: number;
  reviewCount: number;
  bestStreak: number;
  xp: number;
  onRestart: () => void;
}) {
  const perfect = reviewCount === 0;
  return (
    <div className="animate-pop-in mt-8 rounded-3xl border border-border bg-card p-8 text-center shadow-elegant">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
        <PartyPopper className="h-8 w-8" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-extrabold text-foreground">
        Vita ny karatra rehetra!
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        {perfect
          ? "Tsy nisy karatra naverina — tena mahafinaritra izany!"
          : `Naverinao ${reviewCount} indray mandeha ny karatra sasany — izay indrindra no mampitadidy.`}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <ResultStat icon={Sparkles} value={`${xp}`} label="XP" />
        <ResultStat icon={Layers} value={`${total}`} label="Karatra" />
        <ResultStat icon={Trophy} value={`${bestStreak}`} label="Misesy" />
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-3 font-display text-sm font-bold text-primary-foreground shadow-elegant transition hover:opacity-95"
        >
          <RotateCcw className="h-4 w-4" />
          Averina indray
        </button>
        <Link
          to="/jeux"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Hiverina any amin'ny kilalao
        </Link>
      </div>
    </div>
  );
}

function ResultStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Sparkles;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 px-2 py-4">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1.5 font-display text-xl font-extrabold text-foreground">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
    </div>
  );
}
