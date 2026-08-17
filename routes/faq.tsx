import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/shared";
import { Faq, FinalCta } from "@/components/site/sections";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Questions fréquentes | HiTako Academy" },
      {
        name: "description",
        content:
          "Toutes les réponses sur les programmes HiTako : inscription, sessions, format en ligne, paiement et HiTako Daily English.",
      },
      { property: "og:title", content: "FAQ HiTako Academy" },
      {
        property: "og:description",
        content: "Toutes vos questions sur HiT START, les sessions et le HiTako Daily English.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title={
          <>
            Vos questions, <span className="text-gradient-brand">nos réponses</span>
          </>
        }
        subtitle="Tout ce que vous devez savoir avant de rejoindre la communauté HiTako."
      />
      <Faq />
      <FinalCta />
    </>
  );
}
