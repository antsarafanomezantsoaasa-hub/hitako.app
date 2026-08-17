import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { Link } from "@tanstack/react-router";
import { Check, Gift, Loader2, Lock, Sparkles, Star } from "lucide-react";
import type { MemberLevel } from "@/hooks/use-auth";
import {
  CURRICULUM_CHAPTERS,
  LESSON_ROUTES,
  LEVEL_COPY,
  PUBLISHED_LESSON_COUNT,
  TOTAL_CURRICULUM_LESSONS,
} from "./shared";

/**
 * The "My HQ" lesson path — a winding, Duolingo/Candy-Crush-style trail of the
 * 80 HiT START lessons grouped into their 4 curriculum chapters (see
 * CURRICULUM_CHAPTERS), plus teaser cards for the two levels that don't have
 * lessons yet (HiT FLOW, HiT PRO).
 *
 * IMPORTANT — direction is intentionally inverted from the usual top-down
 * lesson trail: Lesson 01 sits at the very bottom and the path climbs
 * *upward* as the lesson number grows, chapter by chapter, with the HiT
 * FLOW/PRO teasers at the very top. Scrolling up = moving forward, which is
 * the point: HiTako's learners grow and rise, so the path should visually
 * rise with them instead of sinking down the page. Don't "fix" this back to
 * a top-to-bottom order.
 *
 * Only the 5 most recent lessons render on first paint (INITIAL_VISIBLE);
 * keeping the trail short on load is what makes the screen open straight on
 * the current lesson. Scrolling further up the trail reveals the next batch
 * (LOAD_BATCH) automatically via the scroll handler — there is no "load more"
 * button, you just keep scrolling.
 *
 * SCROLL PERFORMANCE — in "screen" mode the trail does NOT create its own
 * scroll container. It scrolls inside the app shell's single scroller
 * (<main data-member-scroll> in MemberAppShell), which keeps native momentum
 * scrolling on mobile instead of a nested, height-calculated box. There is
 * also no per-frame JS transform on the nodes any more: the previous "globe"
 * effect re-read the layout of every node on every scroll event, which is
 * what made the trail stutter. Depth is now pure CSS.
 *
 * Levels/lessons beyond PUBLISHED_LESSON_COUNT aren't published yet, so only
 * the lessons listed in LESSON_ROUTES (see ./shared) are ever clickable —
 * every other node is a locked placeholder.
 */

const AMPLITUDE = 74; // px each side of center the path winds
const INITIAL_VISIBLE = 5; // recent lessons shown before any scrolling
const LOAD_BATCH = 5; // how many more appear each time you reach the top
const LOAD_TRIGGER_PX = 320; // how close to the top of the trail triggers a load
const LOAD_COOLDOWN_MS = 450; // keeps one scroll gesture from loading many batches

type NodeState = "done" | "current" | "locked" | "bonus";

function nodeState(
  n: number,
  completedCount: number,
  demoLesson?: number,
  freeLessons?: number[],
): NodeState {
  if (n <= completedCount) return "done";
  // Free tier (/zero): the welcome-bonus lessons are playable. The first
  // unfinished one is the "current" START node; the other bonus lesson stays
  // unlocked and highlighted. Everything else is locked.
  if (freeLessons && freeLessons.length > 0) {
    if (!freeLessons.includes(n)) return "locked";
    const nextFree = freeLessons.find((l) => l > completedCount);
    return n === nextFree ? "current" : "bonus";
  }
  // Free tier (/zero): only the demo lesson is playable — Lesson 01 and every
  // other node stay locked while the whole path stays visible.
  if (demoLesson) return n === demoLesson ? "current" : "locked";
  // Exactly one node is ever "current": the next lesson in sequence, capped
  // at what's actually published. With more than one lesson published this
  // must be a single number rather than "n <= PUBLISHED_LESSON_COUNT" — the
  // latter would mark every published-but-not-yet-done lesson as "current"
  // at once (e.g. both 01 and 02 pulsing "START" before either is finished).
  const nextLesson = Math.min(completedCount + 1, PUBLISHED_LESSON_COUNT);
  return n === nextLesson ? "current" : "locked";
}

function nodeX(n: number) {
  return Math.round(AMPLITUDE * Math.sin((n - 1) * 0.85));
}

