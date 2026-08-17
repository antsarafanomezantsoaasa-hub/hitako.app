import { useEffect, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import logoAsset from "@/assets/hitako-logo-new.png";
import { FloatingCta, ScrollProgress, ThemeProvider } from "./shared";
import { Nav } from "./Nav";
import { OnboardingTour } from "./onboarding-tour";
import { useAppViewport } from "@/hooks/use-app-viewport";
import { useCookieConsent } from "@/hooks/use-cookie-consent";

function Footer() {
  const { openPreferences } = useCookieConsent();
  return (
    <footer className="border-t border-border bg-secondary/40 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 md:flex-row md:px-8">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoAsset}
              alt="HiTako Academy"
              className="h-10 w-auto"
              width={153}
              height={40}
            />
          </Link>
          <p className="text-xs text-ink-soft">
            La plateforme d'anglais conçue pour les Malgaches.
          </p>
        </div>
        <p className="text-center text-sm text-ink-soft">
          © {new Date().getFullYear()} HiTako Academy Madagascar. Learn. Grow. Succeed.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-soft">
          <Link to="/programmes" className="hover:text-primary">
            Programmes
          </Link>
          <Link to="/tarifs" className="hover:text-primary">
            Tarifs
          </Link>
          <Link to="/faq" className="hover:text-primary">
            FAQ
          </Link>
          <Link to="/conditions-generales" className="hover:text-primary">
            Conditions générales
          </Link>
          <button type="button" onClick={openPreferences} className="hover:text-primary">
            Gérer les cookies
          </button>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Hide the public website chrome across the member area:
  // - /mon-espace and every route nested under it (/mon-espace/family, etc.
  //   — see src/routes/mon-espace/*)
  // - /zero, the Daily-track free-tier home (renders the same MemberSpaceShell)
  // - /bienvenue-coach, its Coach-track twin (see src/routes/bienvenue-coach.tsx)
  // - /jeux, the Game Arena, and any standalone game route nested under it
  // - /hall-of-fame, the top-level Hall of Fame shared by /zero,
  //   /bienvenue-coach and /mon-espace alike (see src/routes/hall-of-fame.tsx)
  // - any lesson route (/lecon-01, /lecon-02, ...) including demo lessons
  // - /expression-du-jour/<slug>, each daily-expression lesson itself (full
  //   HiT-lesson treatment, same as /lecon-demo-18) — but NOT bare
  //   /expression-du-jour, which is a hub page and keeps the normal site
  //   chrome, same as /lecons-demo
  const isMemberArea =
    pathname === "/mon-espace" ||
    pathname.startsWith("/mon-espace/") ||
    pathname === "/zero" ||
    pathname === "/bienvenue-coach" ||
    pathname === "/jeux" ||
    pathname === "/hall-of-fame" ||
    /^\/lecon(-|$)/.test(pathname) ||
    pathname.startsWith("/expression-du-jour/") ||
    // standalone games launched from the Game Arena (e.g. /jeux/flashcards)
    /^\/jeux\/.+/.test(pathname);
  const isMonEspace = isMemberArea;

  // The free-registration wizard is a focused, conversion-style page (its
  // own brand panel replaces the usual top nav/logo — see BrandHeader in
  // free-registration.tsx) — the standard site chrome would just duplicate
  // that branding and give visitors a way to wander off mid-signup.
  const isImmersive = pathname === "/free-registration";

  // Routes that render the fixed, app-style MemberAppShell (top bar + bottom
  // tabs + a single internal scroller). Only these lock the document: lesson
  // and standalone game pages are ordinary scrolling documents.
  const usesAppShell =
    pathname === "/mon-espace" ||
    pathname.startsWith("/mon-espace/") ||
    pathname === "/zero" ||
    pathname === "/bienvenue-coach" ||
    pathname === "/jeux" ||
    pathname === "/hall-of-fame";

  // Presentation only: measure the real viewport height into --app-vh and,
  // inside the app-shell routes, stop the document from scrolling behind the
  // fixed shell (that gap was the blank white band under the bottom tabs).
  useAppViewport(usesAppShell);

  // Scroll to top on route change (TanStack scrollRestoration handles back/forward)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  if (isMonEspace) {
    return (
      <ThemeProvider>
        <div
          className={
            usesAppShell
              ? "app-viewport w-full overflow-hidden bg-background text-foreground"
              : "min-h-screen overflow-x-hidden bg-background text-foreground"
          }
        >
          <main className={usesAppShell ? "h-full" : undefined}>{children}</main>
        </div>
      </ThemeProvider>
    );
  }

  if (isImmersive) {
    return (
      <ThemeProvider>
        <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
          <main>{children}</main>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <ScrollProgress />
        <Nav />
        <div className="h-[72px]" aria-hidden="true" />
        <main>{children}</main>
        <Footer />
        <FloatingCta />
        <OnboardingTour />
      </div>
    </ThemeProvider>
  );
}
