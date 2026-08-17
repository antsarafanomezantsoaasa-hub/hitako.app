import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  UserRound,
  Mail,
  Phone,
  Clock,
  Lock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Quote,
  Users,
  Smartphone,
  Check,
} from "lucide-react";
import { PageHero } from "@/components/site/shared";
import { submitFreeRegistration } from "@/lib/registration.functions";
import { getSiteSettings } from "@/lib/settings.functions";
import { supabase } from "@/integrations/supabase/client";
import { getFreeHomeHref, type PreferredFormat } from "@/lib/free-tier";
import logoAsset from "@/assets/hitako-logo-new.png";

type FreeRegistrationSearch = { format?: PreferredFormat };

export const Route = createFileRoute("/free-registration")({
  // Lets /tarifs' "HiT START Coach" / "HiT START" buttons pre-select
  // the matching option on the Formule step below (?format=coach or
  // ?format=daily) — anything else falls back to no pre-selection.
  validateSearch: (search: Record<string, unknown>): FreeRegistrationSearch => ({
    format: search.format === "coach" || search.format === "daily" ? search.format : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Inscription gratuite | HiTako Academy" },
      {
        name: "description",
        content:
          "Inscrivez-vous gratuitement à HiTako Academy et accédez immédiatement à votre espace HiT START.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Inscription gratuite — HiTako Academy" },
      {
        property: "og:description",
        content: "Créez votre compte étudiant HiTako Academy en quelques secondes.",
      },
    ],
  }),
  component: FreeRegistrationPage,
});

/**
 * The registration wizard below maps onto the fields submitFreeRegistration
 * actually accepts (full_name, email, phone, password, preferred_format) —
 * see src/lib/registration.functions.ts. It groups them the way a visitor
 * thinks about them (formule → account → password → contact) rather than
 * adding fields the backend has nowhere to store.
 *
 * Step 1 ("Formule") is the HiT START Coach vs HiT START (self-paced)
 * choice. It decides where the visitor lands after signing up (see getFreeHomeHref)
 * and which payment amount HiTako staff should expect — everything else is
 * unchanged from the pre-existing 3-step flow.
 */
const STEPS = [
  { eyebrow: "Formule", title: "Choisissez votre formule" },
  { eyebrow: "Compte", title: "Vos informations" },
  { eyebrow: "Sécurité", title: "Choisissez un mot de passe" },
  { eyebrow: "Contact", title: "Vos coordonnées" },
] as const;
const TOTAL_STEPS = STEPS.length;

const FORMAT_OPTIONS: {
  id: PreferredFormat;
  icon: typeof Users;
  title: string;
  price: string;
  period: string;
  desc: string;
  badge?: string;
}[] = [
  {
    id: "coach",
    icon: Users,
    title: "HiT START Coach",
    price: "150 000 Ar",
    period: "/ 2 mois",
    desc: "Cours en direct en petit groupe (max. 6), coach en direct via WhatsApp, 4 sessions/semaine.",
  },
  {
    id: "daily",
    icon: Smartphone,
    title: "HiT START",
    price: "49 000 Ar",
    period: "/ jusqu'à 6 mois",
    desc: "80 leçons à ton rythme, directement dans l'application, où que tu sois.",
    badge: "Meilleur prix",
  },
];

// Decorative program overview shown on the brand panel — copy mirrors the
// real 3-level HiTako curriculum described in sections.tsx (Paths component):
// HiT START (débutants) → HiT FLOW (intermédiaire) → HiT PRO (avancé),
// rather than inventing new claims.
const JOURNEY_STAGES = [
  {
    eyebrow: "Niveau 1 · Débutants",
    title: "HiT START",
    desc: "Bases solides à ton rythme, avec un accès pouvant aller jusqu'à 6 mois : salutations, vocabulaire du quotidien, premières conversations en confiance.",
  },
  {
    eyebrow: "Niveau 2 · Intermédiaire",
    title: "HiT FLOW",
    desc: "Fluidité, aisance à l'oral et vocabulaire professionnel.",
  },
  {
    eyebrow: "Niveau 3 · Avancé",
    title: "HiT PRO",
    desc: "Anglais des affaires, leadership et opportunités à l'international.",
  },
] as const;

