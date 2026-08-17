import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Loader2, Mic, Play, RotateCcw, Turtle, Volume2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { pronunciationService } from "@/lib/pronunciation";
import type { PlaybackSpeed, SpeakerId } from "@/lib/pronunciation";
import { setPreservesPitch, SLOW_PLAYBACK_RATE } from "@/lib/audio-playback-rate";
import { useSpeedCycle } from "@/hooks/use-speed-cycle";
import {
  shadowingService,
  CountdownCancelledError,
  SessionCancelledError,
  MicrophoneUnavailableError,
} from "@/lib/shadowing";
import type { ShadowingMode, ShadowingPhase, ShadowingSessionHandle } from "@/lib/shadowing";

/**
 * The full UI for one shadowing attempt: resolves a reference clip, then
 * drives ShadowingService through countdown → recording → playback, all
 * inside a modal. This is the component ShadowingButton.tsx opens.
 *
 * Local `Stage` extends `ShadowingPhase` with a couple of states that live
 * entirely on this side (resolving the reference clip, or that clip being
 * unavailable) — ShadowingService only ever knows about a session once one
 * actually starts.
 */
type Stage = "loading-reference" | "reference-unavailable" | "ready" | ShadowingPhase | "mic-error";

type Locale = "mg" | "fr";

interface Copy {
  instructions: Record<
    | "ready"
    | "loading"
    | "unavailable"
    | "countdown"
    | "playingReference"
    | "recording"
    | "processing"
    | "completed"
    | "micError"
    | "error",
    string
  >;
  modeSimultaneous: string;
  modeSequential: string;
  start: string;
  stop: string;
  tryAgain: string;
  done: string;
  retry: string;
  compare: string;
  yourRecording: string;
  go: string;
  dialogPurpose: string;
}

const COPY: Record<Locale, Copy> = {
  fr: {
    instructions: {
      ready: "Écoutez, puis répétez la phrase à voix haute en même temps que l'audio.",
      loading: "Préparation de l'audio…",
      unavailable: "Audio de référence indisponible pour cette phrase pour le moment.",
      countdown: "Préparez-vous…",
      playingReference: "Écoutez bien…",
      recording: "Parlez maintenant !",
      processing: "Finalisation de l'enregistrement…",
      completed: "Bravo, voici votre enregistrement !",
      micError:
        "Micro indisponible. Vérifiez que l'accès au micro est autorisé dans votre navigateur.",
      error: "Une erreur est survenue. Réessayez.",
    },
    modeSimultaneous: "En même temps",
    modeSequential: "Écouter puis répéter",
    start: "Commencer",
    stop: "Arrêter",
    tryAgain: "Recommencer",
    done: "Terminé",
    retry: "Réessayer",
    compare: "Réécouter l'original",
    yourRecording: "Votre enregistrement",
    go: "Parlez !",
    dialogPurpose:
      "Écoutez la phrase, puis répétez-la à voix haute pour vous entraîner à la prononciation.",
  },
  mg: {
    instructions: {
      ready: "Henoy ny feo, ary avereno mafy miaraka aminy.",
      loading: "Fiomanana ny feo…",
      unavailable: "Mbola tsy vonona ny feo ho an'ity fehezanteny ity.",
      countdown: "Miomàna…",
      playingReference: "Henoy tsara…",
      recording: "Miteny izao!",
      processing: "Mamita ny fandraisana…",
      completed: "Tsara be! Indro ny feonao voarakitra.",
      micError:
        "Tsy azo ampiasaina ny mikro. Amarino fa nomenao alalana ny mikro ao amin'ny navigateur.",
      error: "Nisy olana. Andramo indray.",
    },
    modeSimultaneous: "Miaraka amin'ny feo",
    modeSequential: "Henoy aloha, avereno avy eo",
    start: "Manomboka",
    stop: "Ajanony",
    tryAgain: "Avereno",
    done: "Vita",
    retry: "Andramo indray",
    compare: "Henoy indray ny tany am-boalohany",
    yourRecording: "Ny feonao",
    go: "Miteny!",
    dialogPurpose: "Henoy ny fehezanteny, ary avereno mafy mba hanazaran-tena amin'ny fanononana.",
  },
};

