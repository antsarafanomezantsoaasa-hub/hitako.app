import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  Clock,
  Crown,
  Flame,
  Loader2,
  Medal,
  Sparkles,
  Star,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { MemberAvatar } from "@/components/MemberAvatar";
import { useAuth } from "@/hooks/use-auth";
import {
  getHallOfFame,
  type HallOfFameBoard,
  type HallOfFameEntry,
} from "@/lib/hall-of-fame.functions";

/**
 * The real Hall of Fame — three leaderboards built entirely from data the
 * app already tracks (weekly XP, current streak, total study time). No
 * "Top Helpers" board: there's no peer-help feature to measure yet, so
 * rather than fake one, this ships the three boards that are genuinely
 * backed by real activity (see hall-of-fame.functions.ts for the query).
 *
 * Rendered inside MemberAppShell from the top-level /hall-of-fame route,
 * which any signed-in member — free tier included — can reach. Previously
 * this lived only under /mon-espace and was locked for the "free" role.
 */

type CategoryKey = "topLearners" | "mostConsistent" | "mostDedicated";

const CATEGORIES: {
  key: CategoryKey;
  label: string;
  icon: LucideIcon;
  blurb: string;
  emptyHint: string;
  formatValue: (value: number) => string;
}[] = [
  {
    key: "topLearners",
    label: "Top Learners",
    icon: Star,
    blurb: "Most XP earned this week.",
    emptyHint: "Finish a lesson this week to climb onto this board.",
    formatValue: (v) => `${v} XP`,
  },
  {
    key: "mostConsistent",
    label: "Most Consistent",
    icon: Medal,
    blurb: "The longest active day-streaks.",
    emptyHint: "Start a streak — come back tomorrow to keep it alive.",
    formatValue: (v) => `${v} day${v === 1 ? "" : "s"}`,
  },
  {
    key: "mostDedicated",
    label: "Most Dedicated",
    icon: Clock,
    blurb: "The most total study time logged.",
    emptyHint: "Every lesson you finish adds to your study time.",
    formatValue: formatStudyMinutes,
  },
];

function formatStudyMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m}`;
}

/** A little algorithmic flavor tag derived from the entry's own real stats — never invented per-person copy. */
function flavorTag(entry: HallOfFameEntry, category: CategoryKey): string {
  if (entry.rank === 1) return "👑 This week's legend";
  if (category === "mostConsistent" && entry.value >= 30) return "🔥 Unstoppable";
  if (category === "mostConsistent" && entry.value >= 7) return "🔥 On a roll";
  if (category === "mostDedicated" && entry.value >= 600) return "📚 Bookworm";
  if (category === "topLearners" && entry.rank <= 3) return "🧠 Sharp mind";
  return "✨ Showing up";
}

function useCountdown(targetIso: string | null): string {
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!targetIso) return;
    const id = window.setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, [targetIso]);

  return useMemo(() => {
    if (!targetIso) return "";
    const diffMs = new Date(targetIso).getTime() - Date.now();
    if (diffMs <= 0) return "resetting…";
    const totalMinutes = Math.floor(diffMs / 60_000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  }, [targetIso]);
}

export function HallOfFame() {
  const { user, profile } = useAuth();
  const getHallOfFameFn = useServerFn(getHallOfFame);

  const [category, setCategory] = useState<CategoryKey>("topLearners");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [result, setResult] = useState<{
    weekEndsAt: string;
    topLearners: HallOfFameBoard;
    mostConsistent: HallOfFameBoard;
    mostDedicated: HallOfFameBoard;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    getHallOfFameFn()
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setState("ready");
      })
      .catch((err) => {
        console.error("[HallOfFame] getHallOfFame failed:", err);
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [getHallOfFameFn]);

  const resetIn = useCountdown(result?.weekEndsAt ?? null);
  const activeCategory = CATEGORIES.find((c) => c.key === category)!;
  const board = result?.[category];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-primary/15 bg-gradient-brand p-5 shadow-sticker-soft sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-2">
          <Trophy className="h-5 w-5 shrink-0 text-primary-foreground" />
          <h2 className="font-display text-lg font-bold text-primary-foreground sm:text-xl">
            Hall of Fame 🏆
          </h2>
        </div>
        <p className="relative mt-2 max-w-md text-sm text-primary-foreground/90">
          We celebrate the members who lift the HiTako family up — not just the strongest, the most
          generous with their effort.
        </p>
        {result && (
          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary-foreground/30 bg-primary-foreground/15 px-3 py-1.5 text-xs font-bold text-primary-foreground backdrop-blur">
              <Zap className="h-3.5 w-3.5" />
              Resets in {resetIn}
            </span>
            <span className="text-xs font-medium text-primary-foreground/80">
              Weekly ranking · updates as you learn
            </span>
          </div>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const isActive = c.key === category;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3.5 py-2 text-xs font-bold transition-colors ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {c.label}
            </button>
          );
        })}
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">{activeCategory.blurb}</p>

      {/* Board */}
      <div className="rounded-3xl border border-border bg-card/70 p-4 shadow-card backdrop-blur sm:p-5">
        {state === "loading" && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading the leaderboard…
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Couldn&apos;t load the Hall of Fame right now — try again in a moment.
          </div>
        )}

        {state === "ready" && board && (
          <>
            {board.entries.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Sparkles className="h-6 w-6 text-primary" />
                <p className="text-sm font-medium text-foreground">No one on this board yet.</p>
                <p className="max-w-xs text-xs text-muted-foreground">{activeCategory.emptyHint}</p>
              </div>
            ) : (
              <ol className="flex flex-col gap-1.5">
                {board.entries.map((entry) => (
                  <LeaderboardRow
                    key={entry.id}
                    entry={entry}
                    category={category}
                    formatValue={activeCategory.formatValue}
                  />
                ))}

                {/* If the viewer isn't in the top list, anchor their real rank at the bottom. */}
                {board.you && !board.entries.some((e) => e.isYou) && (
                  <>
                    <li className="my-1 text-center text-xs text-muted-foreground">···</li>
                    <LeaderboardRow
                      entry={board.you}
                      category={category}
                      formatValue={activeCategory.formatValue}
                    />
                  </>
                )}
              </ol>
            )}

            {!board.you && board.entries.length > 0 && user && (
              <p className="mt-4 rounded-2xl bg-muted/60 px-3.5 py-2.5 text-center text-xs text-muted-foreground">
                {activeCategory.emptyHint}
              </p>
            )}
          </>
        )}
      </div>

      {/* How to climb */}
      <div className="rounded-3xl border border-border bg-card/70 p-5 shadow-card backdrop-blur sm:p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-bold text-foreground">How do I climb?</h3>
        </div>
        <ul className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground sm:text-sm">
          <li className="flex items-start gap-2">
            <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            Finish lessons — the XP you earn this week counts toward Top Learners.
          </li>
          <li className="flex items-start gap-2">
            <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            Come back every day — your streak is what Most Consistent ranks on.
          </li>
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            Little and often adds up — every minute you study counts toward Most Dedicated.
          </li>
        </ul>
      </div>

      {profile && (
        <p className="text-center text-[11px] text-muted-foreground">
          Signed in as {profile.full_name || "you"} · rankings only use your name, avatar and level.
        </p>
      )}
    </div>
  );
}

function LeaderboardRow({
  entry,
  category,
  formatValue,
}: {
  entry: HallOfFameEntry;
  category: CategoryKey;
  formatValue: (value: number) => string;
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors ${
        entry.isYou
          ? "border-emerald-400/50 bg-emerald-500/10"
          : "border-transparent hover:bg-muted/50"
      }`}
    >
      <RankBadge rank={entry.rank} />
      <MemberAvatar
        name={entry.full_name}
        avatarPath={entry.avatar_url}
        className="h-9 w-9 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-foreground">{entry.full_name}</span>
          {entry.isYou && (
            <span className="shrink-0 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              You
            </span>
          )}
        </div>
        <p className="truncate text-[11px] text-muted-foreground">{flavorTag(entry, category)}</p>
      </div>
      <span className="shrink-0 font-display text-sm font-extrabold text-foreground">
        {formatValue(entry.value)}
      </span>
    </li>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-sticker-soft">
        <Crown className="h-4 w-4" fill="currentColor" />
      </span>
    );
  if (rank === 2)
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-700">
        <Medal className="h-4 w-4" />
      </span>
    );
  if (rank === 3)
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-300 text-orange-900">
        <Medal className="h-4 w-4" />
      </span>
    );
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
      #{rank}
    </span>
  );
}

export default HallOfFame;
