import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSessionCached, invalidateSessionCache } from "@/lib/session-cache";

export function memberXpCacheKey(userId: string) {
  return `member-xp:${userId}`;
}

async function fetchTotalXp(userId: string): Promise<number> {
  // RLS on public.lesson_progress (see
  // supabase/migrations/20260726120000_add_lesson_progress.sql) grants
  // SELECT on a member's own rows, so this is a safe direct client read —
  // same pattern src/routes/lecon-01.tsx already uses to look up a single
  // lesson's prior progress.
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("xp_earned")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + (row.xp_earned ?? 0), 0);
}

/**
 * Total XP across every completed lesson for the signed-in member — shown
 * in the /mon-espace and /zero top bar in place of the old static "Start"
 * button (see MemberTopBar).
 *
 * Cached per-user for the whole SPA session (src/lib/session-cache.ts) so
 * that switching between footer tabs — which unmounts/remounts the top bar
 * every time you leave the app shell (e.g. for /jeux) and come back —
 * doesn't re-query lesson_progress on every single hop. The only thing
 * that changes this number is completeLesson
 * (src/lib/lessons.functions.ts), so the lesson pages invalidate the cache
 * right after a successful save — see src/routes/lecon-01.tsx and
 * src/routes/lecon-demo-18.tsx.
 */
export function useMemberXp(userId: string | null | undefined) {
  const [xp, setXp] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) {
      setXp(null);
      return;
    }
    let cancelled = false;
    getSessionCached(memberXpCacheKey(userId), () => fetchTotalXp(userId)).then(
      (total) => {
        if (!cancelled) setXp(total);
      },
      (err: unknown) => {
        console.error("[useMemberXp] fetchTotalXp failed:", err);
        if (!cancelled) setXp(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return xp;
}

/** Call after a successful completeLesson save so the next mount refetches. */
export function invalidateMemberXp(userId: string) {
  invalidateSessionCache(memberXpCacheKey(userId));
}
