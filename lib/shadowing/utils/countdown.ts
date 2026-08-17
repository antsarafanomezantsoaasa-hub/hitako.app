/**
 * Small, cancellable "3, 2, 1" countdown utility.
 *
 * Dependency-free on purpose (same philosophy as sound-fx.ts): a countdown
 * is just an interval and a resolve/reject, no need for a timer library.
 */

export interface CountdownOptions {
  /** Whole seconds to count down from, e.g. 3 for "3, 2, 1, go". 0 resolves immediately. */
  seconds: number;
  /** Called once per tick, including the terminal tick at 0. */
  onTick?: (secondsRemaining: number) => void;
  /** Lets the caller cancel a countdown already in progress (e.g. learner backs out mid-countdown). */
  signal?: AbortSignal;
}

/** Thrown when a countdown is cancelled via its AbortSignal before reaching 0. */
export class CountdownCancelledError extends Error {
  constructor() {
    super("Countdown was cancelled");
    this.name = "CountdownCancelledError";
  }
}

/**
 * Runs a countdown, calling `onTick` once per second (starting immediately
 * with the initial value, then once per elapsed second down to 0), and
 * resolves once it reaches 0. Reject with `CountdownCancelledError` if
 * `signal` aborts first.
 */
export function runCountdown({ seconds, onTick, signal }: CountdownOptions): Promise<void> {
  if (seconds < 0) {
    return Promise.reject(new Error("Countdown seconds must be >= 0"));
  }

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new CountdownCancelledError());
      return;
    }

    let remaining = seconds;
    onTick?.(remaining);

    if (remaining === 0) {
      resolve();
      return;
    }

    const cleanup = () => {
      clearInterval(intervalId);
      signal?.removeEventListener("abort", onAbort);
    };

    const onAbort = () => {
      cleanup();
      reject(new CountdownCancelledError());
    };

    const intervalId = setInterval(() => {
      remaining -= 1;
      onTick?.(remaining);
      if (remaining <= 0) {
        cleanup();
        resolve();
      }
    }, 1000);

    signal?.addEventListener("abort", onAbort);
  });
}