export interface ShadowingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** English line the learner is shadowing. */
  text: string;
  speaker?: SpeakerId;
  /** Defaults to French, same convention as ShadowingButton/PronunciationButton. */
  locale?: Locale;
}

function formatMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ShadowingModal({
  open,
  onOpenChange,
  text,
  speaker,
  locale = "fr",
}: ShadowingModalProps) {
  const t = COPY[locale];

  const [stage, setStage] = useState<Stage>("loading-reference");
  const [mode, setMode] = useState<ShadowingMode>("simultaneous");
  const [countdownValue, setCountdownValue] = useState(3);
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);
  const [recordingElapsedMs, setRecordingElapsedMs] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isRecordingPlaying, setIsRecordingPlaying] = useState(false);
  const [previewSpeed, setPreviewSpeed] = useState<PlaybackSpeed>("normal");
  const [recordingSpeed, setRecordingSpeed] = useState<PlaybackSpeed>("normal");
  const previewSpeedCycle = useSpeedCycle();
  const recordingSpeedCycle = useSpeedCycle();

  const attemptIdRef = useRef(0);
  const sessionRef = useRef<ShadowingSessionHandle | null>(null);
  const referenceUrlRef = useRef<string | null>(null);
  const recordingUrlRef = useRef<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordingAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordingStartRef = useRef<number | null>(null);

  /** (Re)resolve the reference clip for the current phrase. Also used by the "retry" button. */
  const resolveReference = useCallback(() => {
    const attemptId = ++attemptIdRef.current;
    setStage("loading-reference");
    pronunciationService
      .getReferenceBlob(text, { speaker })
      .then((blob) => {
        if (attemptIdRef.current !== attemptId) return; // superseded by a newer open/retry
        const url = URL.createObjectURL(blob);
        referenceUrlRef.current = url;
        setReferenceUrl(url);
        setStage("ready");
      })
      .catch((err) => {
        if (attemptIdRef.current !== attemptId) return;
        console.warn("[ShadowingModal] reference audio unavailable", err);
        setStage("reference-unavailable");
      });
  }, [text, speaker]);

  // Resolve (or re-resolve) the reference clip every time the dialog opens.
  // A fresh phrase/attempt always starts its tap-speed cycle back at normal.
  useEffect(() => {
    if (!open) return;
    setRecordingUrl(null);
    previewSpeedCycle.reset();
    recordingSpeedCycle.reset();
    setPreviewSpeed("normal");
    setRecordingSpeed("normal");
    resolveReference();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resolveReference]);

  // Full teardown whenever the dialog closes: abort any in-flight session,
  // stop any playback, and release object URLs so they don't leak.
  useEffect(() => {
    if (open) return;
    attemptIdRef.current++; // invalidate any reference fetch still in flight
    sessionRef.current?.cancel();
    sessionRef.current = null;
    previewAudioRef.current?.pause();
    recordingAudioRef.current?.pause();
    if (referenceUrlRef.current) {
      URL.revokeObjectURL(referenceUrlRef.current);
      referenceUrlRef.current = null;
    }
    if (recordingUrlRef.current) {
      URL.revokeObjectURL(recordingUrlRef.current);
      recordingUrlRef.current = null;
    }
    setReferenceUrl(null);
    setRecordingUrl(null);
    setIsPreviewPlaying(false);
    setIsRecordingPlaying(false);
  }, [open]);

  // Safety net in case the component unmounts entirely while a dialog is open.
  useEffect(() => {
    return () => {
      sessionRef.current?.cancel();
      if (referenceUrlRef.current) URL.revokeObjectURL(referenceUrlRef.current);
      if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    };
  }, []);

  // Live "0:03" counter while actively recording.
  useEffect(() => {
    if (stage !== "recording") return;
    recordingStartRef.current = performance.now();
    setRecordingElapsedMs(0);
    const id = window.setInterval(() => {
      if (recordingStartRef.current !== null) {
        setRecordingElapsedMs(performance.now() - recordingStartRef.current);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [stage]);

  const startShadowing = useCallback(() => {
    if (!referenceUrl) return;
    setRecordingUrl(null);
    setIsRecordingPlaying(false);

    const handle = shadowingService.startSession(
      { referenceAudioUrl: referenceUrl, mode, countdownSeconds: 3, maxRecordingMs: 15_000 },
      (phase, detail) => {
        setStage(phase);
        if (phase === "countdown" && typeof detail?.secondsRemaining === "number") {
          setCountdownValue(detail.secondsRemaining);
        }
      },
    );
    sessionRef.current = handle;

    handle.result
      .then((result) => {
        const url = URL.createObjectURL(result.recording.blob);
        recordingUrlRef.current = url;
        setRecordingUrl(url);
        setRecordingDurationMs(result.recording.durationMs);
        recordingSpeedCycle.reset();
        setRecordingSpeed("normal");
      })
      .catch((err) => {
        if (err instanceof SessionCancelledError || err instanceof CountdownCancelledError) {
          // Learner backed out mid-attempt — settle back to "ready" quietly,
          // no error banner needed for a deliberate cancel.
          setStage("ready");
          return;
        }
        if (err instanceof MicrophoneUnavailableError) {
          setStage("mic-error");
          return;
        }
        console.warn("[ShadowingModal] session failed", err);
        setStage("error");
      })
      .finally(() => {
        if (sessionRef.current === handle) sessionRef.current = null;
      });
  }, [referenceUrl, mode, recordingSpeedCycle]);

  const stopRecording = useCallback(() => sessionRef.current?.stop(), []);

  const playPreview = useCallback(() => {
    if (!referenceUrl || isPreviewPlaying) return;
    // Same tap cycle as every other playback button: normal, slow, slow,
    // then back to normal.
    const speed = previewSpeedCycle.advance();
    setPreviewSpeed(speed);
    const audio = new Audio(referenceUrl);
    audio.playbackRate = speed === "slow" ? SLOW_PLAYBACK_RATE : 1;
    setPreservesPitch(audio, true);
    previewAudioRef.current = audio;
    setIsPreviewPlaying(true);
    audio.onended = () => setIsPreviewPlaying(false);
    audio.onerror = () => setIsPreviewPlaying(false);
    audio.play().catch(() => setIsPreviewPlaying(false));
  }, [referenceUrl, isPreviewPlaying, previewSpeedCycle]);

  const playRecording = useCallback(() => {
    if (!recordingUrl || isRecordingPlaying) return;
    const speed = recordingSpeedCycle.advance();
    setRecordingSpeed(speed);
    const audio = new Audio(recordingUrl);
    audio.playbackRate = speed === "slow" ? SLOW_PLAYBACK_RATE : 1;
    setPreservesPitch(audio, true);
    recordingAudioRef.current = audio;
    setIsRecordingPlaying(true);
    audio.onended = () => setIsRecordingPlaying(false);
    audio.onerror = () => setIsRecordingPlaying(false);
    audio.play().catch(() => setIsRecordingPlaying(false));
  }, [recordingUrl, isRecordingPlaying, recordingSpeedCycle]);

  const canPickMode = stage === "ready" || stage === "completed";

  const statusText =
    stage === "loading-reference"
      ? t.instructions.loading
      : stage === "reference-unavailable"
        ? t.instructions.unavailable
        : stage === "ready"
          ? t.instructions.ready
          : stage === "countdown"
            ? t.instructions.countdown
            : stage === "playing-reference"
              ? t.instructions.playingReference
              : stage === "recording"
                ? t.instructions.recording
                : stage === "processing"
                  ? t.instructions.processing
                  : stage === "completed"
                    ? t.instructions.completed
                    : stage === "mic-error"
                      ? t.instructions.micError
                      : t.instructions.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88dvh] w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-0 overflow-y-auto overscroll-contain rounded-3xl border-none bg-card p-0 shadow-elegant sm:w-full sm:max-w-md">
        <div className="px-5 pb-2 pt-6 sm:px-6">
          <DialogHeader className="items-center space-y-2 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-elegant">
              <Mic className="h-5 w-5" />
            </div>
            <DialogTitle className="text-balance font-display text-lg font-bold leading-snug text-foreground">
              {text}
            </DialogTitle>
            <DialogDescription className="text-pretty text-xs text-muted-foreground sm:text-sm">
              {t.dialogPurpose}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-5 pb-6 sm:px-6">
          {canPickMode && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              {(["simultaneous", "sequential"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                  className={[
                    "rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                    mode === m
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-ink-soft hover:border-primary/25",
                  ].join(" ")}
                >
                  {m === "simultaneous" ? t.modeSimultaneous : t.modeSequential}
                </button>
              ))}
            </div>
          )}

          <p
            role="status"
            aria-live="polite"
            className="mb-4 text-center text-sm font-medium text-foreground"
          >
            {statusText}
          </p>

          <div className="grid place-items-center">
            {(stage === "loading-reference" || stage === "processing") && (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            )}

            {stage === "reference-unavailable" && (
              <div className="flex flex-col items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <button
                  type="button"
                  onClick={resolveReference}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t.retry}
                </button>
              </div>
            )}

            {stage === "ready" && (
              <button
                type="button"
                onClick={startShadowing}
                className="grid h-16 w-16 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-elegant transition-transform hover:scale-105 active:scale-95"
                aria-label={t.start}
              >
                <Mic className="h-6 w-6" />
              </button>
            )}

            {stage === "countdown" && (
              <div
                key={countdownValue}
                className="animate-pop-in grid h-16 w-16 place-items-center rounded-full bg-gradient-brand text-2xl font-extrabold text-primary-foreground shadow-elegant"
              >
                {countdownValue > 0 ? countdownValue : t.go}
              </div>
            )}

            {stage === "playing-reference" && (
              <div className="relative grid h-16 w-16 place-items-center">
                <span className="pointer-events-none absolute inset-0 rounded-full animate-pulse-ring" />
                <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-elegant">
                  <Volume2 className="h-6 w-6 animate-pulse" />
                </div>
              </div>
            )}

            {stage === "recording" && (
              <div className="flex flex-col items-center gap-3">
                <div className="relative grid h-16 w-16 place-items-center">
                  <span className="pointer-events-none absolute inset-0 rounded-full animate-pulse-ring" />
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-elegant">
                    <Mic className="h-6 w-6" />
                  </div>
                </div>
                <div className="font-mono text-sm text-ink-soft">
                  {formatMs(recordingElapsedMs)}
                </div>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
                >
                  <span aria-hidden className="h-2.5 w-2.5 rounded-[2px] bg-background" />
                  {t.stop}
                </button>
              </div>
            )}

            {(stage === "mic-error" || stage === "error") && (
              <div className="flex flex-col items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <button
                  type="button"
                  onClick={startShadowing}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t.retry}
                </button>
              </div>
            )}

            {stage === "completed" && (
              <div className="w-full">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/5 p-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={playRecording}
                      disabled={!recordingUrl}
                      aria-label={t.yourRecording}
                      className={[
                        "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-card transition-transform hover:scale-105 active:scale-95 disabled:opacity-60",
                        isRecordingPlaying ? "animate-pulse" : "",
                      ].join(" ")}
                    >
                      {recordingUrl ? (
                        recordingSpeed === "slow" && isRecordingPlaying ? (
                          <Turtle className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </button>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        {t.yourRecording}
                      </div>
                      <div className="font-mono text-xs text-ink-soft">
                        {formatMs(recordingDurationMs)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={playPreview}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-primary/25 bg-background px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
                  >
                    {previewSpeed === "slow" && isPreviewPlaying ? (
                      <Turtle className="h-3.5 w-3.5 animate-pulse" />
                    ) : (
                      <Volume2
                        className={`h-3.5 w-3.5 ${isPreviewPlaying ? "animate-pulse" : ""}`}
                      />
                    )}
                    {t.compare}
                  </button>
                  <button
                    type="button"
                    onClick={startShadowing}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-primary/25 bg-background px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t.tryAgain}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
                >
                  <Check className="h-4 w-4" />
                  {t.done}
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
