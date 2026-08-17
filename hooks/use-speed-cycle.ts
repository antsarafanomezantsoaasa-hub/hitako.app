import { useCallback, useMemo, useRef } from "react";
import type { PlaybackSpeed } from "@/lib/pronunciation";

/**
 * The tap cycle shared by every audio playback button in the app:
 *
 *   tap 1 -> normal
 *   tap 2 -> slow
 *   tap 3 -> slow
 *   tap 4 -> normal   (and the cycle repeats from there)
 *
 * `advance()` returns the speed the click that just happened should use.
 * `reset()` puts the next tap back at the start of the cycle (used when the
 * phrase/card/dialog changes so a new line always starts at normal speed).
 */
const CYCLE: PlaybackSpeed[] = ["normal", "slow", "slow"];

export function useSpeedCycle() {
  const tapRef = useRef(0);

  const advance = useCallback((): PlaybackSpeed => {
    const speed = CYCLE[tapRef.current % CYCLE.length];
    tapRef.current += 1;
    return speed;
  }, []);

  const peek = useCallback((): PlaybackSpeed => CYCLE[tapRef.current % CYCLE.length], []);

  const reset = useCallback(() => {
    tapRef.current = 0;
  }, []);

  // Stable identity so callers can safely list it in effect/callback deps.
  return useMemo(() => ({ advance, peek, reset }), [advance, peek, reset]);
}
