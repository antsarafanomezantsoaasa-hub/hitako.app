import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// A member counts as "online" if their last heartbeat landed within this
// many minutes. Kept short on purpose: the admin dashboard's "online now"
// stat should reflect who's genuinely at their screen right now, not who
// merely visited earlier today. See use-presence-heartbeat.ts for the
// interval (45s) that keeps a truly-active member well inside this window.
export const ONLINE_THRESHOLD_MINUTES = 2;

/**
 * Pure helper the UI can re-run locally (no network call) to decide whether
 * a given `last_seen_at` still counts as "online" as of `now`. Used by
 * src/routes/admin.tsx to recompute the online set on its own ticking
 * clock, between the 30s polls that actually refetch members from the
 * server — see the `nowTick` state there.
 */
export function isWithinOnlineWindow(lastSeenAt: string | null, now: number): boolean {
  if (!lastSeenAt) return false;
  const lastSeenMs = new Date(lastSeenAt).getTime();
  if (Number.isNaN(lastSeenMs)) return false;
  return now - lastSeenMs <= ONLINE_THRESHOLD_MINUTES * 60_000;
}

/**
 * Bumps the caller's own `profiles.last_seen_at` to now. Any signed-in user
 * may call this for themselves — no admin gate, since this only ever writes
 * the caller's own row. Goes through the caller's own session
 * (context.supabase from requireSupabaseAuth, not the service role) so the
 * existing profiles_update_own_or_admin RLS policy is the real enforcement
 * here, same as every other self-service write in this app; the `.eq("id",
 * ...)` filter below is just belt-and-suspenders on top of that.
 *
 * Called by use-presence-heartbeat.ts every ~45s while a member's tab is
 * visible. No input needed — the caller's identity comes entirely from
 * their auth token, so there's nothing for a client to spoof here.
 */
export const touchPresence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: true }> => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
