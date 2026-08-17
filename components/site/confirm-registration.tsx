import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Copy,
  Gamepad2,
  Gem,
  GraduationCap,
  MessageCircle,
  PartyPopper,
  PlayCircle,
  RotateCcw,
  Smartphone,
  Sparkles,
  Timer,
  Wallet,
} from "lucide-react";
import { Reveal, InteractiveCard } from "@/components/site/shared";
import { ProgramRoadmap } from "@/components/site/program-roadmap";
import { PAYMENT_METHODS, WHATSAPP_NUMBER } from "@/lib/payment-info";
import welcomeBanner from "@/assets/zero-welcome-banner.jpg";
import hitStartAd from "@/assets/hit-start-daily-english-ad.jpg";

/**
 * Post-registration conversion flow for the "free" tier landing page (/zero).
 * This is the paid HiT START course — branded "HiT START" throughout (not
 * "HiTako Daily English", which is the separate free newsletter promoted
 * elsewhere on the site; the two used to share a name, which caused
 * confusion). Copy stays in Malagasy on purpose, the same register the
 * testimonials elsewhere on the site already use for this kind of personal,
 * high-stakes moment.
 */

type PlanId = "monthly" | "full";

const PLANS: Record<
  PlanId,
  {
    label: string;
    price: string;
    originalPrice?: string;
    period: string;
    note?: string;
    badge?: string;
  }
> = {
  monthly: {
    label: "Paiement mensuel",
    price: "9 000 Ar",
    period: "/ mois",
  },
  full: {
    label: "Paiement unique",
    price: "49 000 Ar",
    period: "hatramin'ny 6 volana",
    badge: "Meilleur prix",
  },
};

const PLAN_FEATURES = [
  "Fidirana feno ao amin'ny HiT START mandritra ny faharetan'ny abonnement-anao",
  "Fandaharam-pianarana mirindra amin'ny fidirana hatramin'ny 6 volana (Niveau iray = hatramin'ny 6 volana)",
  "Lesona mahaliana azo arahina arakaraka ny fahafahanao",
  "PDF azo alaina",
  "Feo (audio) fampiharana ny fanononana isaky ny lesona (misokatra ho an'ny mpikambana rehetra)",
  "Quiz sy fanazaran-tena hitsapana ny fahaizanao",
  "Fanaraha-maso mazava ny fivoaranao",
];

