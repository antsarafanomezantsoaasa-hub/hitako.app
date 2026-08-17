import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { touchPresence } from "@/lib/presence.functions";

// How often an active session pings the server while its tab is visible.
// Kept well under ONLINE_THRESHOLD_MINUTES (see presence.functions.ts) so a
// couple of missed beats — a slow network, a backgrounded tab briefly
// waking up — don't flip someone to "offline" on the admin dashboard by
// mistake.
const HEARTBEAT_INTERVAL_MS = 45_000;

/**
 * Keeps `profiles.last_seen_at` fresh for the signed-in user so the admin
 * dashboard's "online now" stat reflects reality. Mounted once, app-wide,
 * from AuthProvider (see src/hooks/use-auth.tsx) — every page a member can
 * be on keeps their presence current, not just /admin or /mon-espace.
 *
 * Pings once immediately on sign-in, then on an interval, and again
 * whenever a backgrounded tab becomes visible — browsers throttle or
 * suspend timers in hidden tabs, so a plain setInterval alone can drift.
 * While the tab is hidden, heartbeats are skipped entirely: a member who
 * switches away should eventually age out of "online", not read as
 * present forever just because the tab is still technically open.
 *
 * No explicit "going offline" signal is sent on sign-out or tab close —
 * see ONLINE_THRESHOLD_MINUTES in presence.functions.ts for why a simple
 * staleness window is enough on its own.
 */
export function usePresenceHeartbeat(userId: string | null) {
  const touchPresenceFn = useServerFn(touchPresence);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    const ping = () => {
      if (cancelled || document.visibilityState !== "visible") return;
      touchPresenceFn().catch((err) => {
        // A missed heartbeat just means this member ages out of "online" a
        // little early — never worth surfacing to the user.
        console.error("[usePresenceHeartbeat] touchPresence failed:", err);
      });
    };

    ping();
    const intervalId = window.setInterval(ping, HEARTBEAT_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [userId, touchPresenceFn]);
}
