import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock, Sparkles, type LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Marketing copy for the popup free-tier members see when they tap a
// members-only section in the sidebar (see MemberSpaceSidebar). Kept short,
// warm and upbeat on purpose — the goal is to invite, never to scold.
// French copy: our free-tier learners are French-speaking, so the invitation
// converts far better in their own language.
const MEMBER_PERKS = [
  "HiTako Family — échangez, encouragez-vous et n'apprenez plus jamais seul",
  "HiTako Pulse — actus, sessions live et nouvelles leçons dès leur sortie",
  "Suivi complet de votre progression, badges et étapes clés",
  "Family Guide — FAQ et accompagnement direct par notre équipe",
];

// The subscription section lives on the free-tier home page — /zero for the
// Daily track, /bienvenue-coach for the Coach track (see
// src/lib/free-tier.ts) — each rendered by its own confirmation component
// with this anchor id.
const DEFAULT_SUBSCRIPTION_TARGET = { to: "/zero", hash: "ny-momba-ny-abonnement" } as const;

interface UpgradeAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureLabel: string;
  featureIcon: LucideIcon;
  firstName?: string;
  // Where "Rejoindre HiTako Academy" sends the visitor — defaults to the
  // Daily-track anchor; MemberAppShell passes the Coach-track one instead
  // when profile.preferred_format === "coach".
  subscriptionTarget?: { to: string; hash: string };
}

export default function UpgradeAccessDialog({
  open,
  onOpenChange,
  featureLabel,
  featureIcon: FeatureIcon,
  firstName,
  subscriptionTarget = DEFAULT_SUBSCRIPTION_TARGET,
}: UpgradeAccessDialogProps) {
  const navigate = useNavigate();

  // Close the dialog first, then land on the subscription block of the
  // visitor's free-tier home page. We scroll manually because when the
  // learner is already on that page a hash-only navigation doesn't
  // re-trigger the browser's own anchor scrolling.
  function goToSubscription() {
    onOpenChange(false);
    void navigate({ to: subscriptionTarget.to, hash: subscriptionTarget.hash });
    setTimeout(() => {
      document
        .getElementById(subscriptionTarget.hash)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88dvh] w-[calc(100vw-1.5rem)] max-w-md flex-col gap-0 overflow-y-auto overscroll-contain rounded-3xl border-none bg-card p-0 shadow-elegant sm:w-full [&>button]:z-10 [&>button]:text-primary-foreground [&>button]:hover:bg-white/20 [&>button]:hover:text-primary-foreground">
        {/* Decorative gradient header */}
        <div className="relative overflow-hidden bg-gradient-brand px-4 pb-6 pt-8 text-center sm:px-6 sm:pb-8 sm:pt-10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <Sparkles className="pointer-events-none absolute left-9 top-7 hidden h-4 w-4 text-white/50 sm:block" />
          <Sparkles className="pointer-events-none absolute right-12 top-16 hidden h-3 w-3 text-white/40 sm:block" />

          <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-elegant backdrop-blur sm:h-16 sm:w-16">
            <FeatureIcon className="h-6 w-6 text-white sm:h-7 sm:w-7" />
            <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-card">
              <Lock className="h-3 w-3 text-primary" />
            </div>
          </div>

          <DialogHeader className="relative mt-4 space-y-1.5 text-center sm:text-center">
            <DialogTitle className="text-balance font-display text-lg font-bold leading-snug text-white sm:text-xl">
              {featureLabel} vous attend{firstName ? `, ${firstName}` : ""} ! ✨
            </DialogTitle>
            <DialogDescription className="text-pretty text-xs text-white/90 sm:text-sm">
              C'est l'un des espaces préférés de nos membres — et rejoindre la famille est plus
              simple que vous ne le pensez.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <p className="text-pretty text-xs text-muted-foreground sm:text-sm">
            Merci de faire partie de HiTako avec votre accès gratuit — nous sommes vraiment ravis de
            vous compter parmi nous. Devenir membre complet débloque tout le reste de l'expérience :
          </p>

          <ul className="mt-4 space-y-2 sm:space-y-2.5">
            {MEMBER_PERKS.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-2.5 text-xs text-foreground sm:text-sm"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-3 w-3" />
                </span>
                <span className="min-w-0 text-pretty">{perk}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse">
            <Button
              type="button"
              size="lg"
              onClick={goToSubscription}
              className="w-full gap-1.5 bg-gradient-brand text-primary-foreground shadow-elegant hover:opacity-90 sm:w-auto"
            >
              Rejoindre HiTako Academy
              <ArrowRight className="h-4 w-4" />
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                Plus tard
              </Button>
            </DialogClose>
          </div>

          <p className="mt-4 text-pretty text-center text-[11px] text-muted-foreground sm:text-left sm:text-xs">
            Aucune pression — profitez de votre accès gratuit HiT START et rejoignez-nous quand vous
            serez prêt. Nous serons là. 💙
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
