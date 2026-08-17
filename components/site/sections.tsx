import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Sparkles,
  Users,
  Target,
  Briefcase,
  TrendingUp,
  MessageCircle,
  GraduationCap,
  Mail,
  ChevronDown,
  Star,
  Heart,
  Clock,
  Rocket,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Quote,
  Wallet,
  HelpCircle,
  BookOpen,
  Map,
  ListChecks,
  ArrowUpRight,
  Mic,
  Ear,
  Compass,
  CalendarCheck,
  Globe,
  Layers,
  Gift,
} from "lucide-react";
import heroAsset from "@/assets/hero.jpg";
import communityAsset from "@/assets/community.jpg";
import heroAvatar1 from "@/assets/hero-avatar-1.png";
import heroAvatar2 from "@/assets/hero-avatar-2.png";
import heroAvatar3 from "@/assets/hero-avatar-3.png";
import { EMAIL_URL, Reveal, WaveDivider, InteractiveCard } from "./shared";
import { NewsletterDialog } from "./NewsletterDialog";

/* ---------- HERO ---------- */
// Professional photos of young students representing the HiTako community.
const HERO_AVATARS = [
  { src: heroAvatar1, alt: "Étudiante HiTako Academy" },
  { src: heroAvatar2, alt: "Étudiante HiTako Academy" },
  { src: heroAvatar3, alt: "Étudiant HiTako Academy" },
];

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-gradient-hero">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-0 h-[560px] w-[560px] rounded-full bg-primary-glow/25 blur-[120px]" />
        <div className="absolute -bottom-32 -left-20 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[100px]" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-4 sm:pt-5 md:grid-cols-[1.15fr_1fr] md:gap-16 md:px-8 md:pb-32 md:pt-6">
        <div className="animate-fade-up">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-surface-glass px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>L'anglais pensé pour les apprenants malgaches.</span>
          </span>
          <h1 className="hero-title mt-5 font-display font-extrabold tracking-tight text-ink">
            Apprends l'anglais à ton rythme.
            <br />
            Commence à <span className="text-gradient-brand">vraiment parler</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg md:text-xl">
            Avec HiTako Academy, tu apprends directement dans l'application grâce à des leçons
            pratiques, des exercices interactifs et un parcours clair pour progresser étape par
            étape.
          </p>
          <p className="mt-4 max-w-xl text-sm text-ink-soft sm:text-base">
            Accessible sur téléphone comme sur ordinateur, à ton propre rythme — pas besoin de caler
            ta vie sur un horaire de cours.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link
              to="/free-registration"
              data-tour="hero-cta"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-7 py-4 text-base font-semibold text-primary-foreground shadow-elegant transition-transform active:scale-[0.98] hover:scale-[1.03] sm:w-auto"
            >
              Commencer à apprendre
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/lecons-demo"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/25 bg-surface-glass px-6 py-4 text-base font-semibold text-primary backdrop-blur transition-colors hover:bg-card sm:w-auto"
            >
              Voir la démo
            </Link>
          </div>

          <ul className="mt-8 flex max-w-lg flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-ink-soft">
            <li className="inline-flex items-center gap-1.5">
              <span aria-hidden="true">📱</span> Mobile + ordinateur
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span aria-hidden="true">⏱️</span> À ton rythme
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span aria-hidden="true">🇲🇬</span> Pensé pour les Malgaches
            </li>
          </ul>
        </div>

        <div className="relative animate-fade-up [animation-delay:150ms]">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-brand opacity-25 blur-2xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/60 shadow-elegant sm:aspect-[5/6] md:aspect-auto">
            <img
              src={heroAsset}
              alt="Professionnelle malgache confiante utilisant l'anglais"
              className="h-full w-full object-cover"
              width={1400}
              height={1600}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent sm:h-36" />
          </div>
          {/* Positioned as a sibling (not inside the overflow-hidden image
              frame) so the rounded corners of the photo never clip this
              card, even when the two-line French copy makes it taller
              on narrow mobile widths. */}
          <div className="absolute inset-x-3 bottom-3 sm:inset-x-6 sm:bottom-6">
            <div className="flex items-center gap-3 rounded-2xl bg-card/95 p-3 shadow-card backdrop-blur">
              <div className="flex -space-x-2 shrink-0">
                {HERO_AVATARS.map((avatar) => (
                  <img
                    key={avatar.src}
                    src={avatar.src}
                    alt={avatar.alt}
                    className="h-9 w-9 rounded-full border-2 border-card bg-muted object-cover"
                    loading="eager"
                    decoding="async"
                    width={72}
                    height={72}
                  />
                ))}
              </div>
              <div className="min-w-0 text-sm">
                <div className="flex items-center gap-1 text-primary">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Communauté HiTako
                  </span>
                </div>
                <p className="truncate text-xs font-medium text-ink-soft">
                  Rejoignez une communauté ambitieuse
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 top-10 hidden animate-float rounded-2xl bg-card p-4 shadow-elegant md:block">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-ink">+ de confiance à l'oral</span>
            </div>
          </div>
        </div>
      </div>
      <WaveDivider />
    </section>
  );
}

/* ---------- APP LAUNCH ---------- */
import demoLaunchAsset from "@/assets/demo-launch-banner.png";
import demoLaunchHitcards from "@/assets/demo-launch-hitcards.png";
import demoLaunchWelcome from "@/assets/demo-launch-welcome.png";

// Three real screens from the app, cycled in the phone mockup so the
// section reads as a living product instead of one static frame. Each
// slide carries its own pair of floating highlight badges so the copy
// around the phone stays relevant to whatever screen is currently shown.
const APP_SCREENS = [
  {
    src: demoLaunchAsset,
    alt: "Aperçu de l'application HiTako sur mobile : parcours de leçons, XP et série de jours",
    badges: [
      { icon: Map, label: "Parcours structuré" },
      { icon: TrendingUp, label: "Progression suivie" },
    ],
  },
  {
    src: demoLaunchHitcards,
    alt: "Aperçu de l'application HiTako : exercice HiTCards de la leçon 18, Asking for Help",
    badges: [
      { icon: Layers, label: "Cartes interactives" },
      { icon: Check, label: "Vocabulaire pratique" },
    ],
  },
  {
    src: demoLaunchWelcome,
    alt: "Aperçu de l'application HiTako : écran d'accueil de la leçon démo gratuite HiT START",
    badges: [
      { icon: Gift, label: "Leçon démo offerte" },
      { icon: Clock, label: "15 minutes chrono" },
    ],
  },
];

function AppScreensCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % APP_SCREENS.length);
    }, 4200);
    return () => clearInterval(id);
  }, [paused]);

  const current = APP_SCREENS[active];
  const TopBadgeIcon = current.badges[0].icon;
  const BottomBadgeIcon = current.badges[1].icon;

  return (
    <div
      className="relative mx-auto w-full max-w-[320px] sm:max-w-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-brand opacity-40 blur-3xl animate-glow-pulse"
        aria-hidden="true"
      />
      <div
        className="absolute -top-8 -left-10 -z-10 h-44 w-44 rounded-full bg-primary-glow/40 blur-3xl animate-float"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-8 -right-6 -z-10 h-44 w-44 rounded-full bg-primary/30 blur-3xl animate-float"
        style={{ animationDelay: "-3s" }}
        aria-hidden="true"
      />

      <div className="animate-phone-float transition-transform duration-500 ease-out will-change-transform hover:scale-[1.03]">
        <div className="relative aspect-[1024/1536] w-full">
          {/* Stacked, cross-fading frames — every screen shares the exact
              same phone position/scale (baked into the source PNGs), so
              swapping the visible frame reads as a continuous flow rather
              than a jump cut. */}
          {APP_SCREENS.map((screen, i) => (
            <img
              key={screen.src}
              src={screen.src}
              alt={screen.alt}
              className={`absolute inset-0 h-full w-full object-contain drop-shadow-2xl transition-[opacity,transform] duration-700 ease-out will-change-[opacity,transform] ${
                i === active ? "z-10 scale-100 opacity-100" : "z-0 scale-[0.97] opacity-0"
              }`}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={i === 0 ? "high" : "auto"}
              width={1024}
              height={1536}
              aria-hidden={i === active ? undefined : true}
            />
          ))}
          {/* Decorative shine sweep across the screen area only —
              purely cosmetic, so it's aria-hidden. */}
          <div
            className="pointer-events-none absolute inset-x-[16%] inset-y-[9%] z-20 overflow-hidden rounded-[2.4rem]"
            aria-hidden="true"
          >
            <div className="absolute inset-y-0 -left-1/2 w-1/3 animate-shine-sweep bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          </div>
        </div>
      </div>

      <div
        key={`badge-top-${active}`}
        className="absolute -right-2 top-8 hidden animate-float animate-pop-in rounded-2xl bg-card p-3.5 shadow-elegant sm:block"
      >
        <div className="flex items-center gap-2">
          <TopBadgeIcon className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-ink">{current.badges[0].label}</span>
        </div>
      </div>
      <div
        key={`badge-bottom-${active}`}
        className="absolute -left-8 bottom-16 hidden animate-float animate-pop-in rounded-2xl bg-card p-3.5 shadow-elegant [animation-delay:400ms] sm:block"
      >
        <div className="flex items-center gap-2">
          <BottomBadgeIcon className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-ink">{current.badges[1].label}</span>
        </div>
      </div>

      {/* Slide indicators — subtle, but they make the carousel legible
          and give people a way to jump straight to a screen. */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {APP_SCREENS.map((screen, i) => (
          <button
            key={screen.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Voir l'écran ${i + 1} sur ${APP_SCREENS.length}`}
            aria-current={i === active}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-primary" : "w-2 bg-primary/25 hover:bg-primary/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function AppLaunch() {
  const FEATURES = [
    {
      icon: BookOpen,
      title: "Leçons structurées",
      desc: "Organisées par chapitres, pour construire ton anglais pas à pas.",
    },
    {
      icon: Map,
      title: "Parcours clair",
      desc: "Un trajet visuel qui montre où tu en es et ce qu'il reste à apprendre.",
    },
    {
      icon: ListChecks,
      title: "Exercices interactifs",
      desc: "Dialogues, vocabulaire et écoute pour vraiment pratiquer, pas juste lire.",
    },
    {
      icon: TrendingUp,
      title: "Progression suivie",
      desc: "Chaque leçon terminée fait avancer ton XP et ta série de jours.",
    },
    {
      icon: MessageCircle,
      title: "Anglais pratique",
      desc: "Des mises en situation utiles au quotidien, pas juste de la grammaire.",
    },
    {
      icon: ArrowUpRight,
      title: "Prochaine étape claire",
      desc: "Tu sais toujours quelle leçon faire ensuite, sans avoir à chercher.",
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <Reveal>
            {/* Phone mockup replaces the old flat 3:1 banner. The PNGs are
                transparent-background renders, so the phone floats freely
                instead of sitting inside a card — animated glow blobs
                breathe behind it, the phone itself drifts gently, and a
                diagonal shine sweeps the screen every few seconds for a
                "live product" feel. Three real screens cross-fade through
                the same frame (see AppScreensCarousel above) to show the
                app in motion instead of one static shot. All of it
                collapses under prefers-reduced-motion (see styles.css). */}
            <AppScreensCarousel />
          </Reveal>

          <Reveal delay={100}>
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-glow">
              <Rocket className="h-3.5 w-3.5" /> Nouveau · Portail étudiant
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold text-ink md:text-5xl">
              Voici comment <span className="text-gradient-brand">tu vas apprendre</span>.
            </h2>
            <p className="mt-5 text-lg text-ink-soft">
              Pas besoin d'imaginer le programme. Découvre directement ton espace d'apprentissage
              HiTako.
            </p>

            <ul className="mt-7 grid gap-3.5 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li
                  key={f.title}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-3.5"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground">
                    <f.icon className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{f.title}</p>
                    <p className="text-sm text-ink-soft">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to="/free-registration"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-7 py-4 text-base font-semibold text-primary-foreground shadow-elegant transition-transform active:scale-[0.98] hover:scale-[1.03] sm:w-auto"
              >
                Commencer à apprendre
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/lecon-demo-18"
                data-tour="demo-lesson"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/25 bg-surface-glass px-6 py-4 text-base font-semibold text-primary backdrop-blur transition-colors hover:bg-card sm:w-auto"
              >
                Voir une leçon démo
              </Link>
            </div>
            <p className="mt-4 text-xs font-medium text-ink-soft">
              Environ 15 minutes · Aucune carte requise
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- TRANSFORMATION ---------- */
export function Transformation() {
  const shifts = [
    {
      icon: MessageCircle,
      before: "Je comprends un peu, mais je bloque quand je dois parler.",
      after: "Je peux répondre plus facilement dans des situations simples.",
    },
    {
      icon: Compass,
      before: "Je ne sais jamais quoi apprendre.",
      after: "Je sais quelle leçon faire ensuite.",
    },
    {
      icon: CalendarCheck,
      before: "Je n'arrive pas à être régulier(ère).",
      after: "J'avance un peu chaque jour, même en 10 minutes.",
    },
  ];
  return (
    <section className="relative border-y border-border/60 bg-secondary/40 py-24">
      <div className="mx-auto max-w-5xl px-5 text-center md:px-8">
        <Reveal>
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Avant / Après
          </span>
          <h2 className="mt-6 font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
            Le but n'est pas de terminer des leçons.
            <br />
            <span className="text-gradient-brand">C'est de pouvoir utiliser l'anglais.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft">
            Des progrès concrets que tu peux remarquer, leçon après leçon — pas de promesse de
            résultat garanti, juste une méthode pensée pour te faire avancer.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3" data-tour="transformation">
          {shifts.map((t, i) => (
            <Reveal key={t.before} delay={i * 100}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card p-6 text-left shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-elegant">
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <t.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Avant
                </p>
                <p className="mt-1.5 text-sm italic text-muted-foreground">"{t.before}"</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">
                  Après
                </p>
                <p className="mt-1.5 font-display text-lg font-bold text-ink">"{t.after}"</p>
                <div className="mt-6 h-1 w-16 rounded-full bg-gradient-wave transition-all duration-500 group-hover:w-full" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- WHY ENGLISH ---------- */
/* ---------- INVESTMENT VALUE (pourquoi page) ---------- */
// Backs up the hero's "meilleur investissement" claim with four concrete,
// tangible returns — so the promise isn't just a tagline before WhyEnglish
// digs into the everyday blockers learners face.
export function InvestmentValue() {
  const returns = [
    {
      icon: Briefcase,
      title: "Plus d'opportunités professionnelles",
      desc: "Entretiens réussis, postes en BPO, télétravail international : de nombreuses offres à Madagascar demandent déjà un bon niveau d'anglais.",
    },
    {
      icon: TrendingUp,
      title: "Un revenu qui peut progresser",
      desc: "Les métiers qui demandent l'anglais sont souvent mieux rémunérés — et cette compétence reste acquise pour toute ta carrière, une fois pour toutes.",
    },
    {
      icon: Globe,
      title: "Un accès direct au monde",
      desc: "Voyager, étudier à l'étranger, échanger avec des clients ou des touristes : l'anglais ouvre des portes que le français seul ne suffit pas à ouvrir.",
    },
    {
      icon: Heart,
      title: "La confiance de te faire comprendre",
      desc: "Ne plus hésiter avant de parler. Cette confiance change ta façon de te présenter, de négocier et de saisir une opportunité quand elle se présente.",
    },
  ];
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Un retour concret
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold text-ink md:text-4xl">
              Ce que cet investissement te rapporte,{" "}
              <span className="text-gradient-brand">concrètement</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft">
              L'anglais n'est pas une ligne de plus sur ton CV. C'est souvent ce qui décide si une
              opportunité te reste accessible ou non.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {returns.map((r, i) => (
            <Reveal key={r.title} delay={i * 100}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-elegant">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-gradient-brand group-hover:text-primary-foreground group-hover:shadow-glow">
                  <r.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-ink">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyEnglish() {
  const items = [
    {
      icon: Clock,
      title: "Pas le temps de suivre un cours fixe",
      desc: "Les leçons durent 10 à 15 minutes et s'intègrent dans ton emploi du temps, pas l'inverse.",
    },
    {
      icon: Compass,
      title: "Je ne sais jamais quoi apprendre",
      desc: "Le parcours HiTako indique toujours la prochaine leçon à faire, sans avoir à chercher.",
    },
    {
      icon: Mic,
      title: "Peur de parler",
      desc: "Tu commences par écouter et observer, puis tu répètes à ton rythme, sans jugement.",
    },
    {
      icon: Ear,
      title: "Comprendre, mais bloquer à l'oral",
      desc: "Chaque leçon associe compréhension et pratique orale pour progresser sur les deux ensemble.",
    },
    {
      icon: CalendarCheck,
      title: "Difficile de rester régulier",
      desc: "De courtes leçons et un suivi de ta progression t'aident à avancer, même un peu chaque jour.",
    },
  ];
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-bold text-ink md:text-5xl">
              Les blocages qu'on connaît tous —{" "}
              <span className="text-gradient-brand">et comment HiTako y répond</span>
            </h2>
            <p className="mt-5 text-lg text-ink-soft">
              5 obstacles fréquents chez les apprenants, et la façon dont l'application les rend
              concrètement plus faciles à surmonter.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={(i % 3) * 80}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-elegant">
                <div
                  className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at top right, color-mix(in oklab, var(--brand-sky) 20%, transparent), transparent 60%)",
                  }}
                />
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-gradient-brand group-hover:text-primary-foreground group-hover:shadow-glow">
                  <it.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{it.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- WHY HITAKO ---------- */
export function WhyHitako() {
  const steps = [
    {
      emoji: "👂",
      word: "MIHAINO",
      desc: "Écoute et comprends.",
    },
    {
      emoji: "🗣",
      word: "MAKA TAHAKA",
      desc: "Observe et reproduis.",
    },
    {
      emoji: "🔁",
      word: "MAMERINA",
      desc: "Répète et pratique.",
    },
  ];
  return (
    <section className="relative bg-gradient-soft py-24">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              La méthode HiTako
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold text-ink md:text-5xl">
              Une méthode simple, <span className="text-gradient-brand">en trois étapes</span>.
            </h2>
            <p className="mt-5 text-lg text-ink-soft">
              Le but n'est pas seulement de terminer des leçons. Le but est de pouvoir utiliser
              l'anglais. C'est pourquoi chaque leçon HiTako suit le même cycle :
            </p>
          </div>
        </Reveal>

        <div className="mt-14 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-2">
          {steps.map((s, i) => (
            <div key={s.word} className="flex flex-1 items-center gap-2 sm:gap-3">
              <Reveal delay={i * 120} className="w-full">
                <div className="h-full rounded-2xl border border-border bg-card p-6 text-center shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant">
                  <span className="text-3xl" aria-hidden="true">
                    {s.emoji}
                  </span>
                  <p className="mt-3 font-display text-lg font-extrabold tracking-wide text-gradient-brand">
                    {s.word}
                  </p>
                  <p className="mt-1.5 text-sm text-ink-soft">{s.desc}</p>
                </div>
              </Reveal>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden h-5 w-5 shrink-0 text-primary/50 sm:block" />
              )}
            </div>
          ))}
        </div>

        <Reveal delay={280}>
          <p className="mx-auto mt-10 max-w-2xl text-center text-base text-ink-soft">
            Ce cycle revient à chaque leçon, jusqu'à ce que tu puisses réutiliser ces mots et ces
            phrases dans de vraies conversations.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- LEARNING PATHS ---------- */
// Learning paths. Sourced directly from PRICING_LEVELS (defined further
// below in this file) instead of keeping a separate, thinner copy of the
// same three levels — so the "parcours" story here (outcome, audience,
// curriculum highlights, timing) always stays in sync with what /tarifs
// actually sells, and HiT FLOW / HiT PRO get the same depth of marketing
// copy as HiT START even though only HiT START is open for enrollment.
export function Paths() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Parcours d'apprentissage
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold text-ink md:text-5xl">
              Trois niveaux. Une seule{" "}
              <span className="text-gradient-brand">trajectoire ascendante</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft">
              HiT START, HiT FLOW puis HiT PRO forment un seul parcours complet, du niveau débutant
              jusqu'à un anglais professionnel avancé. Commence dès aujourd'hui avec HiT START — HiT
              FLOW et HiT PRO ouvriront ensuite pour continuer ta progression.
            </p>
          </div>
        </Reveal>

        <div className="relative mt-14">
          {/* A single connecting line behind the three cards on desktop, so
              the levels read as one continuous path rather than three
              unrelated products. */}
          <div
            className="pointer-events-none absolute inset-x-16 top-[3.75rem] hidden h-0.5 bg-gradient-to-r from-primary via-primary/30 to-border md:block"
            aria-hidden="true"
          />

          <div className="grid gap-6 md:grid-cols-3">
            {PRICING_LEVELS.map((level, i) => (
              <Reveal key={level.id} delay={i * 120}>
                <div
                  className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border p-8 transition-all duration-500 ${
                    level.open
                      ? "border-primary/40 bg-gradient-to-br from-primary/5 via-card to-primary-glow/10 shadow-elegant hover:-translate-y-2"
                      : "border-border bg-card shadow-card hover:-translate-y-1"
                  }`}
                >
                  {level.open && (
                    <span className="absolute right-5 top-5 rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-glow">
                      Inscriptions ouvertes
                    </span>
                  )}

                  {/* Step marker — sits on the connecting line above on
                      desktop, reinforcing "step 1 of 3", "step 2 of 3"... */}
                  <span
                    className={`relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                      level.open
                        ? "bg-gradient-brand text-primary-foreground shadow-glow"
                        : "border border-border bg-card text-ink-soft"
                    }`}
                  >
                    {i + 1}
                  </span>

                  <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-ink-soft">
                    Niveau {i + 1} · {level.audience}
                  </div>
                  <h3 className="mt-1 font-display text-3xl font-extrabold text-gradient-brand">
                    {level.name}
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-ink">
                    {level.outcome}
                  </p>

                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {level.features.slice(0, 3).map((f) => (
                      <li
                        key={f}
                        className="rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-ink-soft"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-ink-soft">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {level.estimate} à ton rythme
                  </p>

                  <div className="mt-auto pt-6">
                    {level.open ? (
                      <Link
                        to="/tarifs"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5"
                      >
                        Voir les tarifs <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <p className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> Bientôt disponible
                      </p>
                    )}
                    <p className="mt-4 border-t border-border pt-4 text-xs text-ink-soft">
                      <span className="font-semibold text-ink">Idéal pour :</span> {level.bestFor}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- MEMBERSHIP VALUE ---------- */
// What a HiTako access actually includes, grouped the way the product itself
// is organized (learn / practice / progress / community). Positioned right
// before Pricing so a visitor sees the full system before the price — and
// the Malagasy-platform angle is deliberately a small closing note here,
// never the headline, so access to the app reads as the main thing being
// bought, not a donation to a cause.
export function MembershipValue() {
  const pillars: {
    tag: string;
    icon: typeof BookOpen;
    bullets: string[];
  }[] = [
    {
      tag: "LEARN",
      icon: BookOpen,
      bullets: [
        "Leçons pratiques, organisées par chapitres",
        "Vocabulaire, expressions utiles et grammaire appliquée",
        "Écoute et anglais de la vie réelle",
      ],
    },
    {
      tag: "PRACTICE",
      icon: ListChecks,
      bullets: [
        "Exercices interactifs à chaque leçon",
        "Mini-quiz et évaluations régulières",
        "Prononciation et écoute guidées",
        "Répétition, jusqu'à ce que ça devienne naturel",
      ],
    },
    {
      tag: "PROGRESS",
      icon: TrendingUp,
      bullets: [
        "Parcours d'apprentissage clair",
        "Suivi visible de ta progression (XP, leçons terminées)",
        "La prochaine leçon toujours indiquée",
      ],
    },
    {
      tag: "COMMUNITY",
      icon: Users,
      bullets: [
        "Classement entre apprenants (XP, régularité, temps d'étude)",
        "De quoi voir où tu te situes et rester motivé(e)",
        "Pratique orale en petit groupe avec un coach, en option",
      ],
    },
  ];

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Ton accès HiTako
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold text-ink md:text-5xl">
              L'application HiTako est{" "}
              <span className="text-gradient-brand">ton système d'apprentissage principal</span>.
            </h2>
            <p className="mt-5 text-lg text-ink-soft">
              Ton accès te donne un système complet pour apprendre, pratiquer et progresser —
              organisé en quatre piliers.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {pillars.map((p, i) => (
            <Reveal key={p.tag} delay={(i % 4) * 80}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground shadow-glow">
                    <p.icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    {p.tag}
                  </span>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-ink-soft">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={3} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={320}>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-ink-soft">
            🇲🇬 En plus de ton accès, ta participation aide à faire grandir HiTako, une plateforme
            d'apprentissage malgache.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- PRICING ---------- */
// App-first pricing model (see the Updated Scaling Strategy doc): each of
// the three levels has its own price and access period, and every level
// offers the SAME two payment methods — a single payment (best value,
// always shown/recommended first) or a monthly payment (more flexible, but
// a higher total). Only HiT START is open for enrollment today; FLOW and
// PRO mirror the "open" flag already used by Paths() above and render as
// "coming soon" until they launch.
export type PricingLevelId = "start" | "flow" | "pro";

export type PricingLevel = {
  id: PricingLevelId;
  name: string;
  levelLabel: string;
  audience: string;
  outcome: string;
  open: boolean;
  estimate: string; // self-paced completion estimate, e.g. "3 à 6 mois"
  single: { price: string; months: number };
  monthly: { price: string; months: number; maxTotal: string };
  savings: string; // single-payment saving vs. the monthly total
  promise: string;
  bestFor: string;
  features: string[];
};

export const PRICING_LEVELS: PricingLevel[] = [
  {
    id: "start",
    name: "HiT START",
    levelLabel: "Niveau 1",
    audience: "Débutants",
    outcome: "Parler dans des situations simples du quotidien + anglais de base au travail.",
    open: true,
    estimate: "3 à 6 mois",
    single: { price: "49 000 Ar", months: 6 },
    monthly: { price: "9 000 Ar", months: 6, maxTotal: "54 000 Ar" },
    savings: "5 000 Ar",
    promise:
      "Construis tes bases en anglais à ton rythme, avec 80 leçons pratiques directement dans l'application HiTako, pendant un accès pouvant aller jusqu'à 6 mois.",
    bestFor:
      "Idéal si un emploi du temps fixe ne te convient pas, ou si tu préfères avancer à ton propre rythme.",
    features: [
      "80 leçons pratiques pendant ton accès de jusqu'à 6 mois",
      "10 à 15 minutes seulement, où que tu sois",
      "Vocabulaire et grammaire pratique",
      "Écoute et expression orale",
      "Dialogues et situations de la vie quotidienne",
      "Exercices interactifs à chaque leçon",
      "Mini-quiz réguliers pour ancrer les acquis",
      "Évaluations mensuelles + évaluation finale (checkpoint A2)",
      "Suivi de ta progression",
      "Accessible depuis ton smartphone ou ton ordinateur",
    ],
  },
  {
    id: "flow",
    name: "HiT FLOW",
    levelLabel: "Niveau 2",
    audience: "Intermédiaire",
    outcome: "Conversation confiante + préparation aux entretiens + communication professionnelle.",
    open: false,
    estimate: "4 à 10 mois",
    single: { price: "82 000 Ar", months: 10 },
    monthly: { price: "9 500 Ar", months: 10, maxTotal: "95 000 Ar" },
    savings: "13 000 Ar",
    promise:
      "Gagne en fluidité, structure ton discours et prépare-toi aux situations professionnelles (entretiens, réunions, service client).",
    bestFor: "Idéal pour les chercheurs d'emploi, candidats BPO et jeunes professionnels.",
    features: [
      "Accès pouvant aller jusqu'à 10 mois",
      "10 à 15 minutes par jour, à ton rythme",
      "Fluidité, rapidité et clarté à l'oral",
      "Discours structuré : opinions, récits, explications de processus",
      "Écoute en contexte réel (demandes clients, réunions)",
      "Bases d'écrit professionnel (chat, e-mail)",
      "Mises en situation : service client, entretiens, réunions",
      "Enregistrements hebdomadaires pour pratiquer à l'oral",
      "Checkpoint B2 : prise de parole structurée + mise en situation",
      "Suivi de ta progression",
    ],
  },
  {
    id: "pro",
    name: "HiT PRO",
    levelLabel: "Niveau 3",
    audience: "Avancé",
    outcome: "Anglais de haut niveau pour le leadership, la négociation et les présentations.",
    open: false,
    estimate: "6 à 12 mois",
    single: { price: "98 000 Ar", months: 12 },
    monthly: { price: "10 000 Ar", months: 12, maxTotal: "120 000 Ar" },
    savings: "22 000 Ar",
    promise:
      "Précision et nuance à haut niveau : présentations, storytelling, négociation et communication professionnelle avancée.",
    bestFor: "Idéal pour les leaders, formateurs, télétravailleurs et hauts performeurs.",
    features: [
      "Accès pouvant aller jusqu'à 12 mois",
      "10 à 15 minutes par jour, à ton rythme",
      "Fluidité avancée et précision (nuance, structure, persuasion)",
      "Présentations, storytelling, débat et négociation",
      "Communication sectorielle (tech, business, escalade client)",
      "Enregistrements hebdomadaires pour pratiquer à l'oral",
      "Simulation mensuelle : présentation + questions-réponses",
      "Checkpoint C1 : présentation + gestion des objections",
      "Suivi de ta progression",
      "Accessible depuis ton smartphone ou ton ordinateur",
    ],
  },
];

// Live, small-group coaching add-on for HiT START — a separate product
// from the app-based levels above (fixed live schedule, not a self-paced
// access window), so it keeps its own price/duration rather than being
// forced into the single/monthly shape. Exported so /free-registration and
// its confirmation screen (confirm-coach-registration.tsx) always quote the
// same price.
export const HIT_START_COACH = {
  price: "150 000 Ar",
  period: "2 mois",
  promise: "Apprends avec un coach, pratique en petit groupe et progresse avec confiance.",
  bestFor:
    "Idéal si tu as besoin d'un coach, d'échanges en direct et d'être accompagné(e) pas à pas.",
  features: [
    "Cours en direct en petit groupe (max. 6 apprenants)",
    "4 sessions par semaine, 1h30 chacune",
    "48 heures de formation en direct sur 2 mois",
    "Expression orale guidée par un coach",
    "Écoute, vocabulaire et grammaire pratique",
    "Exercices guidés et devoirs",
    "Corrections et retours personnalisés du coach",
    "Activités hebdomadaires de progression",
    "Évaluation mensuelle + évaluation finale",
    "Supports pédagogiques HiT START inclus",
  ],
};

export function Pricing() {
  const [paymentType, setPaymentType] = useState<"single" | "monthly">("single");
  const PAYMENT_TOGGLE = [
    { id: "single" as const, label: "Paiement unique" },
    { id: "monthly" as const, label: "Paiement mensuel" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-brand py-24 text-primary-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-float" />
        <div
          className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-float"
          style={{ animationDelay: "-3s" }}
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              Un accès complet par niveau
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold md:text-5xl">
              Ton accès complet à un niveau, payé comme tu préfères.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/85">
              Chaque niveau — HiT START, HiT FLOW, HiT PRO — te donne un accès complet aux leçons,
              exercices et évaluations de ce niveau, pour une durée pensée pour ton rythme. Paie en
              une fois pour profiter du meilleur prix, ou choisis le paiement mensuel pour plus de
              flexibilité.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70">
              Les trois niveaux forment un seul parcours. HiT START est ouvert dès maintenant ; HiT
              FLOW et HiT PRO ouvriront ensuite pour poursuivre ta progression.
            </p>
          </div>
        </Reveal>

        {/* Payment method toggle — applies to all three level cards below */}
        <Reveal delay={80}>
          <div className="mx-auto mt-10 flex w-fit items-center gap-1 rounded-full bg-white/15 p-1 backdrop-blur">
            {PAYMENT_TOGGLE.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPaymentType(opt.id)}
                aria-pressed={paymentType === opt.id}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                  paymentType === opt.id
                    ? "bg-white text-primary shadow-elegant"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {PRICING_LEVELS.map((level, i) => {
            const plan = paymentType === "single" ? level.single : level.monthly;
            return (
              <Reveal key={level.id} delay={i * 120}>
                <InteractiveCard className="h-full rounded-3xl">
                  <div
                    className={`relative flex h-full flex-col overflow-hidden rounded-3xl p-8 md:p-10 ${
                      level.open
                        ? "bg-card text-ink shadow-elegant"
                        : "border border-white/25 bg-white/10 text-white backdrop-blur"
                    }`}
                  >
                    <span
                      className={`absolute right-6 top-6 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                        level.open
                          ? "bg-gradient-brand text-primary-foreground shadow-glow"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {level.open ? "Inscriptions ouvertes" : "Bientôt disponible"}
                    </span>

                    <p
                      className={`inline-flex items-center gap-1.5 pr-24 text-xs font-semibold uppercase tracking-widest ${
                        level.open ? "text-primary" : "text-white/80"
                      }`}
                    >
                      <Smartphone className="h-3.5 w-3.5" /> {level.levelLabel} · {level.audience}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-extrabold md:text-3xl">
                      {level.name}
                    </h3>

                    {/* Access period + what's included is the headline now —
                        that's the actual value being bought (see Updated
                        Scaling Strategy: "membership = app access + continuous
                        improvement"). The price moves below as a compact,
                        secondary detail instead of the dominant number. */}
                    <div className="mt-6">
                      <p
                        className={`text-xs font-semibold uppercase tracking-widest ${
                          level.open ? "text-ink-soft" : "text-white/70"
                        }`}
                      >
                        Ton accès complet
                      </p>
                      <div className="mt-1 flex items-end gap-2">
                        <span
                          className={`font-display text-5xl font-extrabold leading-none ${
                            level.open ? "text-gradient-brand" : ""
                          }`}
                        >
                          {plan.months}
                        </span>
                        <span
                          className={`pb-1 text-lg font-semibold ${
                            level.open ? "text-ink" : "text-white"
                          }`}
                        >
                          mois
                        </span>
                      </div>
                      <p
                        className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${
                          level.open ? "text-primary" : "text-white/90"
                        }`}
                      >
                        <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
                        {level.features.length} avantages inclus dans l'accès
                      </p>
                    </div>

                    <div
                      className={`mt-5 flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${
                        level.open ? "bg-muted" : "bg-white/10"
                      }`}
                    >
                      <span className={`text-sm ${level.open ? "text-ink-soft" : "text-white/80"}`}>
                        {paymentType === "single" ? "Paiement unique" : "Paiement mensuel"}
                      </span>
                      <span
                        className={`whitespace-nowrap font-display text-lg font-bold ${
                          level.open ? "text-ink" : "text-white"
                        }`}
                      >
                        {plan.price}
                        {paymentType === "monthly" && (
                          <span className="ml-0.5 text-xs font-normal">/mois</span>
                        )}
                      </span>
                    </div>
                    {paymentType === "single" ? (
                      <p
                        className={`mt-1.5 text-xs font-semibold ${
                          level.open ? "text-primary" : "text-white/90"
                        }`}
                      >
                        Meilleur prix — économise {level.savings} vs paiement mensuel
                      </p>
                    ) : (
                      <p
                        className={`mt-1.5 text-xs ${level.open ? "text-ink-soft" : "text-white/70"}`}
                      >
                        {level.monthly.maxTotal} au total sur {plan.months} mois · paiement unique :{" "}
                        {level.single.price} (économise {level.savings})
                      </p>
                    )}

                    <p
                      className={`mt-5 rounded-2xl p-4 text-sm leading-relaxed ${
                        level.open ? "bg-primary/5 text-ink" : "bg-white/10 text-white/90"
                      }`}
                    >
                      {level.promise}
                    </p>

                    <p className={`mt-3 text-xs ${level.open ? "text-ink-soft" : "text-white/70"}`}>
                      Temps estimé pour terminer ce niveau à ton rythme : {level.estimate}.
                    </p>

                    <p
                      className={`mt-6 text-xs font-semibold uppercase tracking-widest ${
                        level.open ? "text-ink-soft" : "text-white/70"
                      }`}
                    >
                      Inclus dans ton accès
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {level.features.map((f) => (
                        <li
                          key={f}
                          className={`flex items-start gap-2.5 text-sm ${
                            level.open ? "text-ink" : "text-white/90"
                          }`}
                        >
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              level.open ? "text-primary" : "text-white"
                            }`}
                            strokeWidth={3}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-8">
                      {level.open ? (
                        <Link
                          to="/free-registration"
                          search={{ format: "daily" }}
                          className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-4 text-base font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]"
                        >
                          Commencer avec {level.name}
                          <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      ) : (
                        <p className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-4 text-center text-sm font-semibold text-white/80">
                          <Clock className="h-4 w-4" /> Niveau suivant bientôt
                        </p>
                      )}
                      <p
                        className={`mt-4 border-t pt-4 text-xs ${
                          level.open
                            ? "border-border text-ink-soft"
                            : "border-white/15 text-white/70"
                        }`}
                      >
                        <span
                          className={`font-semibold ${level.open ? "text-ink" : "text-white/90"}`}
                        >
                          Idéal pour :
                        </span>{" "}
                        {level.bestFor}
                      </p>
                    </div>
                  </div>
                </InteractiveCard>
              </Reveal>
            );
          })}
        </div>

        {/* ---- Coach add-on note ----
            HiT START's app access is the core product being priced above;
            live small-group coaching is an optional, separately priced way
            to go through that same level — not a competing pricing tier —
            so it stays a low-key mention rather than a third pricing card. */}
        <Reveal delay={280}>
          <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-white/25 bg-white/10 p-5 text-center backdrop-blur">
            <p className="text-sm text-white/90">
              <span className="font-display font-bold">Tu préfères un vrai coach en direct ?</span>{" "}
              HiT START est aussi disponible en petit groupe, avec un coach en direct —{" "}
              {HIT_START_COACH.price} pour {HIT_START_COACH.period}.
            </p>
            <Link
              to="/free-registration"
              search={{ format: "coach" }}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:underline"
            >
              <Users className="h-4 w-4" /> Découvrir HiT START Coach
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- DAILY EMAIL ---------- */
export function DailyEmail() {
  const options = [
    {
      title: "Option 1",
      subtitle: "Essentiel",
      items: ["Leçons d'anglais quotidiennes (Lun–Ven)", "eBook Débutant offert"],
    },
    {
      title: "Option 2",
      subtitle: "Essentiel + Audio",
      items: [
        "Leçons d'anglais quotidiennes (Lun–Ven)",
        "eBook Débutant offert",
        "Audio MP3 pour apprendre partout",
      ],
      featured: true,
    },
  ];
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1fr_1.15fr] md:items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <Mail className="h-3.5 w-3.5" /> Abonnement mensuel
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold text-ink md:text-5xl">
              <span className="text-gradient-brand">HiTako Daily English</span> — 5 min par jour
            </h2>
            <p className="mt-5 text-lg text-ink-soft">
              Une leçon dans votre boîte email chaque matin. Progressez sans y penser, même les
              jours chargés. Un abonnement abordable pour une nouvelle habitude qui change tout.
            </p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {options.map((o, i) => (
              <Reveal key={o.title} delay={i * 100}>
                <div
                  className={`relative h-full rounded-3xl border p-6 transition-all duration-500 hover:-translate-y-1 ${
                    o.featured
                      ? "border-primary/40 bg-gradient-to-br from-primary/5 via-card to-primary-glow/10 shadow-elegant"
                      : "border-border bg-card shadow-card"
                  }`}
                >
                  {o.featured && (
                    <span className="absolute -top-3 right-5 rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-glow">
                      Le plus complet
                    </span>
                  )}
                  <div className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
                    {o.title}
                  </div>
                  <h3 className="mt-1 font-display text-xl font-bold text-ink">{o.subtitle}</h3>
                  <ul className="mt-5 space-y-2.5">
                    {o.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-sm text-ink">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
            <a
              href={EMAIL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-4 text-base font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]"
            >
              S'abonner au HiTako Daily English
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- TESTIMONIAL CAROUSEL ---------- */
export function Stories() {
  // "result" is optional and shown under the quote once filled in (see the
  // render below). Leave it unset until real answers come back from a
  // testimonial round that specifically asks about outcomes — don't invent
  // one for the existing testimonials.
  const testimonials = useMemo<{ name: string; role: string; quote: string; result?: string }[]>(
    () => [
      {
        name: "Rianala",
        role: "Apprenante HiT START",
        quote:
          "Avant HiTako Academy, je comprenais un peu l'anglais mais j'avais trop peur de le parler. Les petites classes m'ont permis de poser des questions et de pratiquer chaque semaine. Aujourd'hui, je me présente avec confiance, et je n'ai plus peur de parler anglais.",
      },
      {
        name: "Andry",
        role: "Apprenant HiT START",
        quote:
          "Ce que j'aime le plus chez HiTako Academy, c'est que les leçons sont pratiques. Nous n'apprenons pas seulement la grammaire par cœur — nous utilisons vraiment l'anglais dans de vraies conversations.",
      },
      {
        name: "Finaritra",
        role: "Apprenante HiT START",
        quote:
          "Nataoko ho sarotra be ny mianatra teny anglisy taloha. Fa tamin'izaho tao amin'ny HiTako Academy, nitombo tsikelikely ny fahatokisako tena satria nampihatra azy mivantana foana izahay isaky ny session. Izao aho efa sahy miresaka tsara, ary tena manampy amin'ny fianarana sy ny asako izany !",
      },
    ],
    [],
  );

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 6500);
    return () => clearInterval(t);
  }, [paused, count]);

  const go = (n: number) => setIdx((n + count) % count);

  return (
    <section className="relative bg-secondary/40 py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Success Stories
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold text-ink md:text-5xl">
              Ils ont franchi le pas.
              <br />
              <span className="text-gradient-brand">Leur vie a changé.</span>
            </h2>
          </div>
        </Reveal>

        <div
          className="relative mt-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-elegant"
            data-tour="stories"
          >
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(-${idx * 100}%)` }}
            >
              {testimonials.map((t, i) => (
                <figure
                  key={t.name}
                  className="w-full shrink-0 p-8 md:p-14"
                  aria-hidden={i !== idx}
                >
                  <Quote className="h-10 w-10 text-primary/30" />
                  <blockquote className="mt-4 font-display text-2xl leading-snug text-ink md:text-3xl">
                    {t.quote}
                  </blockquote>
                  {t.result && (
                    <p className="mt-3 text-sm font-semibold text-primary">
                      — {t.name}, {t.result}
                    </p>
                  )}
                  <figcaption className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand font-display text-xl font-bold text-primary-foreground shadow-glow">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-display text-base font-semibold text-ink">— {t.name}</p>
                      <p className="text-xs text-ink-soft">{t.role}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-primary">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-4 w-4 fill-primary" />
                      ))}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Témoignage ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === idx ? "w-10 bg-gradient-brand" : "w-2 bg-border hover:bg-primary/40"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => go(idx - 1)}
                aria-label="Précédent"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-ink shadow-card transition-all hover:-translate-y-0.5 hover:text-primary hover:shadow-elegant"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => go(idx + 1)}
                aria-label="Suivant"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-elegant transition-all hover:-translate-y-0.5 hover:shadow-glow"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- COMMUNITY ---------- */
export function Community() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="relative" data-tour="community">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-brand opacity-20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/60 shadow-elegant">
                <img
                  src={communityAsset}
                  alt="Apprenants HiTako en session"
                  className="w-full object-cover"
                  loading="eager"
                  decoding="async"
                  width={1600}
                  height={1000}
                />
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              La communauté HiTako
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold text-ink md:text-5xl">
              Apprendre seul ne veut pas dire{" "}
              <span className="text-gradient-brand">rester seul</span>.
            </h2>
            <p className="mt-5 text-lg text-ink-soft">
              L'application reste le cœur de ton apprentissage. La communauté t'aide à pratiquer,
              rencontrer d'autres apprenants, rester motivé(e) et utiliser ce que tu apprends.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Pratique avec des pairs motivés",
                "Partage tes progrès et reste motivé(e)",
                "Élargis ton réseau au fil de ton apprentissage",
              ].map((l) => (
                <li key={l} className="flex items-start gap-3 text-ink">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {l}
                </li>
              ))}
            </ul>

            {/* Real-world practice is a supporting layer on top of the app,
                not a second core product — kept visually secondary (smaller
                card, below the main pitch) but the ticket note itself stays
                prominent and un-hedged, per the membership business rule:
                membership is app access, not unlimited free physical events. */}
            <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-card">
              <p className="font-display text-base font-bold text-ink">
                Apprendre dans l'app. Pratiquer dans la vraie vie.
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                La communauté HiTako peut proposer des clubs, rencontres, sorties et activités
                pratiques. Selon l'activité, un ticket ou une inscription séparée peut être
                nécessaire.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/10 px-3.5 py-2.5 text-sm font-semibold text-primary">
                <span aria-hidden="true">🎟️</span>
                Certains événements nécessitent un ticket séparé.
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- PRICING GLANCE ---------- */
// Condensed pricing + FAQ teaser for the homepage, so a time-pressed visitor
// can judge the ROI without leaving "/" to visit /tarifs or /faq (see the
// site audit — none of this was visible on the landing page before).
export function PricingGlance() {
  const start = PRICING_LEVELS[0];
  const priceLines: {
    name: string;
    detail: string;
    price: string;
    originalPrice?: string;
    period: string;
  }[] = [
    {
      name: `${start.name} — paiement unique`,
      detail: `Meilleur prix. Accès jusqu'à ${start.single.months} mois, avec 80 leçons pratiques dans l'application HiTako.`,
      price: start.single.price,
      period: `/ jusqu'à ${start.single.months} mois`,
    },
    {
      name: `${start.name} — paiement mensuel`,
      detail: `Plus flexible : ${start.monthly.maxTotal} au total sur ${start.monthly.months} mois.`,
      price: start.monthly.price,
      period: "/ mois",
    },
  ];
  const quickFaqs = [
    {
      q: "Est-ce que ça marche si je n'ai pas de temps ?",
      a: "Oui. HiT START ne demande que 10 à 15 minutes par jour dans l'application. Si tu préfères un vrai coach en direct, la formule HiT START Coach propose 4 sessions live d'1h30 par semaine — un rythme pensé pour tenir à côté d'un emploi du temps chargé.",
    },
    {
      q: "Qu'est-ce que ça va concrètement me permettre de faire ?",
      a: "Vous présenter avec confiance en anglais, réussir un entretien d'embauche, échanger avec des clients ou des touristes, et saisir les opportunités professionnelles et digitales réservées à ceux qui parlent anglais.",
    },
  ];

  return (
    <section className="relative py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              En un coup d'œil
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold text-ink md:text-4xl">
              Choisissez la formule qui vous convient
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2" data-tour="pricing-glance">
          <Reveal>
            <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
              <div className="flex items-center gap-2 text-primary">
                <Wallet className="h-5 w-5" />
                <h3 className="font-display text-lg font-bold text-ink">Tarifs</h3>
              </div>
              <ul className="mt-5 space-y-4">
                {priceLines.map((p) => (
                  <li
                    key={p.name}
                    className="flex items-start justify-between gap-4 border-t border-border pt-4 first:border-t-0 first:pt-0"
                  >
                    {/* min-w-0 lets the (sometimes long) detail sentence wrap
                        within its own column instead of squeezing the price
                        column, which is what used to break "49 000 Ar" into
                        three stacked lines. */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">{p.name}</p>
                      <p className="text-xs text-ink-soft">{p.detail}</p>
                    </div>
                    {/* shrink-0 + whitespace-nowrap: the price block always
                        keeps its natural, single-line width and is never the
                        one that gives way when the row gets tight. Original
                        price stacks above the current price (classic "was /
                        now" pattern) instead of sitting side-by-side, which
                        is what left too little room for either to fit on one
                        line. */}
                    <div className="shrink-0 text-right">
                      {p.originalPrice && (
                        <p className="whitespace-nowrap text-xs font-medium text-muted-foreground line-through">
                          {p.originalPrice}
                        </p>
                      )}
                      <p className="whitespace-nowrap font-display text-lg font-bold text-gradient-brand">
                        {p.price}
                      </p>
                      <p className="whitespace-nowrap text-xs text-ink-soft">{p.period}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-ink-soft">
                Premier niveau d'un parcours en trois étapes — HiT FLOW puis HiT PRO suivront.
              </p>
              <Link
                to="/tarifs"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Découvrir les programmes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
              <div className="flex items-center gap-2 text-primary">
                <HelpCircle className="h-5 w-5" />
                <h3 className="font-display text-lg font-bold text-ink">Questions fréquentes</h3>
              </div>
              <ul className="mt-5 space-y-5">
                {quickFaqs.map((f) => (
                  <li key={f.q} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                    <p className="text-sm font-semibold text-ink">{f.q}</p>
                    <p className="mt-1.5 text-sm text-ink-soft">{f.a}</p>
                  </li>
                ))}
              </ul>
              <Link
                to="/faq"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Voir toutes les questions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
// Faq() is shared by the homepage ("/") and the dedicated /faq route. The
// two audiences need different questions — the homepage needs broad
// product/community/events questions, while /faq stays focused on the
// HiT START program details — so the question set is now a prop with a
// default, instead of hardcoded. Passing no prop (as /faq does) preserves
// the exact original HiT START content; the homepage passes HOME_FAQS.
export type FaqItem = { q: string; a: string };

const PROGRAM_FAQS: FaqItem[] = [
  {
    q: "Qui peut s'inscrire à HiT START ?",
    a: "Toute personne débutante ou faux-débutante qui veut construire une base solide en anglais pour son avenir professionnel.",
  },
  {
    q: "Comment se déroulent les leçons ?",
    a: "Par défaut, HiT START se fait dans l'application, à ton rythme : 80 leçons de 10 à 15 minutes, avec un accès pouvant aller jusqu'à 6 mois. Si tu préfères un vrai coach en direct, la formule HiT START Coach propose 4 sessions live par semaine, 1h30 chacune, en petit groupe (max. 6 apprenants), sur 2 mois.",
  },
  {
    q: "Le format est-il en ligne ?",
    a: "Oui, 100 % en ligne — dans l'application à ton rythme, ou en direct avec un coach et tes co-apprenants si tu choisis la formule Coach.",
  },
  {
    q: "Que se passe-t-il après HiT START ?",
    a: "Tu passes à HiT FLOW (niveau intermédiaire, pensé pour les chercheurs d'emploi, candidats BPO et jeunes professionnels), puis à HiT PRO (niveau avancé, pensé pour les leaders, formateurs et hauts performeurs) pour continuer ta progression jusqu'à un anglais professionnel avancé. Les trois niveaux forment un seul parcours ; HiT FLOW et HiT PRO ouvriront après HiT START.",
  },
  {
    q: "Puis-je payer en plusieurs fois ?",
    a: "Oui. Chaque niveau propose un paiement unique (le meilleur prix) ou un paiement mensuel plus flexible, pour un total un peu plus élevé. Pour HiT START : 49 000 Ar en une fois (accès jusqu'à 6 mois), ou 9 000 Ar/mois.",
  },
  {
    q: "Le HiTako Daily English est-il inclus dans HiT START ?",
    a: "Non, c'est une newsletter gratuite séparée qui vient renforcer votre pratique quotidienne — elle n'est pas liée à votre abonnement HiT START.",
  },
];

// Homepage FAQ: broader product questions, including the community/events
// ticketing clarification (business rule: membership ≠ unlimited free
// physical events) and a credible, non-overpromising results answer.
export const HOME_FAQS: FaqItem[] = [
  {
    q: "HiTako est-il adapté aux débutants ?",
    a: "Oui. HiTako est conçu pour les débutants et faux-débutants : les leçons partent des bases et avancent étape par étape, sans prérequis.",
  },
  {
    q: "Le parcours va-t-il plus loin que HiT START ?",
    a: "Oui. HiT START, HiT FLOW et HiT PRO forment un seul parcours, du niveau débutant jusqu'à un anglais professionnel avancé. HiT START est ouvert dès maintenant ; HiT FLOW (intermédiaire) puis HiT PRO (avancé) ouvriront ensuite pour continuer ta progression.",
  },
  {
    q: "Combien de temps dois-je consacrer chaque jour ?",
    a: "Environ 10 à 15 minutes par jour suffisent avec les leçons de l'application. Avec la formule Coach, prévois en plus les sessions live hebdomadaires.",
  },
  {
    q: "Dois-je être présent à une heure précise ?",
    a: "Non, pas pour l'application : tu apprends quand tu veux, à ton rythme. Seule la formule Coach a un horaire fixe pour ses sessions live en petit groupe.",
  },
  {
    q: "Est-ce que HiTako fonctionne sur téléphone ?",
    a: "Oui, HiTako est accessible sur téléphone comme sur ordinateur, à ton propre rythme.",
  },
  {
    q: "Qu'est-ce qui est inclus dans mon abonnement ?",
    a: "Les leçons structurées, les exercices pratiques, le suivi de ta progression et les fonctionnalités de communauté (classement, motivation). Les clubs et événements physiques sont à part — voir la question suivante.",
  },
  {
    q: "Les clubs et événements sont-ils gratuits ?",
    a: "Les activités de communauté complètent l'apprentissage dans l'application. Certaines sorties, activités spéciales, ateliers ou événements nécessitent toutefois un ticket ou une inscription séparée. Les conditions sont indiquées pour chaque événement.",
  },
  {
    q: "Puis-je pratiquer avec d'autres apprenants ?",
    a: "Oui. La communauté HiTako te permet d'échanger avec d'autres apprenants motivés, et la formule Coach propose en plus des sessions live en petit groupe pour pratiquer à l'oral ensemble.",
  },
  {
    q: "Est-ce que HiTako garantit que je parlerai couramment anglais ?",
    a: "Aucune plateforme d'apprentissage sérieuse ne peut garantir la fluence sans pratique régulière de l'apprenant. HiTako propose un parcours structuré, du contenu pratique, des occasions de pratiquer et un accompagnement communautaire pour t'aider à progresser régulièrement.",
  },
];

export function Faq({ faqs = PROGRAM_FAQS }: { faqs?: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative bg-gradient-soft py-24">
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-elegant"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-base font-semibold text-ink md:text-lg">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-ink-soft">{f.a}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- FINAL CTA ---------- */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-brand p-10 text-center text-primary-foreground shadow-elegant md:p-16">
          <div className="pointer-events-none absolute -top-20 -right-10 h-60 w-60 rounded-full bg-white/15 blur-3xl animate-float" />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-white/15 blur-3xl animate-float"
            style={{ animationDelay: "-3s" }}
          />
          <div className="relative">
            <GraduationCap className="mx-auto h-10 w-10" />
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight md:text-6xl">
              Ton anglais peut commencer à changer aujourd'hui.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
              Pas besoin d'attendre d'avoir plus de temps ou un niveau parfait. Commence avec une
              petite étape, puis continue.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/free-registration"
                data-tour="final-cta"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-base font-bold text-primary shadow-elegant transition-transform hover:scale-[1.03]"
              >
                Commencer à apprendre
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <NewsletterDialog
                source="final_cta"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-4 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <Mail className="h-5 w-5" />
                Newsletter
              </NewsletterDialog>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FOUNDER ---------- */
import antsaPhoto from "@/assets/antsa-founder.jpg";

export function Founder() {
  return (
    <section
      id="founder"
      className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background py-20 md:py-28"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-16 h-[420px] w-[420px] rounded-full bg-primary-glow/20 blur-[110px]" />
        <div className="absolute -bottom-24 -left-16 h-[380px] w-[380px] rounded-full bg-primary/15 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface-glass px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary backdrop-blur">
              <Heart className="h-3.5 w-3.5" /> Le fondateur
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink md:text-5xl">
              Rencontrez <span className="text-gradient-brand">Antsa Rafanomezantsoa</span>
            </h2>
            <p className="mt-4 text-lg text-ink-soft">
              Une histoire malgache. Une mission claire. Une académie née d'une conviction.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-16">
          {/* Portrait */}
          <Reveal>
            <div className="relative mx-auto w-full max-w-md">
              <div
                className="absolute -inset-4 rounded-[2rem] bg-gradient-brand opacity-30 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-primary-glow/40 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-primary/40 blur-2xl"
                aria-hidden="true"
              />

              <InteractiveCard className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-card shadow-elegant">
                <img
                  src={antsaPhoto}
                  alt="Antsa Rafanomezantsoa, fondateur de HiTako Academy"
                  className="aspect-[4/5] w-full object-cover"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-5">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold">Founder · HiTako Academy</span>
                  </div>
                  <p className="mt-1 font-display text-xl font-bold text-white">
                    Antsa Rafanomezantsoa
                  </p>
                </div>
              </InteractiveCard>

              <div className="absolute -right-4 top-6 hidden rotate-3 rounded-2xl border border-border bg-card/95 px-4 py-2 text-xs font-semibold text-primary shadow-card backdrop-blur md:block">
                🇲🇬 Made in Madagascar
              </div>
              <div className="absolute -left-4 bottom-16 hidden -rotate-3 rounded-2xl border border-border bg-card/95 px-4 py-2 text-xs font-semibold text-primary shadow-card backdrop-blur md:block">
                Since 2024
              </div>
            </div>
          </Reveal>

          {/* Story */}
          <Reveal delay={120}>
            <div className="space-y-6">
              <div
                className="rounded-3xl border border-border bg-card/70 p-6 shadow-card backdrop-blur md:p-8"
                data-tour="founder"
              >
                <Quote className="h-8 w-8 text-primary/70" />
                <p className="mt-3 font-display text-xl leading-relaxed text-ink md:text-2xl">
                  « Comme beaucoup de jeunes Malgaches, j'ai voulu{" "}
                  <span className="text-gradient-brand font-bold">
                    améliorer mes opportunités grâce à l'anglais
                  </span>
                  . Aujourd'hui, je transmets ce qui a changé ma vie. »
                </p>
              </div>

              <ul className="space-y-4">
                {[
                  {
                    icon: GraduationCap,
                    title: "Formation",
                    text: "Études à l'Université d'Antananarivo, puis études d'anglais au MPTC.",
                  },
                  {
                    icon: Briefcase,
                    title: "Expérience terrain",
                    text: "2 ans en centre d'appels à Madagascar — l'anglais utilisé chaque jour, en conditions réelles.",
                  },
                  {
                    icon: Rocket,
                    title: "Entrepreneur & freelance",
                    text: "Montage vidéo, design graphique, communication et marketing.",
                  },
                  {
                    icon: Target,
                    title: "Mission HiTako (2024)",
                    text: "Aider la jeunesse malgache à développer un anglais pratique qui ouvre de vraies opportunités — pas juste de bonnes notes.",
                  },
                ].map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="flex gap-4 rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur transition-colors hover:border-primary/40"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-card">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-ink">{title}</p>
                      <p className="mt-0.5 text-sm text-ink-soft">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {["Learn", "Grow", "Succeed"].map((word, i) => (
                  <span
                    key={word}
                    className="rounded-full bg-gradient-brand px-4 py-1.5 text-sm font-bold text-primary-foreground shadow-glow"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
