/**
 * ShadowingService
 * =================
 * Orchestrates one "shadowing" attempt end to end:
 *
 *   1. Run a "3, 2, 1" countdown (utils/countdown.ts) while, in parallel,
 *      arming the microphone (utils/recorder.ts) so any permission prompt
 *      appears while the learner is still looking at the countdown, not at
 *      the time-critical sync moment.
 *   2. Play the reference clip and, the instant it's actually audible
 *      (utils/audioSync.ts — not just whenever `.play()` was called),
 *      start the mic recording. In "sequential" mode, the reference plays
 *      fully first and recording only starts once it ends.
 *   3. Stop recording on whichever comes first: the learner tapping stop,
 *      the reference clip ending (simultaneous mode only), or a safety cap
 *      (`maxRecordingMs`) so a forgotten stop can't record forever.
 *   4. Hand back the finished clip as a Blob the UI can play back, compare,
 *      or upload.
 *
 * This is pure infrastructure: nothing here renders anything or assumes a
 * particular lesson layout. State is reported the same way
 * PronunciationService reports TTS state — through an `onStateChange`
 * callback — so a future UI component can follow the same pattern as
 * PronunciationButton.tsx.
 *
 * Not used anywhere yet. The existing lesson experience and
 * PronunciationService are completely untouched by this file.
 */
import type {
  ShadowingPhase,
  ShadowingSessionConfig,
  ShadowingSessionHandle,
  ShadowingSessionResult,
  ShadowingStateHandler,
} from "./types";
import { runCountdown, CountdownCancelledError } from "./utils/countdown";
import { syncPlaybackWithRecording } from "./utils/audioSync";
import { prepareMicRecording, type PreparedMicRecording } from "./utils/recorder";

const DEFAULT_COUNTDOWN_SECONDS = 3;
const DEFAULT_MAX_RECORDING_MS = 15_000;

/** Thrown when a session is cancelled (as opposed to erroring out) — e.g. the learner navigates away mid-attempt. */
export class SessionCancelledError extends Error {
  constructor() {
    super("Shadowing session was cancelled");
    this.name = "SessionCancelledError";
  }
}

class ShadowingService {
  /**
   * Kicks off a full shadowing attempt. Returns a handle immediately — the
   * actual choreography runs async and reports through `onStateChange`.
   */
  startSession(
    config: ShadowingSessionConfig,
    onStateChange?: ShadowingStateHandler,
  ): ShadowingSessionHandle {
    const countdownSeconds = config.countdownSeconds ?? DEFAULT_COUNTDOWN_SECONDS;
    const maxRecordingMs = config.maxRecordingMs ?? DEFAULT_MAX_RECORDING_MS;
    const mode = config.mode ?? "simultaneous";

    const abortController = new AbortController();
    let micRecording: PreparedMicRecording | null = null;
    let referenceAudio: HTMLAudioElement | null = null;

    let resolveStopRequested!: () => void;
    const stopRequested = new Promise<void>((resolve) => {
      resolveStopRequested = resolve;
    });

    const setPhase = (phase: ShadowingPhase, detail?: { secondsRemaining?: number }) =>
      onStateChange?.(phase, detail);

    const waitForReferenceEnded = (audio: HTMLAudioElement): Promise<void> =>
      new Promise((resolve) => audio.addEventListener("ended", () => resolve(), { once: true }));

    const waitForMaxDuration = (): Promise<void> =>
      new Promise((resolve) => setTimeout(resolve, maxRecordingMs));

    const run = async (): Promise<ShadowingSessionResult> => {
      // Kick mic preparation off immediately so any permission prompt
      // overlaps with the countdown instead of stalling it. We keep our own
      // reference to this promise (rather than only awaiting it inline) so
      // it can still be cancelled/released even if the countdown is what
      // ends up rejecting first.
      const micPreparePromise = prepareMicRecording();
      micPreparePromise.catch(() => {
        // Swallow here — the real error is surfaced below when we await it
        // on the success path, or via the orphan-cleanup on the error path.
      });

      try {
        setPhase("countdown", { secondsRemaining: countdownSeconds });
        await runCountdown({
          seconds: countdownSeconds,
          onTick: (secondsRemaining) => setPhase("countdown", { secondsRemaining }),
          signal: abortController.signal,
        });

        micRecording = await micPreparePromise;

        if (abortController.signal.aborted) throw new SessionCancelledError();

        if (typeof Audio === "undefined") {
          throw new Error("Audio playback is not supported in this environment");
        }
        referenceAudio = new Audio(config.referenceAudioUrl);

        const stopWaiters: Promise<unknown>[] = [stopRequested, waitForMaxDuration()];
        let referenceBufferingDelayMs = 0;
        const armedMic = micRecording;

        if (mode === "simultaneous") {
          setPhase("playing-reference");
          const { bufferingDelayMs } = await syncPlaybackWithRecording(referenceAudio, () => {
            setPhase("recording");
            armedMic.start();
          });
          referenceBufferingDelayMs = bufferingDelayMs;
          stopWaiters.push(waitForReferenceEnded(referenceAudio));
        } else {
          setPhase("playing-reference");
          const { bufferingDelayMs } = await syncPlaybackWithRecording(referenceAudio, () => {});
          referenceBufferingDelayMs = bufferingDelayMs;
          await waitForReferenceEnded(referenceAudio);

          if (abortController.signal.aborted) throw new SessionCancelledError();

          setPhase("recording");
          armedMic.start();
        }

        if (abortController.signal.aborted) throw new SessionCancelledError();

        await Promise.race(stopWaiters);

        if (abortController.signal.aborted) throw new SessionCancelledError();

        setPhase("processing");
        const recording = await armedMic.stop();

        setPhase("completed");
        return { config, recording, referenceBufferingDelayMs };
      } catch (err) {
        micRecording?.cancel();
        // If mic prep hadn't resolved yet when we bailed (e.g. cancelled
        // during the countdown), make sure it doesn't leave the mic on once
        // it eventually does resolve.
        void micPreparePromise.then((rec) => rec.cancel()).catch(() => {});

        if (err instanceof CountdownCancelledError || err instanceof SessionCancelledError) {
          setPhase("cancelled");
        } else {
          setPhase("error");
        }
        throw err;
      } finally {
        referenceAudio?.pause();
      }
    };

    return {
      result: run(),
      stop: () => resolveStopRequested(),
      cancel: () => {
        abortController.abort();
        resolveStopRequested();
        micRecording?.cancel();
        referenceAudio?.pause();
      },
    };
  }
}

export const shadowingService = new ShadowingService();
export { ShadowingService };
