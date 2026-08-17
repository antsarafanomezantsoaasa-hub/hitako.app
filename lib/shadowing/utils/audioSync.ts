/**
 * Timing helpers for keeping a reference clip and a microphone recording in
 * sync.
 *
 * The core problem: calling `audio.play()` and having sound actually reach
 * the speakers are two different moments — there's a variable buffering /
 * decode delay in between, which can be a few hundred ms on a slow device
 * or the first play of a freshly-fetched clip. Shadowing needs to measure
 * "sync" from real audible playback, not from the call site, or every
 * attempt would start the learner's recording slightly late relative to
 * what they actually hear.
 */

/** A tiny stopwatch built on performance.now(), which is monotonic and immune to system clock changes. */
export interface PlaybackClock {
  /** Marks t=0. Safe to call again to restart the clock. */
  start(): void;
  /** Milliseconds since start() was called. 0 if start() was never called. */
  elapsedMs(): number;
  reset(): void;
}

export function createPlaybackClock(): PlaybackClock {
  let startedAt: number | null = null;
  return {
    start() {
      startedAt = performance.now();
    },
    elapsedMs() {
      return startedAt === null ? 0 : performance.now() - startedAt;
    },
    reset() {
      startedAt = null;
    },
  };
}

/**
 * Resolves the moment an <audio> element actually starts producing sound —
 * i.e. the "playing" event — rather than whenever its `play()` promise
 * happens to resolve (which can fire before audio is audibly flowing).
 */
export function waitForPlaybackStart(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!audio.paused && audio.currentTime > 0) {
      resolve();
      return;
    }

    const cleanup = () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("error", onError);
    };
    const onPlaying = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(audio.error ?? new Error("Reference audio failed to play"));
    };

    audio.addEventListener("playing", onPlaying, { once: true });
    audio.addEventListener("error", onError, { once: true });
  });
}

/**
 * Starts a reference `<audio>` clip and calls `onReferenceAudible` at the
 * instant it becomes actually audible (see waitForPlaybackStart above) —
 * that's the correct t=0 to start a synced microphone recording from,
 * whether that means starting to record immediately or a moment later.
 *
 * Returns the measured buffering delay (ms) between calling play() and
 * audible playback, mainly for debugging/telemetry.
 */
export async function syncPlaybackWithRecording(
  audio: HTMLAudioElement,
  onReferenceAudible: () => void,
): Promise<{ bufferingDelayMs: number }> {
  const clock = createPlaybackClock();
  clock.start();

  const becameAudible = waitForPlaybackStart(audio);
  await audio.play();
  await becameAudible;

  const bufferingDelayMs = clock.elapsedMs();
  onReferenceAudible();
  return { bufferingDelayMs };
}
