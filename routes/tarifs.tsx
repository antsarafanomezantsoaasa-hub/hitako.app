import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/shared";
import { Pricing, FinalCta } from "@/components/site/sections";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — HiT START, FLOW, PRO | HiTako Academy" },
      {
        name: "description",
        content:
          "HiT START à 49 000 Ar pour un accès pouvant aller jusqu'à 6 mois (paiement unique), ou 9 000 Ar/mois. Une formule coach en petit groupe est aussi disponible à 150 000 Ar / 2 mois.",
      },
      { property: "og:title", content: "Tarifs HiTako — HiT START, FLOW, PRO" },
      {
        property: "og:description",
        content:
          "Un prix clair par niveau : HiT START à 49 000 Ar (jusqu'à 6 mois), en paiement unique ou mensuel. HiT FLOW et HiT PRO ouvrent bientôt.",
      },
    ],
  }),
  component: TarifsPage,
});

function TarifsPage() {
  return (
    <>
      <PageHero
        eyebrow="Investissement"
        title={
          <>
            Un investissement. <span className="text-gradient-brand">Une vie transformée.</span>
          </>
        }
        subtitle="Un accès complet par niveau — HiT START, HiT FLOW, HiT PRO — avec leçons, suivi et évaluations inclus, en paiement unique ou mensuel. Une formule coach en petit groupe est aussi disponible."
      />
      <Pricing />
      <FinalCta />
    </>
  );
}
