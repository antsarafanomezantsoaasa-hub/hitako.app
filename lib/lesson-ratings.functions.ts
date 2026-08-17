import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// End-of-lesson satisfaction rating (1–5 stars, optional free-text note).
//
// Deliberately independent from lesson_progress / completeLesson: rating is
// feedback, not progress, so it never touches XP, streak, lessons_completed
// or any other progress counter. Any signed-in learner who reached a
// lesson's finish screen may rate it — including the "free" tier on the
// /zero welcome-bonus lessons — because feedback from those two lessons is
// exactly what we want to collect.
//
// One row per (user, lesson): re-submitting updates the learner's own
// rating instead of inflating the average with duplicates.
const rateLessonSchema = z.object({
  lesson_slug: z.string().trim().min(1).max(60),
  lesson_number: z.number().int().min(1).max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional().nullable(),
});

export type RateLessonResult = {
  ok: true;
  rating: number;
};

export const rateLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => rateLessonSchema.parse(data))
  .handler(async ({ data, context }): Promise<RateLessonResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const comment = data.comment?.trim() ? data.comment.trim() : null;

    const { error } = await supabaseAdmin.from("lesson_ratings").upsert(
      {
        user_id: context.userId,
        lesson_slug: data.lesson_slug,
        lesson_number: data.lesson_number,
        rating: data.rating,
        comment,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_slug" },
    );
    if (error) throw new Error(error.message);

    return { ok: true, rating: data.rating };
  });

export type LessonRatingRow = {
  id: string;
  user_id: string;
  lesson_slug: string;
  lesson_number: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Every rating ever submitted, newest first — powers the admin "Avis"
 * dashboard. RLS already lets an admin read all rows
 * (lesson_ratings_select_own_or_admin), so this reads through the caller's
 * own session, exactly like listAllLessonProgress.
 */
export const listAllLessonRatings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LessonRatingRow[]> => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error("Vérification du rôle impossible.");
    if (!isAdmin) throw new Error("Accès réservé aux administrateurs.");

    const { data, error } = await context.supabase
      .from("lesson_ratings")
      .select("id, user_id, lesson_slug, lesson_number, rating, comment, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as LessonRatingRow[];
  });
