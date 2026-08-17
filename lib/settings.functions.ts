import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  free_registration_open: boolean;
  // Admin-authored phrase shown on the /mon-espace home header and the
  // public homepage hero badge. Null until an admin sets one for the first
  // time — callers fall back to DEFAULT_DAILY_PHRASE in that case, see
  // below.
  daily_phrase: string | null;
};

// Singleton row — see supabase/migrations/20260727090000_add_site_settings.sql.
const SETTINGS_ROW_ID = 1;

// Shown on the member home header and the public homepage hero whenever no
// admin has set a phrase yet (fresh install, or one explicitly cleared).
// Keeps both from ever looking broken or empty.
export const DEFAULT_DAILY_PHRASE = "Your only limit is your mind";

// Public, unauthenticated read — powers /free-registration, which a visitor
// reaches before ever signing in. No auth middleware here on purpose: it
// must resolve for anonymous callers. RLS on site_settings grants SELECT to
// anon + authenticated, so the regular (publishable-key) client is enough —
// no service role needed.
export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettings> => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("free_registration_open, daily_phrase")
      .eq("id", SETTINGS_ROW_ID)
      .maybeSingle();
    if (error) throw new Error(error.message);
    // If the seed row is ever missing, default to "open" — a missing row
    // should never silently lock every visitor out with nothing to explain
    // why in the admin panel.
    return {
      free_registration_open: data?.free_registration_open ?? true,
      daily_phrase: data?.daily_phrase ?? null,
    };
  },
);

// Re-reads the full row after a write so every setter below returns a
// complete, consistent SiteSettings object — same defaulting rules as
// getSiteSettings.
async function fetchSettingsRow(
  client: import("@supabase/supabase-js").SupabaseClient,
): Promise<SiteSettings> {
  const { data } = await client
    .from("site_settings")
    .select("free_registration_open, daily_phrase")
    .eq("id", SETTINGS_ROW_ID)
    .maybeSingle();
  return {
    free_registration_open: data?.free_registration_open ?? true,
    daily_phrase: data?.daily_phrase ?? null,
  };
}

const setFreeRegistrationOpenSchema = z.object({ open: z.boolean() });

// Admin-only toggle shown on /admin. Goes through the caller's own session
// (context.supabase from requireSupabaseAuth) rather than the service role —
// the site_settings_admin_update RLS policy already restricts UPDATE to
// admins, same pattern as every other admin mutation in admin.functions.ts.
export const setFreeRegistrationOpen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => setFreeRegistrationOpenSchema.parse(data))
  .handler(async ({ data, context }): Promise<SiteSettings> => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("site_settings")
      .update({ free_registration_open: data.open })
      .eq("id", SETTINGS_ROW_ID);
    if (error) throw new Error(error.message);
    return fetchSettingsRow(context.supabase);
  });

// Trim, cap length, and fold blank input to null (an admin clearing the
// field means "show the bundled default again", not "store an empty
// string"). 240 chars is generous for a one-line quote while keeping the
// member header from overflowing.
const setDailyPhraseSchema = z.object({
  phrase: z.string().trim().max(240).nullable(),
});

// Admin-only — sets the phrase shown on the /mon-espace home header
// (MemberHomeHeader.tsx) and the public homepage hero badge (Hero in
// src/components/site/sections.tsx) — both read it via the shared
// useDailyPhrase hook (src/hooks/use-daily-phrase.ts). Same auth pattern as
// setFreeRegistrationOpen.
export const setDailyPhrase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => setDailyPhraseSchema.parse(data))
  .handler(async ({ data, context }): Promise<SiteSettings> => {
    await requireAdmin(context);
    const nextPhrase = data.phrase ? data.phrase : null;
    const { error } = await context.supabase
      .from("site_settings")
      .update({ daily_phrase: nextPhrase })
      .eq("id", SETTINGS_ROW_ID);
    if (error) throw new Error(error.message);
    return fetchSettingsRow(context.supabase);
  });
