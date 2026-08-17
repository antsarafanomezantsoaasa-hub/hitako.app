/**
 * Shared types for the "shadowing" practice system (see ShadowingService.ts).
 *
 * Same philosophy as pronunciation/types.ts: these describe the shape of a
 * session end to end (config in, result out, state reported in between) so
 * ShadowingService stays pure infrastructure and any future UI component can
 * be built against this contract alone.
 */

/**
 * "simultaneous" starts the mic the instant the reference clip becomes
 * audible, so the learner speaks along with it in real time. "sequential"
 * plays the reference fully first and only starts recording once it ends,
 * for a listen-then-repeat drill.
 */
export type ShadowingMode = "simultaneous" | "sequential";

/** Lifecycle of a single shadowing attempt, in the order ShadowingService moves through them. */
export type ShadowingPhase =
  | "countdown"
  | "playing-reference"
  | "recording"
  | "processing"
  | "completed"
  | "cancelled"
  | "error";

/** Extra context passed alongside a phase change — currently only populated during "countdown". */
export interface ShadowingPhaseDetail {
  /** Whole seconds left in the countdown, including the terminal 0. */
  secondsRemaining?: number;
}

/** Called by ShadowingService every time the session moves to a new phase. */
export type ShadowingStateHandler = (phase: ShadowingPhase, detail?: ShadowingPhaseDetail) => void;

export interface ShadowingSessionConfig {
  /** URL of the reference clip the learner shadows. */
  referenceAudioUrl: string;
  /** Defaults to "simultaneous". */
  mode?: ShadowingMode;
  /** Whole seconds counted down before playback/recording starts. Defaults to 3. */
  countdownSeconds?: number;
  /** Safety cap so a forgotten stop can't record forever. Defaults to 15_000. */
  maxRecordingMs?: number;
}

/** The learner's captured attempt, handed back once recording stops. */
export interface RecordingResult {
  blob: Blob;
  mimeType: string;
  durationMs: number;
  /** performance.now() timestamp the recording actually started at. */
  startedAt: number;
}

/** Final outcome of a completed shadowing attempt. */
export interface ShadowingSessionResult {
  /** Echoes back the config the session was started with. */
  config: ShadowingSessionConfig;
  recording: RecordingResult;
  /** Measured delay (ms) between calling play() and the reference clip becoming audible — see utils/audioSync.ts. */
  referenceBufferingDelayMs: number;
}

/** Returned immediately by startSession() — the attempt itself runs async and reports through onStateChange. */
export interface ShadowingSessionHandle {
  /** Resolves with the finished attempt, or rejects (e.g. SessionCancelledError) if it never completes. */
  result: Promise<ShadowingSessionResult>;
  /** Learner-initiated stop — ends recording now and proceeds to "processing". */
  stop: () => void;
  /** Aborts the session entirely (e.g. navigating away mid-attempt) — no result will ever resolve. */
  cancel: () => void;
}
