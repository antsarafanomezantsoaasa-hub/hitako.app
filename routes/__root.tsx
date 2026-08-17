import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteLayout } from "../components/site/SiteLayout";
import { AppBootSplash } from "../components/site/Splash";
import { CookieConsentBanner } from "../components/site/CookieConsentBanner";
import { AuthProvider } from "../hooks/use-auth";
import { CookieConsentProvider } from "../hooks/use-cookie-consent";
import { preloadSfx } from "../lib/sound-fx";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-brand">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Une erreur est survenue
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Rafraîchissez la page ou retournez à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HiTako Academy — la plateforme d'anglais conçue pour les Malgaches." },
      {
        name: "description",
        content:
          "La plateforme d'anglais conçue pour les Malgaches, pour transformer l'anglais en opportunités professionnelles et digitales. \n\nLEARN • GROW • SUCCEED ✨",
      },
      { name: "author", content: "HiTako Academy" },
      {
        property: "og:title",
        content: "HiTako Academy — la plateforme d'anglais conçue pour les Malgaches.",
      },
      {
        property: "og:description",
        content:
          "La plateforme d'anglais conçue pour les Malgaches, pour transformer l'anglais en opportunités professionnelles et digitales. \n\nLEARN • GROW • SUCCEED ✨",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "HiTako Academy — la plateforme d'anglais conçue pour les Malgaches.",
      },
      {
        name: "twitter:description",
        content:
          "La plateforme d'anglais conçue pour les Malgaches, pour transformer l'anglais en opportunités professionnelles et digitales. \n\nLEARN • GROW • SUCCEED ✨",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/3ApYR2OWn8R04jEHg0kqfh5cs4K3/social-images/social-1784107798411-Screenshot_2026-02-09_083355.webp",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/3ApYR2OWn8R04jEHg0kqfh5cs4K3/social-images/social-1784107798411-Screenshot_2026-02-09_083355.webp",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // AuthProvider lives here, not inside RootComponent, on purpose: this
  // shell wraps *every* slot the router can render as `children` —
  // RootComponent (normal render), RoutePendingSplash (root route still
  // pending — see router.tsx's defaultPendingComponent), and ErrorComponent
  // alike. RoutePendingSplash calls useAuth() unconditionally, so if
  // AuthProvider only wrapped RootComponent, any render slow enough to hit
  // defaultPendingMs (250ms) — a cold dev-server compile, or in production a
  // slow first byte on a weak connection, which is this app's actual target
  // usage condition — would throw "useAuth must be used within AuthProvider"
  // instead of showing the pending splash. See KNOWN_ISSUES.md #1.
  //
  // Safe to hoist: AuthProvider only talks to the Supabase client directly
  // (see src/hooks/use-auth.tsx) and doesn't depend on QueryClientProvider
  // or route context, both of which stay scoped to RootComponent below.
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Fetch + decode every SFX file into memory as early as possible, so the
  // very first button tap anywhere already has zero-latency audio ready to
  // go instead of falling back to the synth (see src/lib/sound-fx.ts).
  useEffect(() => {
    preloadSfx();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CookieConsentProvider>
        <AppBootSplash>
          <SiteLayout>
            <Outlet />
          </SiteLayout>
          {/* Rendered on every route, including the immersive /free-registration
              and member-area shells that hide the usual nav/footer chrome —
              consent has to be asked regardless of which layout is active. */}
          <CookieConsentBanner />
        </AppBootSplash>
      </CookieConsentProvider>
    </QueryClientProvider>
  );
}
