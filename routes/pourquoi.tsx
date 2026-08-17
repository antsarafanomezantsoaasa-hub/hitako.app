import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/shared";
import {
  InvestmentValue,
  WhyEnglish,
  WhyHitako,
  Founder,
  FinalCta,
} from "@/components/site/sections";

export const Route = createFileRoute("/pourquoi")({
  head: () => ({
    meta: [
      { title: "Pourquoi l'anglais change des vies — HiTako Academy" },
      {
        name: "description",
        content:
          "8 raisons concrètes pour lesquelles l'anglais transformera votre carrière, vos revenus et votre quotidien à Madagascar.",
      },
      { property: "og:title", content: "Pourquoi l'anglais change des vies — HiTako Academy" },
      {
        property: "og:description",
        content:
          "8 raisons concrètes pour lesquelles l'anglais transformera votre carrière et votre quotidien.",
      },
    ],
  }),
  component: PourquoiPage,
});

function PourquoiPage() {
  return (
    <>
      <PageHero
        eyebrow="Pourquoi HiTako"
        title={
          <>
            L'anglais n'est pas une matière.{" "}
            <span className="text-gradient-brand">C'est un passeport.</span>
          </>
        }
        subtitle="Découvrez pourquoi maîtriser l'anglais est le meilleur investissement que vous puissiez faire pour votre avenir."
      />
      <InvestmentValue />
      <WhyEnglish />
      <WhyHitako />
      <Founder />
      <FinalCta />
    </>
  );
}
