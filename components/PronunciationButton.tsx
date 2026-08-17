import { useCallback, useEffect, useState } from "react";
import { Loader2, Turtle, Volume2 } from "lucide-react";
import { pronunciationService } from "@/lib/pronunciation";
import type { PlaybackSpeed, PronunciationState, SpeakerId } from "@/lib/pronunciation";
import { useSpeedCycle } from "@/hooks/use-speed-cycle";

/**
 * 🔊 button used everywhere a learner can hear a word or phrase spoken.
 *
 * All the caching / provider-fallback logic lives in PronunciationService —
 * this component only renders four states (idle, generating, playing at
 * normal speed, playing slow) and asks the service to do the work. Swapping
 * the underlying TTS provider never requires touching this file.
 *
 * Tap cycle: 1st tap plays at normal speed, 2nd and 3rd tap play slow (for
 * catching individual sounds), then the 4th tap is back to normal — and it
 * repeats from there for as long as the learner keeps tapping.
 */
interface PronunciationButtonProps {
  /** English text to pronounce. */
  text: string;
  /** Who is "speaking" this line — picks the voice (see lib/pronunciation/voices.ts). */
  speaker?: SpeakerId;
  size?: "sm" | "md";
  /** Defaults to a French label; pass a localized one for Malagasy-first pages. */
  ariaLabel?: string;
  className?: string;
}

export function PronunciationButton({
  text,
  speaker,
  size = "md",
  ariaLabel,
  className,
}: PronunciationButtonProps) {
  const [state, setState] = useState<PronunciationState>("idle");
  const [activeSpeed, setActiveSpeed] = useState<PlaybackSpeed>("normal");
  const { advance, reset } = useSpeedCycle();

  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconDim = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const isLoading = state === "loading";
  const isSlow = activeSpeed === "slow";

  // A different line under the same button (e.g. HiTCards flipping to the
  // next card) should always start its own tap cycle back at normal speed.
  useEffect(() => {
    reset();
    setActiveSpeed("normal");
  }, [text, speaker, reset]);

  const handleClick = useCallback(() => {
    if (isLoading) return;
    const speed = advance();
    setActiveSpeed(speed);
    pronunciationService.speak(text, { speaker, speed, onStateChange: setState }).catch((err) => {
      // Playback failures (e.g. autoplay blocked before a user gesture)
      // shouldn't crash the lesson — just log and let the icon settle back to idle.
      console.warn("[PronunciationButton] could not play pronunciation", err);
    });
  }, [text, speaker, isLoading, advance]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={
        ariaLabel
          ? `${ariaLabel}${isSlow ? " (lentement)" : ""}`
          : `Écouter : ${text}${isSlow ? " (lentement)" : ""}`
      }
      title={isSlow ? "Vitesse lente" : undefined}
      aria-busy={isLoading}
      className={[
        "grid shrink-0 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-elegant transition-transform hover:scale-110 active:scale-95 disabled:cursor-wait disabled:opacity-70 disabled:hover:scale-100",
        dim,
        state === "playing" ? "animate-pulse" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isLoading ? (
        <Loader2 className={`${iconDim} animate-spin`} />
      ) : state === "playing" && isSlow ? (
        <Turtle className={iconDim} />
      ) : (
        <Volume2 className={iconDim} />
      )}
    </button>
  );
}
