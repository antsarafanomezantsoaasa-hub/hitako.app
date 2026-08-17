import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, Mail, Lock, ShieldCheck, AlertCircle, CheckCircle2, LogIn } from "lucide-react";
import { PageHero } from "@/components/site/shared";

export const Route = createFileRoute("/premiere-connexion")({
  head: () => ({
    meta: [
      { title: "Première connexion | HiTako Academy" },
      {
        name: "description",
        content:
          "Activez votre compte étudiant HiTako Academy avec le code d'activation reçu par e-mail et définissez votre mot de passe.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Première connexion — HiTako Academy" },
      { property: "og:description", content: "Activation du compte étudiant HiTako Academy." },
    ],
  }),
  component: PremiereConnexionPage,
});

function PremiereConnexionPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (code.trim().length < 4) {
      setError("Le code d'activation semble invalide. Vérifiez l'e-mail reçu de HiTako Academy.");
      return;
    }

    setLoading(true);
    // UI-only mock — real activation will validate the code server-side.
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 800);
  };

  if (success) {
    return (
      <>
        <PageHero
          eyebrow="Activation"
          title={
            <>
              Compte <span className="text-gradient-brand">activé</span>
            </>
          }
          subtitle="Bienvenue dans la communauté HiTako Academy."
        />
        <section className="mx-auto max-w-md px-5 pb-24 md:px-8">
          <div className="rounded-3xl border border-border bg-card/70 p-8 text-center shadow-card backdrop-blur">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">Votre compte est prêt</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Vous pouvez maintenant vous connecter avec votre adresse e-mail et le mot de passe que
              vous venez de définir.
            </p>
            <Link
              to="/connexion"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]"
            >
              <LogIn className="h-4 w-4" />
              Aller à la connexion
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Activation du compte"
        title={
          <>
            Première <span className="text-gradient-brand">connexion</span>
          </>
        }
        subtitle="Activez votre accès étudiant avec le code reçu de HiTako Academy et créez votre mot de passe."
      />
      <section className="mx-auto max-w-md px-5 pb-24 md:px-8">
        <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-card backdrop-blur md:p-8">
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-sm text-ink">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <p>
              Vous avez reçu un <strong>code d'activation</strong> par e-mail après votre
              inscription confirmée par HiTako Academy. Utilisez-le ci-dessous.
            </p>
          </div>

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
              <span className="text-sm font-medium text-ink">Code d'activation</span>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                <input
                  type="text"
                  required
                  inputMode="text"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="HITAKO-XXXX"
                  className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm tracking-wider text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">Nouveau mot de passe</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Au moins 8 caractères"
                  className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">Confirmer le mot de passe</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
              <ShieldCheck className="h-4 w-4" />
              {loading ? "Activation..." : "Activer mon compte"}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-5 text-center text-sm text-ink-soft">
            Déjà activé ?{" "}
            <Link to="/connexion" className="font-semibold text-primary hover:underline">
              Se connecter
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-ink-soft">
          Pas encore de code ? Écrivez-nous après votre inscription — HiTako Academy vous l'envoie
          par e-mail une fois votre compte validé.
        </p>
      </section>
    </>
  );
}
