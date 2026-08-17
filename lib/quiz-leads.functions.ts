import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
// NOTE: the generated Supabase types in this checkout predate the migration
// that creates this table, so the insert is cast until types are regenerated.
/* eslint-disable @typescript-eslint/no-explicit-any */

const submitQuizLeadSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide.").max(255),
  score: z.number().int().min(0),
  total: z.number().int().min(1),
  level_code: z.string().trim().min(1).max(20),
});

export type SubmitQuizLeadResult = { ok: true } | { ok: false; message: string };

// Public, unauthenticated insert — the visitor submitting this on
// /test-niveau (see EnglishQuiz.tsx) is not signed in yet. RLS on
// quiz_leads grants INSERT to anon, so the regular (publishable-key)
// client is enough here, same reasoning as getSiteSettings in
// settings.functions.ts — no service role needed just to log a lead.
//
// This replaces the old client-only localStorage write, which never left
// the visitor's browser: every quiz completion was a lost lead. See
// supabase/migrations/20260804090000_add_quiz_leads.sql.
export const submitQuizLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitQuizLeadSchema.parse(data))
  .handler(async ({ data }): Promise<SubmitQuizLeadResult> => {
    const { error } = await (supabase.from("quiz_leads" as never) as any).insert({
      email: data.email.trim().toLowerCase(),
      score: data.score,
      total: data.total,
      level_code: data.level_code,
    });
    if (error) {
      console.error("[submitQuizLead] insert failed:", error);
      return { ok: false, message: "Impossible d'enregistrer votre score pour le moment." };
    }
    return { ok: true };
  });
