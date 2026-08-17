import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Lesson content itself is bundled client-side (same as the public demo
// lessons), so the real access control that matters is on the *page* (the
// route redirects anyone who isn't a signed-in "member"/"admin" — see
// src/routes/lecon-01.tsx) and on *writes*: recording a completion, and the
// XP/streak/progress bump on the member's profile that comes with it, must
// only ever happen for a genuinely confirmed member. This server function is
// the sole write path for that, and re-checks the caller's role itself
// rather than trusting the client.
const completeLessonSchema = z.object({
  lesson_slug: z.string().trim().min(1).max(60),
  lesson_number: z.number().int().min(1).max(80),
  xp_earned: z.number().int().min(0).max(1000),
  best_score: z.number().int().min(0).max(100),
  study_minutes: z.number().int().min(0).max(180),
});

// Leçons 01 & 02 are the /zero welcome bonus: a "free" (not yet confirmed)
// account may play them AND have the result recorded, so both the learner
// and the admin dashboard get real data. Everything from Leçon 03 on still
// requires a confirmed member/admin role.
const FREE_TIER_LESSON_NUMBERS = [1, 2];

async function requireLessonWriteAccess(
  context: {
    supabase: import("@supabase/supabase-js").SupabaseClient;
    userId: string;
  },
  lessonNumber: number,
) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  if (error) throw new Error("Vérification du rôle impossible.");
  const roles = (data ?? []).map((r) => r.role);
  if (roles.includes("member") || roles.includes("admin")) return;
  if (roles.includes("free") && FREE_TIER_LESSON_NUMBERS.includes(lessonNumber)) return;
  throw new Error("Cette leçon est réservée aux membres confirmés de HiTako Academy.");
}

/** UTC calendar day key, e.g. "2026-08-07". */
function dayKey(value: string | Date): string {
  return new Date(value).toISOString().slice(0, 10);
}

/**
 * Day streak from the learner's own completion history: same day keeps the
 * streak, the day right after extends it, any longer gap restarts it at 1.
 */
function nextStreak(currentStreak: number, lastActivityAt: string | null): number {
  if (!lastActivityAt) return Math.max(1, currentStreak > 0 ? currentStreak : 1);
  const today = dayKey(new Date());
  const last = dayKey(lastActivityAt);
  if (last === today) return Math.max(1, currentStreak);
  const yesterday = dayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
  if (last === yesterday) return Math.max(1, currentStreak) + 1;
  return 1;
}

export type CompleteLessonResult = {
  ok: true;
  isFirstCompletion: boolean;
  lessons_completed: number;
  study_minutes: number;
  progress_percent: number;
  streak_days: number;
};

export const completeLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => completeLessonSchema.parse(data))
  .handler(async ({ data, context }): Promise<CompleteLessonResult> => {
    await requireLessonWriteAccess(context, data.lesson_number);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("lesson_progress")
      .select("xp_earned, best_score, attempts")
      .eq("user_id", context.userId)
      .eq("lesson_slug", data.lesson_slug)
      .maybeSingle();
    if (fetchError) throw new Error(fetchError.message);

    const isFirstCompletion = !existing;

    // Most recent completion BEFORE this one — drives the day streak.
    const { data: lastRows, error: lastError } = await supabaseAdmin
      .from("lesson_progress")
      .select("completed_at")
      .eq("user_id", context.userId)
      .order("completed_at", { ascending: false })
      .limit(1);
    if (lastError) throw new Error(lastError.message);
    const lastActivityAt = lastRows?.[0]?.completed_at ?? null;

    const { error: upsertError } = await supabaseAdmin.from("lesson_progress").upsert(
      {
        user_id: context.userId,
        lesson_slug: data.lesson_slug,
        lesson_number: data.lesson_number,
        xp_earned: Math.max(existing?.xp_earned ?? 0, data.xp_earned),
        best_score: Math.max(existing?.best_score ?? 0, data.best_score),
        attempts: (existing?.attempts ?? 0) + 1,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_slug" },
    );
    if (upsertError) throw new Error(upsertError.message);

    const { data: profile, error: profileFetchError } = await supabaseAdmin
      .from("profiles")
      .select("lessons_completed, study_minutes, progress_percent, streak_days")
      .eq("id", context.userId)
      .maybeSingle();
    if (profileFetchError) throw new Error(profileFetchError.message);

    const nextLessonsCompleted = (profile?.lessons_completed ?? 0) + (isFirstCompletion ? 1 : 0);
    const nextStudyMinutes = (profile?.study_minutes ?? 0) + Math.max(0, data.study_minutes);
    // 80 lessons total in the HiT START → HiT FLOW → HiT PRO curriculum.
    const nextProgressPercent = isFirstCompletion
      ? Math.min(100, (profile?.progress_percent ?? 0) + Math.round(100 / 80))
      : (profile?.progress_percent ?? 0);

    const streakDays = nextStreak(profile?.streak_days ?? 0, lastActivityAt);

    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({
        lessons_completed: nextLessonsCompleted,
        study_minutes: nextStudyMinutes,
        progress_percent: nextProgressPercent,
        streak_days: streakDays,
      })
      .eq("id", context.userId);
    if (profileUpdateError) throw new Error(profileUpdateError.message);

    return {
      ok: true,
      isFirstCompletion,
      lessons_completed: nextLessonsCompleted,
      study_minutes: nextStudyMinutes,
      progress_percent: nextProgressPercent,
      streak_days: streakDays,
    };
  });
