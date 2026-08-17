/**
 * The "free" role now covers two tracks, chosen on /free-registration:
 *  - "daily": self-paced HiT START Daily (80 lessons in the app) — home is /zero.
 *  - "coach": HiT START Coach (live, small-group coaching on WhatsApp) — home
 *    is /bienvenue-coach.
 *
 * Every place that used to hard-code "/zero" as the free-tier home (post
 * sign-up redirect, post-login redirect, the nav bar's dashboard link, the
 * back-to-home links on /jeux and /hall-of-fame, etc.) should go through
 * this helper instead so both tracks land in the right place.
 */
export type PreferredFormat = "daily" | "coach";

export function getFreeHomeHref(
  preferredFormat: PreferredFormat | string | null | undefined,
): "/zero" | "/bienvenue-coach" {
  return preferredFormat === "coach" ? "/bienvenue-coach" : "/zero";
}
