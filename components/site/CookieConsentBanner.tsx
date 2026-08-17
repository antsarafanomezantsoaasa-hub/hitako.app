import { Cookie, ShieldCheck } from "lucide-react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";

/**
 * Bottom banner shown until the visitor makes an explicit choice. There is
 * deliberately no "X to dismiss" that skips the decision — Accept and
 * Decline are the only two ways to close it, and both are equally styled
 * (no dark-pattern "Accept" button dressed up bigger than "Decline").
 *
 * Once a choice is made it's persisted (see src/lib/cookie-consent.ts) and
 * this stops rendering. Visitors can reopen it any time via "Gérer les
 * cookies" in the footer (SiteLayout.tsx), which calls openPreferences().
 */
export function CookieConsentBanner() {
  const { ready, isBannerOpen, accept, decline } = useCookieConsent();

  // Nothing to show before we've checked storage, or once a decision exists
  // and the visitor hasn't asked to revisit it.
  if (!ready || !isBannerOpen) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Préférences relatives aux cookies"
      className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4 md:px-6 md:pb-6"
      style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}
    >
      <div className="mx-auto max-w-3xl animate-pop-in overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:gap-6 md:p-6">
          <div className="flex items-start gap-3 md:items-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Cookie className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-ink md:text-base">
                Vos données, votre choix
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft md:text-sm">
                Nous utilisons des cookies essentiels au fonctionnement du site (connexion,
                préférences) et, si vous l'acceptez, des cookies de mesure d'audience pour améliorer
                HiTako Academy. Consultez notre{" "}
                <a
                  href="/conditions-generales#privacy"
                  className="font-semibold text-primary hover:underline"
                >
                  politique de confidentialité
                </a>
                .
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2.5">
            <button
              type="button"
              onClick={decline}
              className="flex-1 rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary md:flex-none"
            >
              Refuser
            </button>
            <button
              type="button"
              onClick={accept}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] md:flex-none"
            >
              <ShieldCheck className="h-4 w-4" />
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
