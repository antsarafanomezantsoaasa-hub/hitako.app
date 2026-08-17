import { useState } from "react";
import {
  BadgeCheck,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Gem,
  MessageCircle,
  Smartphone,
  Sparkles,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Reveal, InteractiveCard } from "@/components/site/shared";
import { HIT_START_COACH } from "@/components/site/sections";
import { PAYMENT_METHODS, WHATSAPP_NUMBER } from "@/lib/payment-info";

/**
 * Post-registration onboarding + payment flow for the "free" tier landing
 * page dedicated to the HiT START Coach track (/bienvenue-coach). Mirrors
 * the structure of confirm-registration.tsx (the self-paced HiT START
 * equivalent shown on /zero) — same Mobile Money numbers, same WhatsApp
 * proof-of-payment step (see src/lib/payment-info.ts) — but the copy walks
 * through the live-coaching learning system (WhatsApp cohort group, live
 * session schedule) instead of the self-paced app, and there's a single
 * plan (HIT_START_COACH, imported from the Pricing section so both places
 * always quote the same price) instead of the HiT START single/monthly
 * payment toggle.
 */

const ONBOARDING_STEPS = [
  {
    icon: Wallet,
    title: "1. Confirme ton paiement",
    desc: "Envoie tes frais de formation via Mobile Money, puis la capture d'écran sur WhatsApp — c'est l'étape ci-dessous.",
  },
  {
    icon: MessageCircle,
    title: "2. Rejoins le groupe WhatsApp",
    desc: "Dès ton paiement validé par l'équipe HiTako, tu reçois le lien d'invitation du groupe WhatsApp de ta cohorte (max. 6 apprenants).",
  },
  {
    icon: Calendar,
    title: "3. Assiste aux sessions live",
    desc: "4 sessions par semaine, 1h30 chacune, animées en direct par ton coach — l'horaire est communiqué dans le groupe.",
  },
  {
    icon: UserCheck,
    title: "4. Pratique avec un vrai suivi",
    desc: "Exercices guidés, devoirs, corrections et retours personnalisés du coach tout au long des 2 mois.",
  },
] as const;

export function ConfirmCoachRegistration({ displayName }: { displayName: string }) {
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

  const waMessage = encodeURIComponent(
    `Bonjour, je m'appelle ${displayName}. Je viens d'envoyer mes frais de formation pour HiT START Coach (${HIT_START_COACH.price} / 2 mois) et je vous transmets la preuve de paiement. Raison : HiT START Coach.`,
  );

  return (
    <div className="mt-10 flex flex-col gap-6">
      {/* Intro */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 text-primary-foreground shadow-elegant md:p-10">
          <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              <Users className="h-3.5 w-3.5" /> HiT START Coach
            </span>
            <h2 className="mt-4 font-display text-2xl font-extrabold md:text-3xl">
              Bienvenue, {displayName.split(" ")[0]} 👋
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 md:text-base">
              Merci d'avoir choisi l'accompagnement d'un coach. Ta place est réservée — il ne reste
              qu'une étape avant de rejoindre ton groupe et de démarrer les sessions live.
            </p>
          </div>
        </div>
      </Reveal>

      {/* How the live system works */}
      <Reveal delay={80}>
        <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-card backdrop-blur md:p-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-bold text-foreground">
              Comment fonctionne HiT START Coach
            </h3>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            Tout se passe en direct, en petit groupe, sur WhatsApp. Voici les 4 étapes :
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {ONBOARDING_STEPS.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-4.5 w-4.5" />
                </div>
                <h4 className="mt-3 text-sm font-semibold text-foreground">{s.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Plan summary */}
      <Reveal delay={80}>
        <InteractiveCard className="rounded-3xl">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
            <div className="flex items-center gap-2">
              <Gem className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">Ta formule</h3>
            </div>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  HiT START Coach — 2 mois
                </p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-extrabold text-gradient-brand">
                    {HIT_START_COACH.price}
                  </span>
                  <span className="text-sm text-ink-soft">/ 2 mois</span>
                </p>
              </div>
              <p className="max-w-xs text-xs text-ink-soft">
                Places limitées — petits groupes de 6 apprenants maximum, coach en direct.
              </p>
            </div>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {HIT_START_COACH.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </InteractiveCard>
      </Reveal>

      {/* Payment methods */}
      <Reveal delay={80}>
        <div
          id="hamafiso-coach"
          className="scroll-mt-24 rounded-3xl bg-gradient-brand p-6 text-primary-foreground shadow-elegant md:p-8"
        >
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <h3 className="font-display text-lg font-bold">Confirme ta place</h3>
          </div>
          <p className="mt-2 text-sm text-white/85">
            Envoie tes frais de formation à l'un de ces numéros :
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
            HiT START Coach — {HIT_START_COACH.price} / 2 mois
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
                      <Check className="h-3.5 w-3.5" /> Copié
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copier le numéro
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
            Une fois le paiement envoyé
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
            Envoie-nous la capture d'écran de la transaction sur WhatsApp pour qu'on puisse
            confirmer ta place.
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            <span className="underline">Raison</span> : HiT START Coach
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]"
          >
            <MessageCircle className="h-4 w-4" />
            Envoyer la preuve sur WhatsApp
          </a>
          <p className="mx-auto mt-4 max-w-md text-xs text-ink-soft">
            Dès que c'est confirmé, tu reçois le lien du groupe WhatsApp de ta cohorte et le
            planning des sessions live. <CheckCircle2 className="inline h-3.5 w-3.5 text-primary" />
          </p>
        </div>
      </Reveal>
    </div>
  );
}
