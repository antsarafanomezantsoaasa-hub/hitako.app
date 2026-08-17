import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/shared";
import { Paths, Pricing, FinalCta } from "@/components/site/sections";

export const Route = createFileRoute("/programmes")({
  head: () => ({
    meta: [
      { title: "Programmes — HiT START, FLOW, PRO | HiTako Academy" },
      {
        name: "description",
        content:
          "Trois parcours d'apprentissage — HiT START, HiT FLOW, HiT PRO — pour passer de débutant à un anglais professionnel avancé. HiT START est disponible dès 49 000 Ar (jusqu'à 6 mois), ou en formule coach en petit groupe.",
      },
      { property: "og:title", content: "Programmes HiTako — HiT START, FLOW, PRO" },
      {
        property: "og:description",
        content:
          "HiT START disponible à ton rythme dans l'application, ou en petit groupe avec un coach en direct, avant HiT FLOW et HiT PRO.",
      },
    ],
  }),
  component: ProgrammesPage,
});

function ProgrammesPage() {
  return (
    <>
      <PageHero
        eyebrow="Parcours d'apprentissage"
        title={
          <>
            Trois niveaux. Une seule{" "}
            <span className="text-gradient-brand">trajectoire ascendante</span>.
          </>
        }
        subtitle="Choisissez le programme adapté à votre niveau actuel et progressez jusqu'à un anglais professionnel confiant."
      />
      <Paths />
      <Pricing />
      <FinalCta />
    </>
  );
}
