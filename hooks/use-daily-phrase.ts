import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { DEFAULT_DAILY_PHRASE, getSiteSettings } from "@/lib/settings.functions";

/**
 * Reads the admin-authored "daily phrase" (see src/lib/settings.functions.ts
 * / the admin panel's Daily Phrase field).
 *
 * Shows the bundled default immediately — no spinner/flash — then swaps in
 * whatever the admin actually set (which may just be the same default).
 * `getSiteSettings` is a public, unauthenticated read, so this is safe to
 * use from signed-out pages (e.g. the public homepage hero) as well as the
 * signed-in /mon-espace member header — both stay in sync automatically
 * since they read the same site_settings row.
 */
export function useDailyPhrase() {
  const getSiteSettingsFn = useServerFn(getSiteSettings);
  const [phrase, setPhrase] = useState<string>(DEFAULT_DAILY_PHRASE);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const settings = await getSiteSettingsFn();
        if (!cancelled) setPhrase(settings.daily_phrase?.trim() || DEFAULT_DAILY_PHRASE);
      } catch (err) {
        // Fail open on the default we're already showing — this badge
        // should never look broken because one fetch hiccuped.
        console.error("[useDailyPhrase] getSiteSettings failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return phrase;
}
