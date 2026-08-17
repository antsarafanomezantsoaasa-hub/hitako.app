import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
  KeyRound,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  User as UserIcon,
  X,
} from "lucide-react";
import logoAsset from "@/assets/hitako-logo-new.png";
import { ThemeToggle } from "./shared";
import { NewsletterDialog } from "./NewsletterDialog";
import { useAuth } from "@/hooks/use-auth";
import { MemberAvatar } from "@/components/MemberAvatar";
import { getFreeHomeHref } from "@/lib/free-tier";

// Ordered to walk a visitor through the product funnel HiTako now leads
// with — try a real lesson, understand the method, pick a programme, see
// pricing — before the lighter-weight/utility links. Physical
// events/community are deliberately not a top-level item here: they're a
// supporting layer under the app (see the Community section on "/"), never
// the dominant nav destination. See homepage-hierarchy report.
const LINKS = [
  { to: "/lecons-demo", label: "Leçons démo" },
  { to: "/pourquoi", label: "Pourquoi" },
  { to: "/programmes", label: "Programmes" },
  { to: "/tarifs", label: "Tarifs" },
  { to: "/test-niveau", label: "Test niveau" },
  { to: "/faq", label: "FAQ" },
] as const;

// Trimmed set shown in the mobile drawer once a member is logged in — the
// "member already inside the academy" links (demo lessons, pricing) matter
// less than the ones that still apply, so we drop them to keep the sheet
// short enough to always show the profile/logout footer above the fold.
const AUTHED_MOBILE_LINKS = LINKS.filter((l) => l.to !== "/lecons-demo" && l.to !== "/tarifs");

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, profile, role, isAdmin, signOut, loading } = useAuth();
  const isAuthed = !!user;
  const dashboardHref =
    role === "free" ? getFreeHomeHref(profile?.preferred_format) : "/mon-espace";

  // close drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [userMenuOpen]);

  async function handleSignOut() {
    setUserMenuOpen(false);
    setMobileOpen(false);
    await signOut();
    navigate({ to: "/" });
  }

  const displayName = profile?.full_name?.trim() || user?.email?.split("@")[0] || "Membre";
  const mobileLinks = isAuthed ? AUTHED_MOBILE_LINKS : LINKS;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-border/60 bg-surface-glass backdrop-blur-xl">
        <div className="mx-auto grid h-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-5 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoAsset}
              alt="HiTako Academy"
              className="h-10 w-auto"
              width={153}
              height={40}
            />
          </Link>
          <nav className="hidden items-center justify-center gap-8 md:flex" data-tour="nav-links">
            {LINKS.map((l) => {
              const isActive = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative pb-1 text-sm font-medium transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-ink-soft hover:text-primary"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left rounded-full bg-gradient-brand transition-transform duration-300 ease-out ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
          <div className="col-start-3 flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            {!isAuthed && !loading && (
              <>
                {/* Primary acquisition CTA — this is a marketing site, so the
                  most visible treatment (brand gradient, shadow, hover
                  scale) belongs to new-visitor sign-up, not to login. */}
                <Link
                  to="/free-registration"
                  className="group hidden items-center gap-1.5 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03] md:inline-flex"
                >
                  <KeyRound className="h-4 w-4" />
                  Inscription gratuite
                </Link>
                <Link
                  to="/connexion"
                  className="hidden items-center gap-1.5 rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-accent hover:text-accent-foreground lg:inline-flex"
                >
                  <LogIn className="h-4 w-4" />
                  Se connecter
                </Link>
              </>
            )}
            {isAuthed && (
              <>
                <Link
                  to={dashboardHref}
                  className="hidden items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03] md:inline-flex"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Mon espace
                </Link>
                <div ref={menuRef} className="relative hidden md:block">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-label="Menu utilisateur"
                    aria-expanded={userMenuOpen}
                    className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border shadow-card backdrop-blur transition hover:scale-105"
                  >
                    <MemberAvatar
                      name={displayName}
                      avatarPath={profile?.avatar_url}
                      className="h-full w-full rounded-full"
                      fallbackClassName="rounded-full bg-card/70 text-sm font-bold text-primary"
                    />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-64 rounded-2xl border border-border bg-card p-2 shadow-elegant animate-fade-in-soft">
                      <div className="px-3 py-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                        {profile && (
                          <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            {profile.level}
                          </span>
                        )}
                      </div>
                      <div className="my-1 h-px bg-border" />
                      <Link
                        to={dashboardHref}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-accent"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Tableau de bord
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-accent"
                        >
                          <UserIcon className="h-4 w-4" />
                          Admin
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            <button
              aria-label="Menu"
              data-tour="nav-links"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/70 text-ink shadow-card backdrop-blur md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — rendered as a sibling of <header>, not nested inside
          it. The header only carries z-50 when stacked against elements
          outside it (like the FloatingCta button, z-55), so a drawer nested
          inside the header could never out-rank the CTA no matter how high
          its own z-index was set. As a top-level element it can. */}
      <div
        className={`fixed inset-0 z-[80] md:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <aside
          className={`absolute inset-0 flex h-dvh w-full flex-col bg-background text-foreground transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-[72px] items-center justify-between border-b border-border/60 bg-card/60 px-5 backdrop-blur">
            <img src={logoAsset} alt="HiTako Academy" className="h-9 w-auto" />
            <button
              aria-label="Fermer le menu"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/70 text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto bg-background p-4">
            {mobileLinks.map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="group flex items-center justify-between rounded-2xl px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                style={{
                  animation: mobileOpen ? `slide-down 0.35s ease-out ${i * 60}ms both` : "none",
                }}
              >
                {l.label}
                <ArrowRight className="h-5 w-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 border-t border-border/60 bg-card/60 p-4 backdrop-blur">
            {isAuthed ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-2.5">
                  <MemberAvatar
                    name={displayName}
                    avatarPath={profile?.avatar_url}
                    className="h-11 w-11 shrink-0 rounded-full"
                    fallbackClassName="rounded-full text-sm font-bold"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Link
                  to={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Mon espace
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <UserIcon className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/free-registration"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant"
                >
                  <KeyRound className="h-4 w-4" />
                  Inscription gratuite
                </Link>
                <Link
                  to="/connexion"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <LogIn className="h-4 w-4" />
                  Se connecter
                </Link>
              </div>
            )}
            {!isAuthed && (
              <NewsletterDialog
                source="nav"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3.5 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Newsletter
              </NewsletterDialog>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