interface LessonPathProps {
  level: MemberLevel;
  completedCount: number;
  /** Free-tier preview: path is blurred behind an unlock card. */
  locked?: boolean;
  onUnlock?: () => void;
  /**
   * Where the "START" node (the current lesson) leads. Defaults to the real
   * Lesson 01 route; /zero points it at the free demo lesson instead.
   */
  startHref?: string;
  /**
   * Free tier: the single playable lesson (e.g. 18, the free demo). When set,
   * it becomes the only "current"/START node and Lesson 01 is not entered.
   */
  demoLesson?: number;
  /**
   * Free tier: lesson numbers offered as a free "welcome bonus" (e.g. [1, 2]
   * on /zero). They are playable and visually spotlighted; every other lesson
   * stays locked.
   */
  freeLessons?: number[];
  /**
   * Free tier: called when a locked lesson node is tapped (e.g. /zero opens a
   * "confirm your registration" popup instead of navigating anywhere).
   */
  onLockedLessonClick?: (n: number) => void;
  /**
   * "card" keeps the bordered dashboard card (used anywhere the path is one
   * block among others). "screen" is the app-mockup layout: the path *is*
   * the screen, scrolling inside the shell's own scroller.
   */
  variant?: "card" | "screen";
  className?: string;
}

export function LessonPath({
  level,
  completedCount,
  locked = false,
  onUnlock,
  startHref,
  demoLesson,
  freeLessons,
  onLockedLessonClick,
  variant = "card",
  className = "",
}: LessonPathProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const ownScrollRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef(new Map<number, HTMLDivElement>());
  const armedRef = useRef(false);
  const lastLoadRef = useRef(0);
  const pendingHeightRef = useRef<number | null>(null);

  const isScreen = variant === "screen";

  // In "screen" mode the shell's <main data-member-scroll> is the scroller;
  // in "card" mode the component still owns a bounded one.
  const [scroller, setScroller] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!isScreen) {
      setScroller(ownScrollRef.current);
      return;
    }
    setScroller((rootRef.current?.closest("[data-member-scroll]") as HTMLElement | null) ?? null);
  }, [isScreen]);

  // How far up the trail has been revealed so far. Starts at the 5 most
  // recent lessons around the learner's current position.
  const startLesson =
    demoLesson ??
    (freeLessons && freeLessons.length > 0
      ? (freeLessons.find((l) => l > completedCount) ?? freeLessons[0])
      : Math.max(1, Math.min(completedCount + 1, PUBLISHED_LESSON_COUNT)));
  const [visibleTop, setVisibleTop] = useState(() =>
    Math.min(TOTAL_CURRICULUM_LESSONS, startLesson + INITIAL_VISIBLE - 1),
  );
  const allRevealed = visibleTop >= TOTAL_CURRICULUM_LESSONS;

  const otherLevels = useMemo(
    () => (Object.keys(LEVEL_COPY) as MemberLevel[]).filter((l) => l !== level),
    [level],
  );

  // Chapters clipped to what's revealed, rendered highest-first so the climb
  // still reads bottom (Lesson 01) → top.
  const visibleChapters = useMemo(
    () =>
      [...CURRICULUM_CHAPTERS]
        .reverse()
        .filter((chapter) => chapter.from <= visibleTop)
        .map((chapter) => ({ ...chapter, visibleTo: Math.min(chapter.to, visibleTop) })),
    [visibleTop],
  );

  // ---- reveal the next batch when the learner scrolls near the top of the
  // revealed trail. Armed only after the initial scroll has landed on the
  // current lesson, and rate-limited so one flick reveals one batch of 5
  // rather than cascading through the whole curriculum.
  useEffect(() => {
    if (locked || allRevealed || !scroller) return;
    let frame = 0;

    function maybeLoadMore() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!armedRef.current || !scroller) return;
        const now = Date.now();
        if (now - lastLoadRef.current < LOAD_COOLDOWN_MS) return;
        if (scroller.scrollTop > LOAD_TRIGGER_PX) return;
        lastLoadRef.current = now;
        // Remember the current height so the view can stay put once the new
        // lessons are inserted *above* what's on screen.
        pendingHeightRef.current = scroller.scrollHeight;
        setVisibleTop((current) => Math.min(TOTAL_CURRICULUM_LESSONS, current + LOAD_BATCH));
      });
    }

    scroller.addEventListener("scroll", maybeLoadMore, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", maybeLoadMore);
    };
    // Note: visibleTop is deliberately NOT a dependency — it's never read in
    // this effect body (setVisibleTop uses a functional updater), and adding
    // it back would re-subscribe the scroll listener on every one of the ~16
    // batches it takes to reveal the full curriculum instead of once.
  }, [locked, allRevealed, scroller]);

  // Keep the scroll position anchored on the lessons the learner was looking
  // at when a new batch is prepended above them. `scroll-behavior: smooth` on
  // the shell scroller would animate this correction (and fight the finger),
  // so it's applied with the behaviour temporarily forced to auto.
  useLayoutEffect(() => {
    const previous = pendingHeightRef.current;
    if (!scroller || previous === null) return;
    pendingHeightRef.current = null;
    const delta = scroller.scrollHeight - previous;
    if (!delta) return;
    const prevBehavior = scroller.style.scrollBehavior;
    scroller.style.scrollBehavior = "auto";
    scroller.scrollTop += delta;
    scroller.style.scrollBehavior = prevBehavior;
  }, [visibleTop, scroller]);

  // ---- initial scroll position: land on the current lesson (at the base of
  // the trail), not on the topmost revealed node. This runs in useLayoutEffect
  // (not useEffect) so the correction happens before the browser paints —
  // otherwise the trail would flash at its default (top) scroll position for
  // a frame and then visibly snap down to the current lesson, which read as
  // janky. No artificial delay is needed: nodeRefs are already populated by
  // the time this runs, since it's the same lessons rendered in this commit.
  useLayoutEffect(() => {
    if (locked || !scroller) return;
    const node = nodeRefs.current.get(startLesson);
    if (node) {
      const prevBehavior = scroller.style.scrollBehavior;
      scroller.style.scrollBehavior = "auto";
      const nodeRect = node.getBoundingClientRect();
      const viewRect = scroller.getBoundingClientRect();
      scroller.scrollTop += nodeRect.top - viewRect.top - viewRect.height / 2 + nodeRect.height / 2;
      scroller.style.scrollBehavior = prevBehavior;
    }
    armedRef.current = true;
  }, [locked, startLesson, scroller]);

  const copy = LEVEL_COPY[level];

  return (
    <div
      ref={rootRef}
      className={`relative ${
        isScreen
          ? "bg-transparent"
          : "overflow-hidden rounded-3xl border border-border bg-card/70 shadow-card backdrop-blur"
      } ${className}`}
    >
      {!isScreen && (
        <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">Your path</h2>
            <p className="mt-1 break-words text-sm text-muted-foreground">{copy.title}</p>
          </div>
          <span className="inline-flex shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {level}
          </span>
        </div>
      )}

      <div
        ref={ownScrollRef}
        className={
          isScreen
            ? "relative"
            : "scroll-smooth-touch relative h-[520px] overflow-y-auto sm:h-[600px]"
        }
      >
        <div className="pb-10 pt-2">
          {!allRevealed && !locked && (
            // Kept short on purpose: a tall spacer here reads as a blank
            // stretch of wallpaper at the top of the trail on small screens.
            <div className="flex h-[104px] items-end justify-center px-5 pb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/85 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground shadow-sticker-soft">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                Keep scrolling for more lessons
              </span>
            </div>
          )}

          {/* Topmost: what's coming after HiT START — the summit of the climb. */}
          {allRevealed && (
            <div className="flex flex-col gap-3 px-5 pb-2 pt-6 sm:px-6">
              {otherLevels.map((lvl) => (
                <div
                  key={lvl}
                  className="flex items-center gap-3 rounded-3xl border-2 border-dashed border-primary/25 bg-card/85 px-4 py-3.5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-foreground">{lvl}</p>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                      {LEVEL_COPY[lvl].description}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-wide text-secondary-foreground">
                    Coming soon
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Chapters render top (highest revealed lesson) to bottom (Lesson
              01) so the visual climb goes: Lesson 01 at the base → up through
              each chapter → the level teasers above. */}
          {visibleChapters.map((chapter) => (
            <ChapterBlock
              key={chapter.name}
              chapter={chapter}
              completedCount={completedCount}
              nodeRefs={nodeRefs}
              startLesson={startLesson}
              startHref={startHref}
              demoLesson={demoLesson}
              freeLessons={freeLessons}
              onLockedLessonClick={onLockedLessonClick}
            />
          ))}
        </div>
      </div>

      {locked && (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-start justify-center bg-gradient-to-b from-member-canvas/55 via-member-canvas/95 to-member-canvas ${
            isScreen ? "top-0 pt-20" : "top-[73px] pt-16"
          }`}
        >
          <div className="pointer-events-auto w-[270px] rounded-[1.75rem] border-2 border-primary/15 bg-card p-5 text-center shadow-sticker-soft">
            <div className="node-gloss mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-node text-primary-foreground shadow-sticker">
              <Lock className="h-6 w-6" />
            </div>
            <h4 className="text-base font-extrabold text-foreground">
              Confirmez votre inscription
            </h4>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Encore une étape pour débloquer la Leçon 01, votre série et le suivi de progression.
            </p>
            <button
              type="button"
              onClick={onUnlock}
              className="mt-4 w-full rounded-full bg-gradient-brand px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-primary-foreground shadow-sticker-soft transition-transform active:translate-y-0.5"
            >
              Confirmer maintenant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChapterBlock({
  chapter,
  completedCount,
  nodeRefs,
  startLesson,
  startHref,
  demoLesson,
  freeLessons,
  onLockedLessonClick,
}: {
  chapter: { name: string; from: number; to: number; visibleTo: number };
  completedCount: number;
  nodeRefs: MutableRefObject<Map<number, HTMLDivElement>>;
  startLesson: number;
  startHref?: string;
  demoLesson?: number;
  freeLessons?: number[];
  onLockedLessonClick?: (n: number) => void;
}) {
  const doneInChapter = Math.max(0, Math.min(chapter.to, completedCount) - chapter.from + 1);
  const chapterCount = chapter.to - chapter.from + 1;
  const pct = Math.round((doneInChapter / chapterCount) * 100);
  // Nodes count down within the block so the highest revealed lesson in the
  // chapter is nearest the top and the lowest is nearest the chapter's own
  // banner, which sits at the very bottom of the block — the "trailhead" you
  // reach first when climbing up from below.
  const lessonNumbers = Array.from(
    { length: Math.max(0, chapter.visibleTo - chapter.from + 1) },
    (_, i) => chapter.visibleTo - i,
  );

  return (
    <div>
      {lessonNumbers.map((n) => (
        <LessonNode
          key={n}
          n={n}
          completedCount={completedCount}
          nodeRefs={nodeRefs}
          startLesson={startLesson}
          startHref={startHref}
          demoLesson={demoLesson}
          freeLessons={freeLessons}
          onLockedLessonClick={onLockedLessonClick}
        />
      ))}
      <div className="relative z-[2] mx-4 my-7 overflow-hidden rounded-[1.5rem] border-2 border-primary/15 bg-card/95 px-4 py-3.5 shadow-sticker-soft sm:mx-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-extrabold text-foreground">
              {chapter.name}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
              Lessons {chapter.from}–{chapter.to}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
            {doneInChapter}/{chapterCount}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-wave" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function LessonNode({
  n,
  completedCount,
  nodeRefs,
  startLesson,
  startHref,
  demoLesson,
  freeLessons,
  onLockedLessonClick,
}: {
  n: number;
  completedCount: number;
  nodeRefs: MutableRefObject<Map<number, HTMLDivElement>>;
  startLesson: number;
  startHref?: string;
  demoLesson?: number;
  freeLessons?: number[];
  onLockedLessonClick?: (n: number) => void;
}) {
  const state = nodeState(n, completedCount, demoLesson, freeLessons);
  const isBonus = Boolean(freeLessons?.includes(n)) && state !== "done";
  const x = nodeX(n);
  const xAbove = nodeX(n + 1);
  // Only lessons in LESSON_ROUTES have a real route today — every other
  // node stays inert even once "current", rather than linking somewhere
  // that doesn't exist yet. A caller can override where the current "START"
  // node leads (e.g. /zero starts the free demo lesson); otherwise a
  // published lesson keeps its own route.
  const href =
    startHref && n === startLesson
      ? startHref
      : // Free tier with welcome-bonus lessons: those keep their real route.
        freeLessons && freeLessons.length > 0
        ? freeLessons.includes(n)
          ? LESSON_ROUTES[n]
          : undefined
        : // Free demo tier: real lessons stay locked; only the demo can open.
          !demoLesson
          ? LESSON_ROUTES[n]
          : undefined;

  const isActive = state !== "locked";

  const circle = (
    <div
      className={`node-gloss relative flex items-center justify-center rounded-full border-[3px] transition-transform active:translate-y-1 ${
        state === "current" ? "h-[4.5rem] w-[4.5rem]" : "h-16 w-16"
      } ${
        state === "locked"
          ? "border-card bg-muted text-muted-foreground shadow-sticker-soft"
          : state === "done"
            ? "border-card bg-node-done text-primary-foreground shadow-sticker"
            : "border-card bg-node text-primary-foreground shadow-sticker"
      } ${isBonus ? "animate-bonus-glow ring-4 ring-amber-300/60" : ""}`}
    >
      {(state === "current" || state === "bonus") && (
        <span className="pointer-events-none absolute inset-0 rounded-full animate-pulse-ring" />
      )}
      {isBonus && (
        <Sparkles
          aria-hidden
          className="pointer-events-none absolute -right-1 -top-1 h-5 w-5 text-amber-300 drop-shadow"
          fill="currentColor"
        />
      )}
      {state === "done" && <Check className="h-7 w-7" strokeWidth={3.25} />}
      {(state === "current" || state === "bonus") && (
        <span className="font-display text-lg font-black">{String(n).padStart(2, "0")}</span>
      )}
      {state === "locked" && <Lock className="h-5 w-5" strokeWidth={2.5} />}
    </div>
  );

  // The node wrapper is laid out in normal flow (not absolutely positioned):
  // iOS Safari regularly skips rastering absolutely-positioned children inside
  // a tall momentum scroller, which is what left blank gaps where nodes should
  // have been while scrolling the trail.
  return (
    <div className="relative z-[2] flex h-28 justify-center">
      {/* Candy trail: three dots interpolated between this node and the one
          above it, so the path reads as one continuous winding road. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-16">
        {[0.25, 0.5, 0.75].map((t) => (
          <span
            key={t}
            style={{
              transform: `translateX(${Math.round(x + (xAbove - x) * t)}px)`,
              top: `${Math.round(4 + (1 - t) * 34)}px`,
            }}
            className={`absolute left-1/2 -ml-1.5 h-3 w-3 rounded-full ${
              state === "done" ? "bg-primary/55" : "bg-primary/30"
            }`}
          />
        ))}
      </div>

      <div
        ref={(el) => {
          if (el) nodeRefs.current.set(n, el);
          else nodeRefs.current.delete(n);
        }}
        data-x={x}
        style={{ transform: `translateX(${x}px)` }}
        className={`node-halo relative mt-8 flex w-20 flex-col items-center gap-1.5 ${
          state === "current" ? "animate-node-bob" : ""
        } ${isBonus ? "animate-bonus-wiggle" : ""}`}
      >
        {href && isActive ? (
          <Link to={href} className="contents" aria-label={`Lesson ${n}`}>
            {circle}
          </Link>
        ) : !isActive && onLockedLessonClick ? (
          <button
            type="button"
            onClick={() => onLockedLessonClick(n)}
            className="contents"
            aria-label={`Lesson ${n} verrouillée`}
          >
            {circle}
          </button>
        ) : (
          circle
        )}

        {state === "done" ? (
          <span className="flex items-center gap-0.5">
            {[0, 1, 2].map((i) => (
              <Star key={i} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" />
            ))}
          </span>
        ) : (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide ${
              isBonus
                ? "bonus-shimmer inline-flex items-center gap-1 bg-gradient-brand text-primary-foreground shadow-sticker"
                : state === "current"
                  ? "bg-primary text-primary-foreground shadow-sticker-soft"
                  : "bg-card/80 text-muted-foreground"
            }`}
          >
            {isBonus && <Gift className="h-3 w-3" strokeWidth={2.75} />}
            {isBonus
              ? state === "current"
                ? "START"
                : "BONUS"
              : state === "current"
                ? "START"
                : String(n).padStart(2, "0")}
          </span>
        )}
      </div>
    </div>
  );
}

export default LessonPath;
