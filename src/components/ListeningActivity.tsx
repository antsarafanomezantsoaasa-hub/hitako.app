import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Headphones, Loader2, Play, Turtle, Volume2, X } from "lucide-react";
import { pronunciationService } from "@/lib/pronunciation";
import type { PlaybackSpeed, PronunciationState, SpeakerId } from "@/lib/pronunciation";
import { playCorrect, playWrong } from "@/lib/sound-fx";
import { useSpeedCycle } from "@/hooks/use-speed-cycle";

/**
 * Reusable listening comprehension activity.
 *
 * - Plays a transcript (short or long) via the shared PronunciationService (TTS).
 * - Students can replay the audio as many times as they want before answering.
 * - Only ONE attempt per question. Wrong answers reveal the correct one + a
 *   short explanation, then auto-advance to the next question.
 * - Reports its own score via `onFinish(score, total)`; the parent lesson keeps
 *   this separate from any other quiz score.
 * - Fully responsive: works with keyboard, touch, and pointer input.
 */

export interface ListeningQuestion {
  question: string;
  options: string[];
  /** Must match one of `options` exactly. */
  correct: string;
  /** Short explanation shown after an incorrect answer. */
  explanation?: string;
}

export interface ListeningTranscriptLine {
  speaker?: SpeakerId;
  text: string;
}

export interface ListeningActivityProps {
  /** Emoji/icon prefix for the header. Defaults to 🎧. */
  emoji?: string;
  /** Header title (usually Malagasy). */
  title: string;
  /** Optional subtitle shown under the title. */
  subtitle?: string;
  /**
   * Transcript to play. A single string plays with the default voice. An
   * array of lines can carry a per-line speaker for short dialogues/stories.
   */
  transcript: string | ListeningTranscriptLine[];
  /** Default voice used when transcript items don't declare their own. */
  speaker?: SpeakerId;
  /** 3–5 multiple-choice questions. */
  questions: ListeningQuestion[];
  /** Optional label shown above the audio player (e.g. "Audio 1 · 2–3 phrases"). */
  audioLabel?: string;
  /** Called when the student finishes all questions with their score. */
  onFinish: (score: number, total: number) => void;
  /** Optional back button; hidden when omitted. */
  onBack?: () => void;
  /** Label for the "next" button on the summary screen. */
  nextLabel?: string;
  /** Text shown in the audio "reveal transcript" toggle. Defaults to Malagasy label. */
  transcriptToggleLabel?: string;
}

