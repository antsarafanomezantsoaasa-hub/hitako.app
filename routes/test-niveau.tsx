import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/shared";
import { EnglishQuiz } from "@/components/EnglishQuiz";
import { FinalCta } from "@/components/site/sections";

export const Route = createFileRoute("/test-niveau")({
  head: () => ({
    meta: [
      { title: "Test de niveau d'anglais gratuit — HiTako Academy" },
      {
        name: "description",
        content:
          "Évaluez votre niveau d'anglais en quelques minutes avec notre quiz gratuit et découvrez le programme HiTako fait pour vous.",
      },
      { property: "og:title", content: "Test de niveau d'anglais gratuit — HiTako" },
      {
        property: "og:description",
        content:
          "Évaluez votre niveau en quelques minutes et trouvez le programme HiTako fait pour vous.",
      },
    ],
  }),
  component: TestNiveauPage,
});

function TestNiveauPage() {
  return (
    <>
      <PageHero
        eyebrow="Test gratuit"
        title={
          <>
            Quel est votre <span className="text-gradient-brand">niveau d'anglais</span> ?
          </>
        }
        subtitle="Un quiz rapide pour identifier vos forces, vos blocages et le programme HiTako qui vous convient."
      />
      <EnglishQuiz />
      <FinalCta />
    </>
  );
}
