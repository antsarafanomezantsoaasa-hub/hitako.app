import { useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import MemberAppShell from "@/components/site/member-space/MemberAppShell";
import { HallOfFame } from "@/components/site/member-space/HallOfFame";
import { getFreeHomeHref } from "@/lib/free-tier";

export const Route = createFileRoute("/hall-of-fame")({
  head: () => ({
    meta: [
      { title: "Hall of Fame | HiTako Academy" },
      {
        name: "description",
        content:
          "Weekly leaderboards celebrating HiTako Academy's top learners, most consistent streaks and most dedicated study time.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: HallOfFamePage,
});

/**
 * /hall-of-fame — top-level route (not nested under /mon-espace) so it's
 * reachable from BOTH the free-tier home (/zero) and the full member space
 * (/mon-espace) via the same bottom-tab link, same pattern /jeux already
 * uses. Previously this page only existed at /mon-espace/hall-of-fame and
 * was locked for the "free" role (see MemberBottomTabs.tsx); it's now open
 * to any signed-in member, since it only ever reads — never gates progress.
 */
function HallOfFamePage() {
  const navigate = useNavigate();
  const { loading, user, profile, role, signOut } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/connexion" });
  }, [loading, user, navigate]);

  const displayName = useMemo(
    () => profile?.full_name?.trim() || user?.email?.split("@")[0] || "Membre",
    [profile, user],
  );

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  if (loading || !user || !profile) {
    return (
      <div className="app-viewport flex items-center justify-center bg-member-canvas">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const homeHref = role === "free" ? getFreeHomeHref(profile?.preferred_format) : "/mon-espace";

  return (
    <MemberAppShell
      profile={profile}
      user={user}
      displayName={displayName}
      onSignOut={handleSignOut}
      homeHref={homeHref}
    >
      <div className="px-4 py-5">
        <HallOfFame />
      </div>
    </MemberAppShell>
  );
}
