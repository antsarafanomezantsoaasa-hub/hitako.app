import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  isConsentStale,
  loadCookieConsent,
  saveCookieConsent,
  type CookieConsentStatus,
} from "@/lib/cookie-consent";

type CookieConsentContextValue = {
  /** null until a decision is loaded/made, or once a decision is stale (policy changed). */
  status: CookieConsentStatus | null;
  /** Whether the app has finished checking localStorage/cookies for a prior decision. */
  ready: boolean;
  /** Whether the accept/decline banner should currently be visible. */
  isBannerOpen: boolean;
  accept: () => void;
  decline: () => void;
  /** Reopens the banner so a visitor can change an earlier choice (see the footer link). */
  openPreferences: () => void;
  /** Convenience flag for gating any future non-essential script (analytics, pixels, ...). */
  hasAnalyticsConsent: boolean;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CookieConsentStatus | null>(null);
  const [ready, setReady] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);

  // Runs once on mount, client-side only — localStorage/cookies don't exist
  // during SSR, so checking here (rather than during render) avoids a
  // hydration mismatch between server and client markup.
  useEffect(() => {
    const record = loadCookieConsent();
    if (record && !isConsentStale(record)) {
      setStatus(record.status);
      setIsBannerOpen(false);
    } else {
      setStatus(null);
      setIsBannerOpen(true);
    }
    setReady(true);
  }, []);

  const decide = (next: CookieConsentStatus) => {
    saveCookieConsent(next);
    setStatus(next);
    setIsBannerOpen(false);
  };

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      status,
      ready,
      isBannerOpen,
      accept: () => decide("accepted"),
      decline: () => decide("declined"),
      openPreferences: () => setIsBannerOpen(true),
      hasAnalyticsConsent: status === "accepted",
    }),
    // decide() is intentionally omitted — it's a stable closure over setters only.

    [status, ready, isBannerOpen],
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return ctx;
}
