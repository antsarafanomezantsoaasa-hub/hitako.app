import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  HeartHandshake,
  HelpCircle,
  Mail,
  MessagesSquare,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { PlaceholderCard } from "@/components/site/member-space/shared";

export const Route = createFileRoute("/mon-espace/guide")({
  head: () => ({
    meta: [{ title: "Family Guide | HiTako Academy" }],
  }),
  component: FamilyGuidePage,
});

function FamilyGuidePage() {
  const cards: {
    icon: LucideIcon;
    title: string;
    description: string;
    to?: string;
  }[] = [
    {
      icon: Rocket,
      title: "Getting Started",
      description: "The essentials to begin your HiTako journey.",
    },
    {
      icon: HelpCircle,
      title: "Help Center",
      description: "Guides and answers for common questions.",
    },
    {
      icon: MessagesSquare,
      title: "Frequently Asked Questions",
      description: "Quick answers about programs and sessions.",
      to: "/faq",
    },
    {
      icon: Mail,
      title: "Contact Support",
      description: "Reach the HiTako team directly.",
    },
    {
      icon: HeartHandshake,
      title: "Ask the Community",
      description: "Get help from fellow HiTako members.",
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      <div className="rounded-3xl border border-border bg-card/70 p-5 shadow-card backdrop-blur sm:p-6 md:p-8">
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 shrink-0 text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
            Family Guide
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything you need to make the most of HiTako Academy.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) =>
          c.to ? (
            <Link
              key={c.title}
              to={c.to}
              className="rounded-3xl border border-border bg-card/70 p-5 shadow-card backdrop-blur transition hover:-translate-y-0.5 hover:shadow-elegant sm:p-6"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-elegant">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ) : (
            <PlaceholderCard
              key={c.title}
              icon={c.icon}
              title={c.title}
              description={c.description}
            />
          ),
        )}
      </div>
    </div>
  );
}