function BrandHeader() {
  return (
    <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
      <Link to="/" className="flex items-center gap-2.5">
        <img src={logoAsset} alt="HiTako Academy" className="h-8 w-auto" width={122} height={32} />
      </Link>
      <Link
        to="/connexion"
        className="text-sm font-medium text-ink-soft transition hover:text-primary"
      >
        Déjà un compte ? <span className="font-semibold text-primary">Se connecter</span>
      </Link>
    </div>
  );
}

function StepProgress({ step }: { step: number }) {
  const pct = (step / TOTAL_STEPS) * 100;
  const meta = STEPS[step - 1];
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          Étape {step} sur {TOTAL_STEPS} · {meta.eyebrow}
        </span>
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s.title}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i < step ? "bg-gradient-brand" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
      <h2 className="mt-2 font-display text-2xl font-bold text-foreground">{meta.title}</h2>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-gradient-brand transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="relative overflow-hidden bg-gradient-brand p-8 text-primary-foreground md:p-10 lg:flex lg:h-full lg:flex-col lg:justify-between lg:p-12">
      <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2 shadow-elegant">
          <img src={logoAsset} alt="HiTako Academy" className="h-6 w-auto" width={92} height={24} />
        </span>

        <div className="mt-8 h-1 w-10 rounded-full bg-white/60" />
        <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-4xl">
          Votre parcours HiTako commence ici.
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/85 md:text-base">
          La méthode d'anglais pensée pour les Malgaches. Rejoignez un groupe de 6 apprenants
          maximum et parlez anglais dès votre première session.
        </p>
      </div>

      <div className="relative mt-10 hidden lg:block">
        <ol className="space-y-5 border-l border-white/25 pl-5">
          {JOURNEY_STAGES.map((s, i) => (
            <li key={s.title} className="relative">
              <span
                className={`absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full ${
                  i === 0 ? "bg-white" : "bg-white/40"
                }`}
              />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                {s.eyebrow}
              </p>
              <p className="font-display text-sm font-bold text-white">{s.title}</p>
              <p className="mt-0.5 text-xs text-white/70">{s.desc}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
          <Quote className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
          <div>
            <p className="text-sm italic text-white/90">
              Je crois profondément que chaque Malgache mérite de parler anglais avec fierté et
              d'accéder aux opportunités que cette langue ouvre. C'est cette conviction qui a donné
              naissance à HiTako — et c'est avec la même détermination que je vous accompagne, vous,
              dès aujourd'hui.
            </p>
            <p className="mt-1 text-xs font-semibold text-white/60">
              — Antsa Rafanomezantsoa, fondateur de HiTako Academy
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-white/60">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Compte gratuit — accès instantané à votre espace HiT START.
        </div>
      </div>
    </div>
  );
}

function FreeRegistrationPage() {
  const submitFreeRegistrationFn = useServerFn(submitFreeRegistration);
  const getSiteSettingsFn = useServerFn(getSiteSettings);
  const navigate = useNavigate();
  const search = Route.useSearch();
  // Whether the admin panel currently accepts new free registrations — checked
  // before the form is shown so a visitor never fills it out just to be
  // rejected at submit time.
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [step, setStep] = useState(1);
  // Pre-selected from ?format=coach|daily when the visitor arrives from a
  // specific /tarifs CTA; otherwise no default so the choice always
  // reflects a deliberate tap on the Formule step below.
  const [format, setFormat] = useState<PreferredFormat | null>(search.format ?? null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Fallback for the rare case where the account was created successfully
  // but the immediate client-side sign-in call fails (e.g. a network blip).
  const [signInFailed, setSignInFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const settings = await getSiteSettingsFn();
        if (!cancelled) setRegistrationOpen(settings.free_registration_open);
      } catch (err) {
        // Fail open: a hiccup on this check shouldn't lock out a genuine
        // visitor — worst case, submission fails later with its own message.
        console.error("[free-registration] getSiteSettings failed:", err);
      } finally {
        if (!cancelled) setCheckingAvailability(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Step 1 — formule (Coach vs Daily). Must have a selection to proceed.
    if (step === 1) {
      if (!format) {
        setError("Veuillez choisir une formule pour continuer.");
        return;
      }
      setStep(2);
      return;
    }

    // Step 2 — account basics. Validate and advance; the actual submission
    // only happens once every step has been confirmed (step 4, below).
    if (step === 2) {
      if (firstName.trim().length < 1 || lastName.trim().length < 1) {
        setError("Veuillez indiquer votre prénom et votre nom.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setError("Adresse e-mail invalide.");
        return;
      }
      setStep(3);
      return;
    }

    // Step 3 — password.
    if (step === 3) {
      if (password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Les deux mots de passe ne correspondent pas.");
        return;
      }
      setStep(4);
      return;
    }

    // Step 4 — contact + final submission.
    if (phone.trim().length < 6) {
      setError("Veuillez indiquer un numéro de téléphone valide.");
      return;
    }
    // Guarded by step 1, but format is nullable in state — satisfy TS and
    // fall back defensively rather than submit an invalid value.
    const chosenFormat: PreferredFormat = format ?? "daily";

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);
    try {
      const result = await submitFreeRegistrationFn({
        data: {
          full_name: fullName,
          email: normalizedEmail,
          phone: phone.trim(),
          password,
          preferred_format: chosenFormat,
        },
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      // Account created — sign the visitor in right away and send them
      // straight to their (free-tier) space instead of making them wait
      // for an e-mail. Coach and Daily land on different pages from here.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (signInError) {
        console.error("[free-registration] auto sign-in failed:", signInError);
        setSignInFailed(true);
        return;
      }

      navigate({ to: getFreeHomeHref(chosenFormat) });
    } catch (err) {
      console.error("[free-registration] submitFreeRegistration failed:", err);
      setError("Impossible d'enregistrer votre inscription pour le moment. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAvailability) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!registrationOpen) {
    return (
      <div className="min-h-screen bg-background">
        <BrandHeader />
        <PageHero
          eyebrow="Inscriptions gratuites"
          title={
            <>
              Bientôt de <span className="text-gradient-brand">retour</span>
            </>
          }
          subtitle="Nous limitons volontairement le nombre de nouvelles inscriptions durant cette phase de démarrage."
        />
        <section className="mx-auto max-w-md px-5 pb-24 md:px-8">
          <div className="rounded-3xl border border-border bg-card/70 p-8 text-center shadow-card backdrop-blur">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Clock className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              Les inscriptions gratuites sont temporairement fermées
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Pour bien accompagner chaque étudiant durant cette phase de démarrage, nous limitons
              le nombre de nouveaux membres. Cette page rouvrira bientôt — revenez la consulter
              prochainement.
            </p>
            <Link
              to="/connexion"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]"
            >
              <KeyRound className="h-4 w-4" />
              J'ai déjà un compte
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (signInFailed) {
    return (
      <div className="min-h-screen bg-background">
        <BrandHeader />
        <PageHero
          eyebrow="Inscription réussie"
          title={
            <>
              Votre compte est <span className="text-gradient-brand">prêt</span>
            </>
          }
          subtitle="Merci et bienvenue chez HiTako Academy !"
        />
        <section className="mx-auto max-w-md px-5 pb-24 md:px-8">
          <div className="rounded-3xl border border-border bg-card/70 p-8 text-center shadow-card backdrop-blur">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">Compte créé</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Nous n'avons pas pu vous connecter automatiquement. Connectez-vous avec{" "}
              <strong>{email}</strong> et le mot de passe que vous venez de choisir.
            </p>
            <Link
              to="/connexion"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]"
            >
              <KeyRound className="h-4 w-4" />
              Se connecter
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />
      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-border shadow-card lg:grid-cols-2">
          <BrandPanel />

          <div className="flex flex-col justify-center bg-card/80 p-6 backdrop-blur md:p-8 lg:p-12">
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <StepProgress step={step} />

              {step === 1 && (
                <>
                  <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-sm text-ink">
                    <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <p>
                      L'inscription est <strong>gratuite</strong>, quelle que soit la formule. Votre
                      compte est créé instantanément.
                    </p>
                  </div>

                  <div
                    role="group"
                    aria-label="Choisissez votre formule"
                    className="flex flex-col gap-3"
                  >
                    {FORMAT_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const checked = format === opt.id;
                      return (
                        <label
                          key={opt.id}
                          className={`relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                            checked
                              ? "border-primary/60 bg-primary/5 shadow-elegant"
                              : "border-border bg-background hover:-translate-y-0.5 hover:border-primary/30"
                          }`}
                        >
                          {opt.badge && (
                            <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow">
                              {opt.badge}
                            </span>
                          )}
                          <input
                            type="checkbox"
                            checked={checked}
                            // Two checkboxes acting as a mutually-exclusive
                            // pair: checking one always selects that format
                            // (and implicitly unchecks the other) rather
                            // than allowing both/neither.
                            onChange={() => setFormat(opt.id)}
                            aria-label={opt.title}
                            className="peer sr-only"
                          />
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                              checked ? "border-primary bg-primary" : "border-border bg-background"
                            }`}
                          >
                            {checked && (
                              <Check
                                className="h-3.5 w-3.5 text-primary-foreground"
                                strokeWidth={3}
                              />
                            )}
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                              <Icon className="h-4 w-4 text-primary" />
                              {opt.title}
                            </span>
                            <span className="flex items-baseline gap-1.5">
                              <span className="font-display text-lg font-extrabold text-gradient-brand">
                                {opt.price}
                              </span>
                              <span className="text-xs text-ink-soft">{opt.period}</span>
                            </span>
                            <span className="text-xs leading-relaxed text-ink-soft">
                              {opt.desc}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-sm text-ink">
                    <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <p>
                      L'inscription est <strong>gratuite</strong>. Votre compte est créé
                      instantanément et vous accédez directement à votre espace HiT START.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-ink">Prénom</span>
                      <div className="relative">
                        <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                        <input
                          type="text"
                          required
                          autoComplete="given-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Prénom"
                          className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-ink">Nom</span>
                      <div className="relative">
                        <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                        <input
                          type="text"
                          required
                          autoComplete="family-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Nom"
                          className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </label>
                  </div>

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
                </>
              )}

              {step === 3 && (
                <>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Mot de passe</span>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Au moins 6 caractères"
                        className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                        }
                        aria-pressed={showPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft transition hover:text-ink"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Confirmer le mot de passe</span>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={
                          showConfirmPassword
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                        aria-pressed={showConfirmPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft transition hover:text-ink"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </label>

                  <ul className="-mt-1 space-y-1.5">
                    <li
                      className={`flex items-center gap-1.5 text-xs ${
                        password.length >= 6 ? "text-primary" : "text-ink-soft"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      Au moins 6 caractères
                    </li>
                    <li
                      className={`flex items-center gap-1.5 text-xs ${
                        confirmPassword.length > 0 && confirmPassword === password
                          ? "text-primary"
                          : "text-ink-soft"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      Les deux mots de passe correspondent
                    </li>
                  </ul>
                </>
              )}

              {step === 4 && (
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink">Téléphone (WhatsApp)</span>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+261 34 00 000 00"
                      className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </label>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-1 flex items-center gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-input bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary disabled:opacity-60"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || (step === 1 && !format)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
                >
                  {step < TOTAL_STEPS ? (
                    <>
                      Continuer
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      {loading ? "Création du compte..." : "M'inscrire gratuitement"}
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 flex items-center gap-2 text-xs text-ink-soft">
              <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
              Vos informations sont protégées et ne servent qu'à créer votre compte.
            </div>

            <div className="mt-2 text-center text-xs text-ink-soft">
              En créant votre compte, vous acceptez nos{" "}
              <Link
                to="/conditions-generales"
                className="font-semibold text-primary hover:underline"
              >
                Conditions Générales
              </Link>
              .
            </div>

            <div className="mt-6 border-t border-border pt-5 text-center text-sm text-ink-soft">
              Vous avez déjà un compte ?{" "}
              <Link to="/connexion" className="font-semibold text-primary hover:underline">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
