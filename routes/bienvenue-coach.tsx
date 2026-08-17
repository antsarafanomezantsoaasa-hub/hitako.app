import { useEffect, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Sparkles, Unlock } from "lucide-react";
import { ConfirmCoachRegistration } from "@/components/site/confirm-coach-registration";
import { useAuth } from "@/hooks/use-auth";
import MemberAppShell from "@/components/site/member-space/MemberAppShell";

export const Route = createFileRoute("/bienvenue-coach")({
  head: () => ({
    meta: [
      { title: "Bienvenue | HiT START Coach — HiTako Academy" },
      {
        name: "description",
        content:
          "Ton inscription à HiT START Coach est reçue. Découvre comment fonctionne l'accompagnement en direct et confirme ta place.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BienvenueCoachPage,
});

// /bienvenue-coach is the Coach-track twin of /zero (the Daily-track free
// home): same MemberAppShell chrome (top bar + bottom tabs + sign-out) so
// Game Arena, Hall of Fame and the rest of the member area behave the same
// regardless of format, but the main content is entirely different — there
// is no lesson path to preview here, only the live-coaching onboarding +
// payment flow (see ConfirmCoachRegistration), since HiT START Coach is
// delivered live on WhatsApp rather than through in-app lessons.
function BienvenueCoachPage() {
  const navigate = useNavigate();
  const { loading, user, profile, role, signOut } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/connexion" });
      return;
    }
    // /bienvenue-coach is reserved for "free" accounts on the Coach track —
    // send every other case to its own home instead of showing this page.
    if (role === "admin") navigate({ to: "/admin" });
    else if (role === "member") navigate({ to: "/mon-espace" });
    else if (role === "free" && profile?.preferred_format !== "coach") navigate({ to: "/zero" });
  }, [loading, user, role, profile, navigate]);

  const displayName = useMemo(
    () => profile?.full_name?.trim() || user?.email?.split("@")[0] || "Membre",
    [profile, user],
  );

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  if (loading || !user || !profile || role !== "free" || profile.preferred_format !== "coach") {
    return (
      <div className="app-viewport flex items-center justify-center bg-member-canvas">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MemberAppShell
      profile={profile}
      user={user}
      displayName={displayName}
      onSignOut={handleSignOut}
      homeHref="/bienvenue-coach"
    >
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-primary/20 bg-card px-4 py-3 shadow-sticker-soft">
          <Unlock className="h-4 w-4 shrink-0 text-primary" />
          <p className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground">
            Ta place en <strong className="text-foreground">HiT START Coach</strong> est réservée.
            Confirme ton paiement ci-dessous pour rejoindre ton groupe WhatsApp.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 py-6">
        <ConfirmCoachRegistration displayName={displayName} />

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm sm:flex-row">
          <Link
            to="/tarifs"
            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
          >
            <Sparkles className="h-4 w-4" />
            Voir aussi le programme à ton rythme (Daily)
          </Link>
        </div>
      </div>
    </MemberAppShell>
  );
}
