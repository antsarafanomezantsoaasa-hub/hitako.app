import { useState } from "react";
import { Mic } from "lucide-react";
import type { SpeakerId } from "@/lib/pronunciation";
import { ShadowingModal } from "@/components/ShadowingModal";

/**
 * 🎤 button that sits beside PronunciationButton wherever a learner can hear
 * a line spoken. Tapping it opens Shadowing Mode (see ShadowingModal.tsx),
 * which drives the countdown → synced recording → playback flow on top of
 * `lib/shadowing/ShadowingService`.
 */
interface ShadowingButtonProps {
  /** English line this button lets the learner shadow. */
  text: string;
  speaker?: SpeakerId;
  size?: "sm" | "md";
  /** Defaults to a French label; pass a localized one for Malagasy-first pages, same convention as PronunciationButton. */
  ariaLabel?: string;
  /** Language for the Shadowing Mode dialog itself. Defaults to French, same convention as ariaLabel. */
  locale?: "mg" | "fr";
  className?: string;
}

export function ShadowingButton({
  text,
  speaker,
  size = "md",
  ariaLabel,
  locale = "fr",
  className,
}: ShadowingButtonProps) {
  const [open, setOpen] = useState(false);

  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconDim = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel ?? "Mode Shadowing"}
        className={[
          "grid shrink-0 place-items-center rounded-full border-2 border-primary/25 bg-secondary text-secondary-foreground shadow-elegant transition-transform hover:scale-110 active:scale-95",
          dim,
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Mic className={iconDim} />
      </button>

      <ShadowingModal
        open={open}
        onOpenChange={setOpen}
        text={text}
        speaker={speaker}
        locale={locale}
      />
    </>
  );
}
