import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Hall of Fame — real leaderboards computed from data the app already
// tracks, no invented numbers:
//   • Top Learners     → XP earned THIS WEEK (sum of lesson_progress.xp_earned
//                         for completions since Monday 00:00 UTC). Weekly on
//                         purpose so the board actually refreshes instead of
//                         being permanently dominated by the earliest members.
//   • Most Consistent   → current day streak (profiles.streak_days).
//   • Most Dedicated    → total study time (profiles.study_minutes).
// There's no "Top Helpers" board here: the app has no peer-help/karma
// feature to measure yet (no Q&A, no "mark helpful"), so rather than fabricate
// a leaderboard from nothing, this ships the three boards that are backed by
// real, already-tracked activity. Add a genuine helper-tracking feature first
// and a fourth board can follow the same pattern.
//
// Any signed-in member — including the "free" tier on /zero — may view this:
// it's identical to how MEMBERS_ONLY_TABS treated it before, except this
// feature is now unlocked for everyone (see MemberBottomTabs.tsx). Reading
// every member's profile/progress to build the board requires the service
// role (RLS otherwise limits a normal member to their own rows), so this
// handler is the sole place that happens, and it only ever returns the
// handful of fields a leaderboard needs — never email, phone, birthdate, bio.

export type HallOfFameEntry = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  level: string;
  value: number;
  rank: number;
  isYou: boolean;
};

export type HallOfFameBoard = {
  entries: HallOfFameEntry[];
  you: HallOfFameEntry | null;
};

export type HallOfFameResult = {
  weekStartsAt: string;
  weekEndsAt: string;
  topLearners: HallOfFameBoard;
  mostConsistent: HallOfFameBoard;
  mostDedicated: HallOfFameBoard;
};

const BOARD_SIZE = 10;

/** Monday 00:00 UTC of the week containing `d`. */
function startOfWeekUTC(d: Date): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay(); // 0 = Sunday … 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diffToMonday);
  return date;
}

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  level: string;
  streak_days: number | null;
  study_minutes: number | null;
};

function buildBoard(
  profiles: ProfileRow[],
  callerId: string,
  valueFor: (p: ProfileRow) => number,
): HallOfFameBoard {
  const ranked = profiles
    .map((p) => ({ p, value: valueFor(p) }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((r, i) => ({
      id: r.p.id,
      full_name: r.p.full_name?.trim() || "Membre HiTako",
      avatar_url: r.p.avatar_url,
      level: r.p.level,
      value: r.value,
      rank: i + 1,
      isYou: r.p.id === callerId,
    }));

  return {
    entries: ranked.slice(0, BOARD_SIZE),
    you: ranked.find((r) => r.isYou) ?? null,
  };
}

export const getHallOfFame = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<HallOfFameResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const weekStart = startOfWeekUTC(new Date());
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [{ data: weekRows, error: weekError }, { data: profiles, error: profilesError }] =
      await Promise.all([
        supabaseAdmin
          .from("lesson_progress")
          .select("user_id, xp_earned, completed_at")
          .gte("completed_at", weekStart.toISOString())
          .lt("completed_at", weekEnd.toISOString()),
        supabaseAdmin
          .from("profiles")
          .select("id, full_name, avatar_url, level, streak_days, study_minutes")
          .eq("status", "active"),
      ]);
    if (weekError) throw new Error(weekError.message);
    if (profilesError) throw new Error(profilesError.message);

    const weeklyXpByUser = new Map<string, number>();
    for (const row of weekRows ?? []) {
      weeklyXpByUser.set(
        row.user_id,
        (weeklyXpByUser.get(row.user_id) ?? 0) + (row.xp_earned ?? 0),
      );
    }

    const rows = (profiles ?? []) as ProfileRow[];

    return {
      weekStartsAt: weekStart.toISOString(),
      weekEndsAt: weekEnd.toISOString(),
      topLearners: buildBoard(rows, context.userId, (p) => weeklyXpByUser.get(p.id) ?? 0),
      mostConsistent: buildBoard(rows, context.userId, (p) => p.streak_days ?? 0),
      mostDedicated: buildBoard(rows, context.userId, (p) => p.study_minutes ?? 0),
    };
  });
