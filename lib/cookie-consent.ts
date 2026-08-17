/**
 * Cookie consent storage.
 *
 * Two categories only, matching what HiTako Academy actually sets:
 * - "essential": things the site needs to function (auth session, the
 *   consent choice itself, basic preferences). Always on, never asked about.
 * - "analytics": anything non-essential we might add later (audience
 *   measurement, product analytics, marketing pixels). Only allowed to run
 *   once the visitor has explicitly accepted — see hasAnalyticsConsent() and
 *   src/hooks/use-cookie-consent.tsx.
 *
 * Nothing analytics-related ships in this codebase yet (see grep for
 * "gtag"/"analytics" — there's nothing to gate today), but the storage +
 * gating logic is in place so the day something is added, it's a one-line
 * `if (hasAnalyticsConsent()) { ... }` instead of a retrofit.
 */

export type CookieConsentStatus = "accepted" | "declined";

export interface CookieConsentRecord {
  status: CookieConsentStatus;
  /** Bumped whenever the cookie policy materially changes, to force a fresh prompt. */
  version: number;
  /** ISO timestamp of when the visitor made this choice. */
  decidedAt: string;
}

// Bump this if what the banner discloses ever changes in a way that should
// re-prompt existing visitors (e.g. a new analytics/marketing cookie added).
export const COOKIE_CONSENT_VERSION = 1;

const STORAGE_KEY = "hitako_cookie_consent";
const COOKIE_NAME = "hitako_cookie_consent";
const COOKIE_MAX_AGE_DAYS = 180;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function readCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeDays: number) {
  if (!isBrowser()) return;
  const maxAgeSeconds = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
}

function eraseCookie(name: string) {
  if (!isBrowser()) return;
  document.cookie = `${name}=; max-age=0; path=/`;
}

function isValidStatus(value: unknown): value is CookieConsentStatus {
  return value === "accepted" || value === "declined";
}

/**
 * Reads the visitor's stored choice, if any. Checks localStorage first
 * (carries the version + timestamp), and falls back to the plain cookie so a
 * returning visitor who cleared storage but kept cookies isn't re-prompted
 * unnecessarily.
 */
export function loadCookieConsent(): CookieConsentRecord | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CookieConsentRecord>;
      if (isValidStatus(parsed.status) && typeof parsed.version === "number") {
        return {
          status: parsed.status,
          version: parsed.version,
          decidedAt:
            typeof parsed.decidedAt === "string" ? parsed.decidedAt : new Date().toISOString(),
        };
      }
    }
  } catch {
    // Malformed JSON or storage unavailable (private mode, quota, etc.) —
    // fall through to the cookie below rather than throwing.
  }

  const cookieValue = readCookie(COOKIE_NAME);
  if (isValidStatus(cookieValue)) {
    // We don't know the original decision date/version from the cookie
    // alone — treat it as current-version so we don't loop the visitor.
    return {
      status: cookieValue,
      version: COOKIE_CONSENT_VERSION,
      decidedAt: new Date().toISOString(),
    };
  }

  return null;
}

/** Persists the visitor's choice to both localStorage and an actual cookie. */
export function saveCookieConsent(status: CookieConsentStatus): CookieConsentRecord {
  const record: CookieConsentRecord = {
    status,
    version: COOKIE_CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // Ignore — the cookie write below still records the choice.
    }
    writeCookie(COOKIE_NAME, status, COOKIE_MAX_AGE_DAYS);
  }

  return record;
}

/** Forgets the stored choice entirely (used by the "reset" dev/debug path only). */
export function clearCookieConsent() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  eraseCookie(COOKIE_NAME);
}

/** True when there's no decision on file yet, or it predates the current policy version. */
export function isConsentStale(record: CookieConsentRecord | null): boolean {
  return !record || record.version !== COOKIE_CONSENT_VERSION;
}
