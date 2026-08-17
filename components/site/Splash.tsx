import { useEffect, useState, type ReactNode } from "react";
import { Flame, Sparkles } from "lucide-react";
import { useAuth, type AppRole, type MemberProfile } from "@/hooks/use-auth";
import { MemberAvatar } from "@/components/MemberAvatar";
import { cn } from "@/lib/utils";
import logoMark from "@/assets/hitako-logo-mark.png";

/**
 * Splash screens shown while the site is loading.
 *
 * - `PublicSplash`  — brand/marketing moment shown to visitors.
 * - `MemberSplash`  — personalised "welcome back" moment shown to signed-in
 *                      members (and admins), built from their real profile data.
 *
 * `AppBootSplash` gates the very first render of the app (boot + auth check).
 * `RoutePendingSplash` is wired into the router so slower in-app navigations
 * (code-split chunks, data loads) get the same branded treatment instead of
 * a blank screen.
 */

const MIN_DISPLAY_MS = 550;
const MAX_WAIT_MS = 4000;
const EXIT_MS = 700;

const SESSION_KEY_RE = /^sb-.*-auth-token$/;

/** Best-effort, synchronous guess at whether a member is already signed in,
 *  read straight from localStorage so we can pick the right splash variant
 *  before the async auth check has resolved. Never throws. */
function hasStoredSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && SESSION_KEY_RE.test(key)) {
        const raw = window.localStorage.getItem(key);
        if (raw && raw.includes('"access_token"')) return true;
      }
    }
  } catch {
    // Storage unavailable (private browsing, SSR) — assume no session.
  }
  return false;
}

/* ---------- OFFICIAL LOGO BADGE (shared, circular, tinted per variant) ---------- */
function LogoBadge({
  variant,
  className,
  imgClassName,
}: {
  variant: "public" | "member";
  className?: string;
  imgClassName?: string;
}) {
  const light = variant === "public";
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full",
        light
          ? "bg-surface-glass shadow-glow backdrop-blur"
          : "bg-card shadow-card border border-border",
        className,
      )}
    >
      <img
        src={logoMark}
        alt="HiTako Academy"
        className={cn("w-[76%] object-contain", light && "drop-shadow-sm", imgClassName)}
      />
    </div>
  );
}

/* ---------- SHARED TAGLINE ---------- */
function BrandTagline({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-[0.3em]", className)}>
      Learn <span className="mx-1.5 opacity-50">-</span> Grow{" "}
      <span className="mx-1.5 opacity-50">-</span> Succeed
    </p>
  );
}

/* ---------- PUBLIC SPLASH ---------- */
export function PublicSplash({ leaving = false }: { leaving?: boolean }) {
  return (
    <div
      aria-hidden={leaving}
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-brand transition-all ease-out",
        leaving
          ? "pointer-events-none opacity-0 scale-[1.04] duration-700"
          : "opacity-100 scale-100 duration-300",
      )}
      style={{ transitionDuration: leaving ? `${EXIT_MS}ms` : undefined }}
    >
      <span role="status" aria-live="polite" className="sr-only">
        Chargement de HiTako Academy…
      </span>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-16 h-80 w-80 rounded-full bg-white/10 blur-[100px] animate-float" />
        <div
          className="absolute -bottom-28 -left-20 h-96 w-96 rounded-full bg-primary-glow/25 blur-[110px] animate-float"
          style={{ animationDelay: "1.2s" }}
        />
      </div>

      <div className="relative flex flex-col items-center px-6 text-center animate-splash-in">
        <div className="relative mb-6 flex items-center justify-center">
          <span className="absolute inline-flex h-24 w-24 rounded-full animate-pulse-ring md:h-28 md:w-28" />
          <LogoBadge variant="public" className="h-24 w-24 md:h-28 md:w-28" />
        </div>

        <p className="font-display text-2xl font-bold tracking-tight text-primary-foreground md:text-3xl">
          HiTako <span className="font-normal text-primary-foreground/80">Academy</span>
        </p>
        <BrandTagline className="mt-2 text-primary-foreground/70" />

        <div className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-white/15 md:w-52">
          <div className="h-full w-1/3 rounded-full bg-white/90 animate-splash-bar" />
        </div>
      </div>
    </div>
  );
}

