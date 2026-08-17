import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { rateLesson } from "@/lib/lesson-ratings.functions";

/**
 * End-of-lesson satisfaction popup — 1 to 5 stars plus an optional note.
 *
 * Drop-in for ANY lesson route, current or future: render it once in the
 * lesson component and flip `active` to true when the learner reaches the
 * finish screen, e.g.
 *
 *   <LessonRatingDialog
 *     active={phase === "finish"}
 *     lessonSlug={LESSON_SLUG}
 *     lessonNumber={LESSON_NUMBER}
 *     lessonTitle="Leçon 01"
 *   />
 *
 * It owns everything else: it waits a beat so the finish animation can
 * play, skips itself when this learner already rated this lesson (read
 * straight from lesson_ratings via RLS), saves through the rateLesson
 * server function, and never touches lesson logic, XP, streak or progress.
 */
export function LessonRatingDialog({
  active,
  lessonSlug,
  lessonNumber,
  lessonTitle,
  delayMs = 1200,
}: {
  active: boolean;
  lessonSlug: string;
  lessonNumber: number;
  lessonTitle?: string;
  delayMs?: number;
}) {
  const { user } = useAuth();
  const rateLessonFn = useServerFn(rateLesson);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const shownRef = useRef(false);

  // Show once per lesson visit, and only if this learner hasn't already
  // rated this lesson before.
  useEffect(() => {
    if (!active || !user || shownRef.current) return;
    shownRef.current = true;
    let cancelled = false;
    let timer: number | undefined;
    (async () => {
      const { data } = await supabase
        .from("lesson_ratings")
        .select("rating")
        .eq("user_id", user.id)
        .eq("lesson_slug", lessonSlug)
        .maybeSingle();
      if (cancelled || data) return;
      timer = window.setTimeout(() => {
        if (!cancelled) setOpen(true);
      }, delayMs);
    })();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [active, user, lessonSlug, delayMs]);

  async function submit() {
    if (rating < 1 || state === "saving") return;
    setState("saving");
    try {
      await rateLessonFn({
        data: {
          lesson_slug: lessonSlug,
          lesson_number: lessonNumber,
          rating,
          comment: comment.trim() || null,
        },
      });
      setState("saved");
      window.setTimeout(() => setOpen(false), 1400);
    } catch (err) {
      console.error("[LessonRatingDialog] rateLesson failed:", err);
      setState("error");
    }
  }

  if (!user) return null;

  const shown = hovered || rating;

  return (
    <Dialog open={open} onOpenChange={(next) => (state === "saving" ? null : setOpen(next))}>
      <DialogContent className="w-[min(24rem,calc(100vw-2.5rem))] rounded-[1.75rem] border-2 border-primary/15 bg-card p-6 text-center shadow-sticker">
        {state === "saved" ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <DialogTitle className="text-sm font-semibold text-foreground">
              Misaotra betsaka! Voaray ny hevitrao.
            </DialogTitle>
          </div>
        ) : (
          <>
            <DialogTitle className="text-base font-extrabold text-foreground">
              Nahafinaritra ve {lessonTitle ?? `ny Lesona ${String(lessonNumber).padStart(2, "0")}`}{" "}
              ?
            </DialogTitle>
            <p className="-mt-2 text-xs leading-relaxed text-muted-foreground">
              Omeo naoty (kintana 1 ka hatramin’ny 5) ity lesona ity mba hanatsarana hatrany ny
              fianaranao eto amin'ny HiTako Academy.
            </p>

            <div
              className="flex items-center justify-center gap-1.5"
              onMouseLeave={() => setHovered(0)}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} kintana`}
                  onMouseEnter={() => setHovered(value)}
                  onFocus={() => setHovered(value)}
                  onClick={() => setRating(value)}
                  className="rounded-full p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={
                      value <= shown
                        ? "h-8 w-8 fill-amber-400 text-amber-400"
                        : "h-8 w-8 text-muted-foreground/40"
                    }
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              rows={2}
              placeholder="Hevitra fanampiny (tsy voatery)…"
              className="w-full resize-none rounded-2xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />

            {state === "error" && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Tsy voatahiry ny naoty — azafady andramo indray.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={rating < 1 || state === "saving"}
                onClick={submit}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-primary-foreground shadow-sticker-soft transition-transform hover:scale-[1.03] active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {state === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Alefa
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                Amin'ny manaraka
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default LessonRatingDialog;
