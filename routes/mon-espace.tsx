import { useEffect, useMemo } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import MemberAppShell from "@/components/site/member-space/MemberAppShell";
import { getFreeHomeHref } from "@/lib/free-tier";

export const Route = createFileRoute("/mon-espace")({
  // Login-gated and already noindex/nofollow — no SEO or social-preview
  // reason to server-render it. Turning SSR off means the initial HTML is
  // just the shared app shell; member content (name, progress, stats,
  // daily phrase, etc.) only exists once the client JS mounts it, so "view
  // source" no longer shows any of it. Every route nested under
  // src/routes/mon-espace/* (index, family, hall-of-fame, pulse, progress,
  // guide) inherits this automatically — Selective SSR only lets children
  // be *more* restrictive than their parent, never less.
  ssr: false,
  head: () => ({
    meta: [
      { title: "My Space | HiTako Academy" },
      {
        name: "description",
        content: "Your HiTako Academy member space: lessons, progress, community and more.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MonEspaceLayout,
});

// This is the shared layout for the whole /mon-espace member area: it owns
// auth-gating (redirect signed-out visitors to /connexion, free-tier
// accounts to /zero or /bienvenue-coach depending on their track) and
// renders the app shell once around whichever child route is active (see
// src/routes/mon-espace/index.tsx, src/routes/mon-espace/family.tsx, etc. —
// each is a real URL now instead of a client-side tab inside a single page).
function MonEspaceLayout() {
  const navigate = useNavigate();
  const { loading, user, profile, role, signOut } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/connexion" });
      return;
    }
    if (role === "free") navigate({ to: getFreeHomeHref(profile?.preferred_format) });
  }, [loading, user, role, profile, navigate]);

  const displayName = useMemo(
    () => profile?.full_name?.trim() || user?.email?.split("@")[0] || "Member",
    [profile, user],
  );

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  if (loading || !profile || !user || role === "free") {
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
    >
      <div className="px-4 py-5">
        <Outlet />
      </div>
    </MemberAppShell>
  );
}