export function ListeningActivity({
  emoji = "🎧",
  title,
  subtitle,
  transcript,
  speaker,
  questions,
  audioLabel,
  onFinish,
  onBack,
  nextLabel = "Manaraka",
  transcriptToggleLabel = "Asehoy ny lahatsoratra",
}: ListeningActivityProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [done, setDone] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  const total = questions.length;
  const q = questions[index];

  const pick = (opt: string) => {
    if (picked || !q) return;
    const good = opt === q.correct;
    setPicked(opt);
    setReveal(true);
    if (good) {
      playCorrect();
      setScore((s) => s + 1);
    } else {
      playWrong();
    }
    // Auto-advance to the next question; final one moves to the summary.
    advanceTimer.current = window.setTimeout(
      () => {
        if (index + 1 >= total) {
          setDone(true);
        } else {
          setIndex((n) => n + 1);
          setPicked(null);
          setReveal(false);
        }
      },
      good ? 1200 : 2200,
    );
  };

  const handleFinish = () => onFinish(score, total);

  return (
    <div className="animate-fade-up">
      <ListeningHeader emoji={emoji} title={title} subtitle={subtitle} />

      <AudioPlayer
        transcript={transcript}
        speaker={speaker}
        label={audioLabel}
        showTranscript={showTranscript}
        onToggleTranscript={() => setShowTranscript((v) => !v)}
        transcriptToggleLabel={transcriptToggleLabel}
      />

      {!done ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-soft">
            <span>
              Fanontaniana {index + 1} / {total}
            </span>
            <span>
              Isa: {score}/{total}
            </span>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="font-display text-base font-semibold leading-relaxed text-foreground md:text-lg">
              {q.question}
            </p>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {q.options.map((opt) => {
                const isPicked = picked === opt;
                const isCorrect = reveal && opt === q.correct;
                const isWrong = reveal && isPicked && opt !== q.correct;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => pick(opt)}
                    disabled={!!picked}
                    aria-pressed={isPicked}
                    className={[
                      "flex items-center justify-between gap-2 rounded-xl border p-3 text-left text-sm font-semibold transition-all",
                      !picked &&
                        "border-border bg-card hover:-translate-y-0.5 hover:border-primary/40",
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
                    <span>{opt}</span>
                    {isCorrect && <Check className="h-4 w-4 shrink-0" />}
                    {isWrong && <X className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {reveal && picked && picked !== q.correct && (
              <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/5 p-3 text-sm text-foreground">
                <div className="font-semibold text-rose-700 dark:text-rose-300">
                  Diso — valiny marina: <span className="underline">{q.correct}</span>
                </div>
                {q.explanation && <p className="mt-1 text-xs text-ink-soft">{q.explanation}</p>}
              </div>
            )}
            {reveal && picked === q.correct && (
              <div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/5 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Marina! 🎉
                {q.explanation && (
                  <p className="mt-1 text-xs font-normal text-ink-soft">{q.explanation}</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-elegant">
            <Headphones className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-display text-lg font-extrabold text-foreground">
            Vita ny fanazaran-tena fihainoana!
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Naharatra <strong className="text-foreground">{score}</strong> / {total} ianao amin'ity
            fizarana ity.
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-end border-t border-border pt-6">
        <button
          type="button"
          onClick={handleFinish}
          disabled={!done}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {nextLabel} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ListeningHeader({
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

/* ---------- Responsive audio player ---------- */
function AudioPlayer({
  transcript,
  speaker,
  label,
  showTranscript,
  onToggleTranscript,
  transcriptToggleLabel,
}: {
  transcript: string | ListeningTranscriptLine[];
  speaker?: SpeakerId;
  label?: string;
  showTranscript: boolean;
  onToggleTranscript: () => void;
  transcriptToggleLabel: string;
}) {
  const [state, setState] = useState<PronunciationState>("idle");
  const [playCount, setPlayCount] = useState(0);
  const [activeSpeed, setActiveSpeed] = useState<PlaybackSpeed>("normal");
  const cancelRef = useRef(false);
  const { advance, reset } = useSpeedCycle();

  const lines: ListeningTranscriptLine[] =
    typeof transcript === "string" ? [{ text: transcript, speaker }] : transcript;
  const transcriptKey = lines.map((l) => l.text).join("|");

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  // A different transcript (new question/lesson) always starts back at
  // normal speed rather than continuing wherever the previous one's cycle
  // left off.
  useEffect(() => {
    reset();
    setActiveSpeed("normal");
    setPlayCount(0);
  }, [transcriptKey, reset]);

  const play = useCallback(async () => {
    if (state === "loading" || state === "playing") return;
    cancelRef.current = false;
    setPlayCount((n) => n + 1);
    const speed = advance();
    setActiveSpeed(speed);
    setState("loading");
    try {
      for (const line of lines) {
        if (cancelRef.current) break;
        await pronunciationService.speak(line.text, {
          speaker: line.speaker ?? speaker,
          speed,
          onStateChange: (s) => setState(s),
        });
      }
    } catch (err) {
      console.warn("[ListeningActivity] audio playback failed", err);
    } finally {
      setState("idle");
    }
  }, [lines, speaker, state, advance]);

  const isLoading = state === "loading";
  const isPlaying = state === "playing" || isLoading;
  const isSlow = activeSpeed === "slow";

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02]">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={play}
            aria-label={
              (isPlaying ? "Manao ny feo" : "Alefaso ny feo") + (isSlow ? " (miadana)" : "")
            }
            title={isSlow ? "Vitesse lente" : undefined}
            disabled={isLoading}
            className={[
              "grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-elegant transition-transform hover:scale-105 active:scale-95 disabled:opacity-50",
              state === "playing" ? "animate-pulse" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : state === "playing" && isSlow ? (
              <Turtle className="h-6 w-6" />
            ) : state === "playing" ? (
              <Volume2 className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-widest text-primary">
              {label ?? "Audio · fihainoana"}
            </div>
            <div className="text-sm font-semibold text-foreground">
              {isPlaying
                ? isSlow
                  ? "Mihaino miadana..."
                  : "Mihaino..."
                : playCount === 0
                  ? "Tsindrio hihaino"
                  : `Nohenoinao in-${playCount}. Azo averina indray.`}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleTranscript}
          className="self-start rounded-full border border-primary/25 bg-card px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5 sm:self-auto"
        >
          {showTranscript ? "Afeno ny lahatsoratra" : transcriptToggleLabel}
        </button>
      </div>
      {showTranscript && (
        <div className="border-t border-primary/15 bg-background/60 px-5 py-4">
          <ul className="space-y-1.5 text-sm leading-relaxed text-foreground">
            {lines.map((line, i) => (
              <li key={i}>
                {typeof transcript !== "string" && line.speaker ? (
                  <span className="mr-1.5 font-semibold text-primary">{line.speaker}:</span>
                ) : null}
                {line.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