/* ---------- MEMBER SPLASH ---------- */
function levelBadge(role: AppRole, profile: MemberProfile | null): string | null {
  if (role === "admin") return "Administrateur";
  if (role === "free") return "Programme ZERO";
  return profile?.level ?? null;
}

export function MemberSplash({ leaving = false }: { leaving?: boolean }) {
  const { user, profile, role } = useAuth();
  const displayName = profile?.full_name?.trim() || user?.email?.split("@")[0] || null;
  const firstName = displayName?.split(/\s+/)[0] ?? null;
  const badge = levelBadge(role, profile);
  const ready = !!profile;

  const r = 44;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, profile?.progress_percent ?? 0));
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div
      aria-hidden={leaving}
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background transition-all ease-out",
        leaving
          ? "pointer-events-none opacity-0 scale-[1.04] duration-700"
          : "opacity-100 scale-100 duration-300",
      )}
      style={{ transitionDuration: leaving ? `${EXIT_MS}ms` : undefined }}
    >
      <span role="status" aria-live="polite" className="sr-only">
        Préparation de votre espace HiTako Academy…
      </span>
      <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />

      <div className="relative flex flex-col items-center px-6 text-center animate-splash-in">
        <LogoBadge variant="member" className="mb-5 h-14 w-14 md:h-16 md:w-16" />

        <div className="relative flex h-28 w-28 items-center justify-center md:h-32 md:w-32">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="3.5" />
            {ready ? (
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="url(#member-ring-grad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)" }}
              />
            ) : (
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="url(#member-ring-grad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${circumference * 0.22} ${circumference * 0.78}`}
                className="origin-center animate-spin"
                style={{ animationDuration: "1.1s" }}
              />
            )}
            <defs>
              <linearGradient id="member-ring-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--brand-deep)" />
                <stop offset="100%" stopColor="var(--brand-sky)" />
              </linearGradient>
            </defs>
          </svg>
          <MemberAvatar
            name={displayName}
            avatarPath={profile?.avatar_url}
            className="h-20 w-20 rounded-full shadow-card md:h-24 md:w-24"
            fallbackClassName="rounded-full text-xl font-bold"
          />
        </div>

        <p className="mt-6 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
          {firstName ? `Bon retour, ${firstName}` : "Bon retour"}
        </p>
        <p className="mt-1.5 text-sm text-ink-soft">Préparation de votre espace d'apprentissage…</p>
        <BrandTagline className="mt-3 text-primary/60" />

        {(badge || (profile && profile.streak_days > 0)) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {badge}
              </span>
            )}
            {profile && profile.streak_days > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                <Flame className="h-3.5 w-3.5" />
                {profile.streak_days} jour{profile.streak_days > 1 ? "s" : ""} d'affilée
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- BOOT GATE (first load of the app) ---------- */
export function AppBootSplash({ children }: { children: ReactNode }) {
  const { loading: authLoading, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [guessMember, setGuessMember] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [forceReady, setForceReady] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGuessMember(hasStoredSession());
    const min = setTimeout(() => setMinElapsed(true), MIN_DISPLAY_MS);
    const max = setTimeout(() => setForceReady(true), MAX_WAIT_MS);
    return () => {
      clearTimeout(min);
      clearTimeout(max);
    };
  }, []);

  const ready = mounted && (minElapsed || forceReady) && (!authLoading || forceReady);

  useEffect(() => {
    if (!ready || unmounted) return;
    const t = setTimeout(() => setUnmounted(true), EXIT_MS + 50);
    return () => clearTimeout(t);
  }, [ready, unmounted]);

  const showMember = user ? true : authLoading ? guessMember : false;

  return (
    <>
      {!unmounted &&
        (showMember ? <MemberSplash leaving={ready} /> : <PublicSplash leaving={ready} />)}
      {children}
    </>
  );
}

/* ---------- ROUTE-TRANSITION SPLASH (slower in-app navigations) ---------- */
export function RoutePendingSplash() {
  const { user } = useAuth();
  return user ? <MemberSplash /> : <PublicSplash />;
}