export function ConfirmRegistration({ displayName }: { displayName: string }) {
  const [plan, setPlan] = useState<PlanId>("full");
  const [copied, setCopied] = useState<string | null>(null);

  const copyNumber = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ""));
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    } catch {
      // Clipboard API unavailable — the number is already visible to copy by hand.
    }
  };

  const selected = PLANS[plan];
  const waMessage = encodeURIComponent(
    `Salama, ${displayName} no anarako. Efa nandefa ny saram-pianarako ho an'ny HiT START (${selected.label}, ${selected.price} ${selected.period}) aho ary manatitra ny porofon'ny fandoavana. Raison: HiT START.`,
  );

  return (
    <div className="mt-10 flex flex-col gap-6">
      {/* Intro */}
      <Reveal>
        <div className="overflow-hidden rounded-3xl border border-border bg-card/70 shadow-card backdrop-blur">
          <img
            src={welcomeBanner}
            alt="Bannière de bienvenue HiT START — HiTako Academy"
            className="aspect-[1200/468] w-full object-cover"
            loading="lazy"
          />
          <div className="p-6 md:p-8">
            <p className="text-sm leading-relaxed text-foreground/80 md:text-base">
              Tongasoa eto amin'ny <strong className="text-foreground">HiT START</strong> ary
              misaotra anao nisafidy ny <strong className="text-foreground">HiTako Academy</strong>.
              Voaray ny fisoratanao anarana ary hanomboka tsy ho ela ny dianao amin'ny fianarana
              teny anglisy.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/jeux"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-[linear-gradient(120deg,#7C3AED_0%,#6366F1_45%,#06B6D4_100%)] py-3.5 pl-3.5 pr-5 text-primary-foreground shadow-elegant ring-2 ring-primary/40 transition-transform hover:-translate-y-0.5 hover:scale-[1.02] sm:flex-[1.15]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-xl" />
                <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur">
                  <span className="absolute inset-0 rounded-xl animate-pulse-ring" />
                  <Gamepad2 className="h-7 w-7" strokeWidth={2.2} />
                </span>
                <span className="relative flex flex-col items-start leading-tight">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/90">
                    🎮 NEW · Vao tonga
                  </span>
                  <span className="font-display text-lg font-extrabold tracking-tight">
                    Enter the Play Zone
                  </span>
                </span>
                <ArrowRight className="relative ml-auto h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/lecon-demo-18"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card py-3 pl-3 pr-5 shadow-card transition-transform hover:-translate-y-0.5 hover:scale-[1.01] sm:flex-1"
              >
                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <PlayCircle className="h-6 w-6" strokeWidth={2.2} />
                </span>
                <span className="relative flex flex-col items-start leading-tight">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-ink-soft">
                    🎁 FREE · 15 min
                  </span>
                  <span className="font-display text-base font-extrabold tracking-tight text-foreground">
                    Start Your Demo
                  </span>
                </span>
                <ArrowRight className="relative ml-auto h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Vous n’avez pas besoin de payer — essayez d’abord la leçon ou le jeu pour décider.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Benefits + method */}
      <div className="grid gap-6 md:grid-cols-2">
        <Reveal delay={80}>
          <InteractiveCard className="h-full rounded-3xl">
            <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-card md:p-7">
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  Inona no tombony ho azonao?
                </h3>
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                Rehefa vita soa aman-tsara ny <strong>HiT START</strong>, dia ho hainao ny:
              </p>
              <ul className="mt-4 space-y-2.5">
                {[
                  "Hampahafantatra ny tenanao.",
                  "Hiresaka momba ny fianakaviana sy ny asanao.",
                  "Hamaly sy hametraka fanontaniana tsotra.",
                  "Hiantsena sy hanafatra sakafo.",
                  "Hahatakatra teny anglisy fampiasa isan'andro.",
                ].map((it) => (
                  <li key={it} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </InteractiveCard>
        </Reveal>

        <Reveal delay={140}>
          <InteractiveCard className="h-full rounded-3xl">
            <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-card md:p-7">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  Ahoana ny fomba hianarana?
                </h3>
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                Ny programa rehetra dia natao ho mora arahina.
              </p>
              <ul className="mt-4 space-y-3 text-sm text-foreground">
                <li className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Lesona vaovao: <strong>Alatsinainy → Alakamisy</strong>
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Alefa amin'ny <strong>8:00 maraina</strong>
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Timer className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong>10–15 minitra</strong> isan'andro
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <ClipboardCheck className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Quiz fanamafisana: <strong>Isaky ny Zoma</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Fandrosoana kely isan'andro no mitondra vokatra lehibe.</span>
                </li>
              </ul>
              <p className="mt-4 rounded-xl bg-primary/5 px-3 py-2 text-xs text-ink-soft">
                Ny "niveau" kendrena hotratrarina dia ny{" "}
                <strong className="text-primary">CEFR A2 (Elementary)</strong>.
              </p>
            </div>
          </InteractiveCard>
        </Reveal>
      </div>

      {/* Full curriculum roadmap */}
      <ProgramRoadmap />

      {/* Subscription options */}
      <Reveal delay={80}>
        <div
          id="ny-momba-ny-abonnement"
          className="scroll-mt-24 rounded-3xl border border-border bg-card/70 p-6 shadow-card backdrop-blur md:p-8"
        >
          <div className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-bold text-foreground">
              Ny momba ny abonnement
            </h3>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            Safidio ny abonnement mifanaraka amin'ny tanjonao.
          </p>

          <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-foreground">
            <PartyPopper className="h-4 w-4 shrink-0 text-amber-500" />
            <span>
              <strong>Prix de lancement</strong> — hitombo avo roa heny tsy ho ela.
            </span>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-ink-soft">
            Ny ho azonao
          </p>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(Object.keys(PLANS) as PlanId[]).map((id) => {
              const p = PLANS[id];
              const active = plan === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPlan(id)}
                  aria-pressed={active}
                  className={`relative rounded-2xl border p-5 text-left transition-all ${
                    active
                      ? "border-primary/50 bg-gradient-to-br from-primary/5 via-card to-primary-glow/10 shadow-elegant"
                      : "border-border bg-card shadow-card hover:-translate-y-0.5"
                  }`}
                >
                  {p.badge && (
                    <span className="absolute -top-3 right-4 rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-glow">
                      {p.badge}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        active ? "border-primary bg-primary" : "border-border"
                      }`}
                    >
                      {active && (
                        <Check className="h-3 w-3 text-primary-foreground" strokeWidth={4} />
                      )}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{p.label}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-display text-2xl font-extrabold text-gradient-brand">
                      {p.price}
                    </span>
                    {p.originalPrice && (
                      <span className="text-sm font-semibold text-muted-foreground line-through">
                        {p.originalPrice}
                      </span>
                    )}
                    <span className="text-sm font-medium text-ink-soft">{p.period}</span>
                  </div>
                  {p.note && <p className="mt-2 text-xs text-ink-soft">{p.note}</p>}
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Promotional flyer */}
      <Reveal delay={80}>
        <div className="overflow-hidden rounded-3xl border border-border bg-card/70 shadow-card backdrop-blur">
          <img
            src={hitStartAd}
            alt="Affiche HiT START, 80 jours pour atteindre le niveau A2, HiTako Academy"
            className="aspect-[1875/1172] w-full object-cover"
            loading="lazy"
          />
        </div>
      </Reveal>

      {/* Final steps */}
      <Reveal delay={80}>
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 md:p-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-bold text-foreground">Dingana farany</h3>
          </div>
          <p className="mt-3 text-sm text-foreground/80">
            <strong>Efa voatahiry izao ny toeranao</strong>, saingy mba hahafahanao mandray ny
            lesona voalohany, dia mila manamafy izany amin'ny fandoavana ny{" "}
            <strong>saram-pianarana</strong> ianao.
          </p>
          <p className="mt-3 text-sm text-foreground/80">
            Rehefa voaray sy voamarina ny fandoavam-bola nataonao dia:
          </p>
          <ul className="mt-3 space-y-2">
            {[
              "Vita tanteraka ny fisoratanao anarana.",
              'Tafiditra ao anatin\'ny fandaharana "HiT START" ianao.',
              "Hanomboka handray ny lesona isan'andro ary afaka mianatra avy hatrany.",
            ].map((it) => (
              <li key={it} className="flex items-start gap-2.5 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {it}
              </li>
            ))}
          </ul>
          <a
            href="#hamafiso"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]"
          >
            Vonona hanomboka ve ianao?
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </Reveal>

      {/* Payment methods */}
      <Reveal delay={80}>
        <div
          id="hamafiso"
          className="scroll-mt-24 rounded-3xl bg-gradient-brand p-6 text-primary-foreground shadow-elegant md:p-8"
        >
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <h3 className="font-display text-lg font-bold">Hamafiso ny fisoratanao anarana</h3>
          </div>
          <p className="mt-2 text-sm text-white/85">
            Alefaso amin'ny iray amin'ireto laharana ireto ny saram-pianaranao :
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
            {selected.label} — {selected.price} {selected.period}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {PAYMENT_METHODS.map((m) => (
              <div
                key={m.key}
                className="rounded-2xl border border-white/25 bg-white/10 p-5 backdrop-blur"
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Smartphone className="h-4 w-4" />
                  {m.name}
                </div>
                <p className="mt-3 font-display text-lg font-bold tracking-wide">{m.number}</p>
                <p className="mt-1 text-xs text-white/80">{m.holder}</p>
                <button
                  type="button"
                  onClick={() => copyNumber(m.key, m.number)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white/20 px-3 py-2 text-xs font-semibold transition hover:bg-white/30"
                >
                  {copied === m.key ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Voakopia
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Kopia ny laharana
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Confirmation */}
      <Reveal delay={80}>
        <div className="rounded-3xl border border-border bg-card/70 p-6 text-center shadow-card backdrop-blur md:p-8">
          <BadgeCheck className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-3 font-display text-xl font-bold text-foreground">
            Rehefa vita ny fandoavam-bola
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
            Mba hanamarinana ny fandoavana (payment), dia manasa anao izahay handefa ny porofo
            an-tsary ny "transaction".
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            <span className="underline">Raison</span> : HiT START
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]"
          >
            <MessageCircle className="h-4 w-4" />
            Alefaso ny porofo amin'ny WhatsApp
          </a>
          <p className="mx-auto mt-4 max-w-md text-xs text-ink-soft">
            Hamarininay ao anatin'ny fotoana fohy izany, ary rehefa voamarina dia{" "}
            <strong className="text-foreground">
              hanomboka handray ny lesonao voalohany ianao.
            </strong>
          </p>
        </div>
      </Reveal>
    </div>
  );
}
