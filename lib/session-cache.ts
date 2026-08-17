/**
 * Tiny in-memory, per-session cache for read-mostly data (member avatar
 * signed URLs, aggregate XP, the site's daily phrase, ...) that would
 * otherwise be re-fetched every time the component reading it remounts.
 *
 * That remount happens more than it looks: the /mon-espace and /zero app
 * shell's top bar (MemberTopBar, which renders the avatar and — via
 * useMemberXp — the XP pill) lives inside MemberAppShell, which is only
 * mounted while you're actually on one of those routes. The footer's
 * "Game Arena" tab, any lesson page, etc. are separate top-level routes,
 * so tapping between them and My HQ unmounts and remounts the whole shell,
 * and with it every hook that fetches on mount — without this cache,
 * that's a fresh avatar/XP/daily-phrase request on every single tap.
 *
 * A module-level Map is enough: it lives for the lifetime of this JS
 * module, i.e. the whole single-page-app session, and is wiped for free on
 * an actual page refresh (new module instance) — exactly the "reload only
 * on refresh" behaviour we want, with no extra invalidation plumbing
 * required for data that doesn't change out from under the user.
 *
 * For data that *can* change from something the user just did (e.g.
 * completing a lesson bumps their XP), the writer is expected to call
 * invalidateSessionCache with the same key afterwards — see
 * src/routes/lecon-01.tsx and src/routes/lecon-demo-18.tsx.
 */

const cache = new Map<string, Promise<unknown>>();

export function getSessionCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit) return hit as Promise<T>;
  const promise = fetcher().catch((err: unknown) => {
    // Don't poison the cache with a failed request — let the next mount retry.
    cache.delete(key);
    throw err;
  });
  cache.set(key, promise);
  return promise;
}

export function invalidateSessionCache(key: string) {
  cache.delete(key);
}
