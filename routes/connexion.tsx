import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogIn, Mail, Lock, AlertCircle, KeyRound } from "lucide-react";
import { PageHero } from "@/components/site/shared";
import { supabase } from "@/integrations/supabase/client";
import { getFreeHomeHref } from "@/lib/free-tier";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Se connecter | HiTako Academy" },
      {
        name: "description",
        content:
          "Connectez-vous à votre espace étudiant HiTako Academy pour accéder à vos cours et ressources.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Se connecter — HiTako Academy" },
      { property: "og:description", content: "Accès à l'espace étudiant HiTako Academy." },
    ],
  }),
  component: ConnexionPage,
});

function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError || !data.user) {
      setError(signInError?.message ?? "E-mail ou mot de passe incorrect.");
      return;
    }
    // Route by role: admins -> /admin, free members -> /zero or
    // /bienvenue-coach (depending on which track they picked at
    // registration — see src/lib/free-tier.ts), everyone else -> /mon-espace.
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const roles = (roleRows ?? []).map((r) => r.role);

    let destination = "/mon-espace";
    if (roles.includes("admin")) {
      destination = "/admin";
    } else if (roles.includes("free")) {
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("preferred_format")
        .eq("id", data.user.id)
        .maybeSingle();
      destination = getFreeHomeHref(profileRow?.preferred_format);
    }
    navigate({ to: destination });
  };

  return (
    <>
      <PageHero
        eyebrow="Espace étudiant"
        title={
          <>
            Se <span className="text-gradient-brand">connecter</span>
          </>
        }
        subtitle="Accédez à votre tableau de bord, à vos cours et à vos ressources HiTako."
      />
      <section className="mx-auto max-w-md px-5 pb-24 md:px-8">
        <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-card backdrop-blur md:p-8">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">Adresse e-mail</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@exemple.com"
                  className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">Code d'entrée</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </label>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-5 text-center text-sm text-ink-soft">
            Première visite ? <br />
            <Link
              to="/free-registration"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Inscription gratuite
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-ink-soft">
          Seuls les étudiants dont le compte a été activé par HiTako Academy peuvent accéder au
          tableau de bord.
        </p>
      </section>
    </>
  );
}
