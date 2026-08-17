import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
// NOTE: the generated Supabase types in this checkout predate the migration
// that creates this table, so the insert is cast until types are regenerated.
/* eslint-disable @typescript-eslint/no-explicit-any */

const subscribeNewsletterSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide.").max(255),
  // Where the popup was opened from (e.g. "final_cta", "nav") — purely for
  // internal follow-up context, not shown to the visitor.
  source: z.string().trim().min(1).max(60).default("newsletter_popup"),
});

export type SubscribeNewsletterResult = { ok: true } | { ok: false; message: string };

// Public, unauthenticated insert — same reasoning as submitQuizLead in
// quiz-leads.functions.ts: the visitor filling this in isn't signed in, RLS
// on newsletter_subscribers grants INSERT to anon, so the regular
// (publishable-key) client is enough here.
export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => subscribeNewsletterSchema.parse(data))
  .handler(async ({ data }): Promise<SubscribeNewsletterResult> => {
    const { error } = await (supabase.from("newsletter_subscribers" as never) as any).insert({
      email: data.email.trim().toLowerCase(),
      source: data.source,
    });
    if (error) {
      // Unique violation → this address already subscribed. Treat it as a
      // success from the visitor's point of view — they *are* on the list,
      // which is all they actually care about.
      if (error.code === "23505") {
        return { ok: true };
      }
      console.error("[subscribeNewsletter] insert failed:", error);
      return { ok: false, message: "Impossible d'enregistrer votre e-mail pour le moment." };
    }
    return { ok: true };
  });
