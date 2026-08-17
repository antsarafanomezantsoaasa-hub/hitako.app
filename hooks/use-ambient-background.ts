import { useEffect, useRef, useState } from "react";
import {
  createAmbientController,
  isAmbientEnabled,
  setAmbientEnabled,
  type AmbientController,
} from "@/lib/sound-fx";

export interface UseAmbientBackgroundResult {
  /** Whether the ambient loop is currently muted (persisted, independent of the general SFX toggle). */
  muted: boolean;
  /** Flips the mute state and immediately starts/stops playback to match. */
  toggleMuted: () => void;
}

/**
 * Whole-page background ambience for the member area (`/mon-espace`,
 * `/zero`) — mount this once in `MemberAppShell` (the shared chrome for
 * both routes) and it loops the ukulele bed at low volume ("en boucle")
 * for as long as the member is browsing their space.
 *
 * Playback stops in three situations:
 *
 *   1. The tab/page becomes inactive (`document.visibilitychange`) — paused,
 *      not destroyed, so it picks back up right where it left off the
 *      moment the member returns.
 *   2. The member mutes it from the header's settings menu (see
 *      `MemberTopBar`) — persisted via `setAmbientEnabled`, so it stays off
 *      across visits until unmuted again.
 *   3. The member launches a lesson. Lesson routes (`/lecon-01`,
 *      `/lecon-demo-18`, `/jeux/*`, …) live outside `/mon-espace` and
 *      `/zero` and don't render `MemberAppShell`, so navigating into one
 *      unmounts the shell — and this hook's cleanup stops the loop for
 *      good. No extra wiring needed at each "start lesson" button/link.
 *
 * Also respects the same mute preference as the rest of the SFX engine
 * (`hitako:sound-fx-enabled`, see `src/lib/sound-fx.ts`).
 */
export function useAmbientBackground(): UseAmbientBackgroundResult {
  const [muted, setMuted] = useState(() => !isAmbientEnabled());
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const controllerRef = useRef<AmbientController | null>(null);

  // Mount/unmount: create the single <audio> loop for this shell instance,
  // wire up visibility + first-gesture handling, and tear it all down again
  // when the shell unmounts (see point 3 above).
  useEffect(() => {
    const ambient = createAmbientController();
    controllerRef.current = ambient;
    let cancelled = false;

    function tryStart() {
      if (cancelled || document.hidden || mutedRef.current) return;
      void ambient.play();
    }

    tryStart();

    // Autoplay-with-sound is commonly blocked until the member has
    // interacted with the page at all — if the initial play() above was
    // rejected, the very next tap/keypress anywhere retries it once.
    function resumeOnGesture() {
      tryStart();
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
    }
    window.addEventListener("pointerdown", resumeOnGesture, { once: true });
    window.addEventListener("keydown", resumeOnGesture, { once: true });

    function handleVisibility() {
      if (document.hidden) {
        ambient.pause();
      } else {
        tryStart();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
      controllerRef.current = null;
      ambient.destroy();
    };
  }, []);

  // React immediately to the mute toggle below, independent of the
  // mount/unmount effect above (no need to tear anything down for this).
  useEffect(() => {
    const ambient = controllerRef.current;
    if (!ambient) return;
    if (muted || document.hidden) {
      ambient.pause();
    } else {
      void ambient.play();
    }
  }, [muted]);

  function toggleMuted() {
    setMuted((wasMuted) => {
      const nextMuted = !wasMuted;
      setAmbientEnabled(!nextMuted);
      return nextMuted;
    });
  }

  return { muted, toggleMuted };
}
