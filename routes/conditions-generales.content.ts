// Traduction française du document officiel "Terms & Conditions" de HiTako
// Academy (PDF fourni par HiTako, mise à jour du 10 août 2026), afin que
// tous les utilisateurs du site — dont la langue d'usage est le français —
// puissent le lire et le comprendre facilement.
//
// Cette traduction reprend fidèlement la structure et la numérotation du
// document source (30 sections). En cas de modification du document
// officiel, mettre à jour ce fichier en conséquence pour que les deux
// versions restent alignées.

export type TermsBlock = { type: "p"; text: string } | { type: "ul"; items: string[] };

export interface TermsSection {
  id: string;
  number: number;
  title: string;
  blocks: TermsBlock[];
}

export const TERMS_LAST_UPDATED = "10 août 2026";

export const TERMS_INTRO: string[] = [
  "Les présentes Conditions Générales régissent l'inscription, le paiement, l'accès et la participation aux programmes éducatifs et services proposés par HiTako Academy.",
  "En s'inscrivant à un programme de HiTako Academy, en effectuant un paiement, en accédant à la plateforme HiTako Academy, ou en participant à un cours, l'étudiant reconnaît avoir lu, compris et accepté les présentes Conditions Générales.",
];

export const TERMS_TRANSLATION_NOTE =
  "Cette page est une traduction en français du document officiel « Terms & Conditions » de HiTako Academy, fournie pour faciliter la compréhension de tous les utilisateurs. En cas de divergence d'interprétation, la version anglaise originale fait foi.";

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "about",
    number: 1,
    title: "À propos de HiTako Academy",
    blocks: [
      {
        type: "p",
        text: "HiTako Academy est une académie d'apprentissage de l'anglais proposant des programmes éducatifs, des cours, du matériel pédagogique, des évaluations, des services d'apprentissage numérique et des activités éducatives connexes.",
      },
      {
        type: "p",
        text: "Nos programmes peuvent être dispensés en ligne, en présentiel, ou selon une combinaison des deux, en fonction du programme et de l'offre choisis par l'étudiant.",
      },
      {
        type: "p",
        text: "Le nom, le contenu, la durée, le calendrier, le format, le prix et les conditions de chaque programme peuvent varier.",
      },
    ],
  },
  {
    id: "registration",
    number: 2,
    title: "Inscription",
    blocks: [
      {
        type: "p",
        text: "L'inscription est personnelle et doit être effectuée avec des informations exactes et sincères.",
      },
      {
        type: "p",
        text: "L'étudiant est responsable de fournir des informations correctes, notamment :",
      },
      {
        type: "ul",
        items: [
          "Nom complet",
          "Adresse e-mail",
          "Numéro de téléphone",
          "Toute autre information raisonnablement requise pour l'inscription ou la création du compte",
        ],
      },
      {
        type: "p",
        text: "HiTako Academy peut refuser, suspendre ou annuler une inscription lorsque les informations fournies sont fausses, frauduleuses, incomplètes ou utilisées à des fins non autorisées.",
      },
      {
        type: "p",
        text: "Une inscription n'est considérée comme confirmée qu'une fois les conditions d'inscription applicables remplies et, le cas échéant, le paiement reçu et validé par HiTako Academy.",
      },
    ],
  },
  {
    id: "eligibility",
    number: 3,
    title: "Éligibilité",
    blocks: [
      {
        type: "p",
        text: "Sauf indication contraire pour un programme particulier, les programmes de HiTako Academy sont ouverts aux apprenants qui remplissent les conditions d'admission communiquées pour ce programme.",
      },
      {
        type: "p",
        text: "Certains programmes peuvent comporter des exigences spécifiques relatives à :",
      },
      {
        type: "ul",
        items: [
          "L'âge",
          "Le niveau d'anglais",
          "Les études antérieures",
          "La disponibilité",
          "L'équipement technique",
          "L'accès à Internet",
          "Les résultats d'évaluation",
        ],
      },
      {
        type: "p",
        text: "HiTako Academy se réserve le droit de recommander un niveau ou un programme différent lorsque le niveau démontré par l'étudiant n'est pas adapté au cours sélectionné.",
      },
    ],
  },
  {
    id: "duration-access",
    number: 4,
    title: "Durée et accès au programme",
    blocks: [
      {
        type: "p",
        text: "Chaque programme a sa propre durée, son propre calendrier, un nombre de leçons et des conditions d'accès qui lui sont propres.",
      },
      {
        type: "p",
        text: "Par exemple, l'accès à un programme d'apprentissage numérique peut être limité à la période précisée au moment de l'inscription de l'étudiant.",
      },
      { type: "p", text: "Sauf indication contraire expresse :" },
      {
        type: "ul",
        items: [
          "L'accès au cours est personnel et non transférable.",
          "L'inscription à un programme ne donne pas automatiquement accès à un autre programme.",
          "L'accès à de futurs niveaux, cycles, cours ou contenus premium peut nécessiter une inscription distincte ou le respect de conditions de progression.",
        ],
      },
      {
        type: "p",
        text: "HiTako Academy peut restreindre ou mettre fin à l'accès lorsque les présentes Conditions Générales sont violées de manière grave ou répétée.",
      },
    ],
  },
  {
    id: "payment",
    number: 5,
    title: "Paiement",
    blocks: [
      {
        type: "p",
        text: "Le prix applicable est celui communiqué par HiTako Academy au moment de l'inscription.",
      },
      {
        type: "p",
        text: "Le paiement peut être effectué selon les moyens de paiement communiqués par HiTako Academy.",
      },
      {
        type: "p",
        text: "Un étudiant n'est considéré comme inscrit qu'une fois le paiement ou les conditions d'inscription requises vérifiés avec succès.",
      },
      { type: "p", text: "L'étudiant est responsable de s'assurer que :" },
      {
        type: "ul",
        items: [
          "Le montant du paiement est correct.",
          "Les informations de paiement sont exactes.",
          "Une preuve de paiement est fournie sur demande.",
          "Les frais de transaction ou de transfert applicables sont à la charge de l'étudiant, sauf indication contraire.",
        ],
      },
      {
        type: "p",
        text: "HiTako Academy peut refuser l'accès à un programme lorsque le paiement requis n'a pas été reçu ou validé.",
      },
    ],
  },
  {
    id: "payment-plans",
    number: 6,
    title: "Échéanciers de paiement et soldes impayés",
    blocks: [
      {
        type: "p",
        text: "Lorsque HiTako Academy propose un échéancier de paiement, l'étudiant s'engage à respecter le calendrier de paiement convenu.",
      },
      { type: "p", text: "Le non-respect d'un paiement requis peut entraîner :" },
      {
        type: "ul",
        items: [
          "La suspension de l'accès",
          "La suspension de la participation aux cours",
          "La restriction des fonctionnalités de la plateforme",
          "L'annulation de l'inscription",
          "La perte d'accès aux services non payés",
        ],
      },
      {
        type: "p",
        text: "HiTako Academy peut exiger le règlement des sommes dues avant de rétablir l'accès.",
      },
    ],
  },
  {
    id: "refunds",
    number: 7,
    title: "Politique de remboursement et d'annulation",
    blocks: [
      {
        type: "p",
        text: "Étant donné que HiTako Academy fournit des services éducatifs et, dans certains cas, un accès immédiat à du contenu pédagogique numérique, les paiements ne sont généralement pas remboursables une fois le cours commencé ou l'accès numérique accordé, sauf accord exprès contraire de HiTako Academy ou obligation légale de remboursement.",
      },
      {
        type: "p",
        text: "Avant le début du programme, une demande d'annulation peut être examinée au cas par cas.",
      },
      { type: "p", text: "Lorsqu'un remboursement est approuvé :" },
      {
        type: "ul",
        items: [
          "Le montant du remboursement peut dépendre des circonstances de l'annulation.",
          "Les frais de traitement de paiement ou de transaction peuvent être non remboursables, le cas échéant.",
          "Le contenu numérique déjà consulté peut affecter l'éligibilité au remboursement.",
        ],
      },
      {
        type: "p",
        text: "Un étudiant qui cesse simplement d'assister aux cours n'a pas automatiquement droit à un remboursement.",
      },
    ],
  },
  {
    id: "schedule-changes",
    number: 8,
    title: "Calendrier des cours et modifications",
    blocks: [
      {
        type: "p",
        text: "HiTako Academy met tout en œuvre, dans la mesure du raisonnable, pour maintenir le calendrier publié.",
      },
      {
        type: "p",
        text: "Cependant, les calendriers, enseignants, salles de classe, plateformes d'apprentissage, dates de leçons ou autres détails opérationnels peuvent occasionnellement devoir changer en raison de circonstances telles que :",
      },
      {
        type: "ul",
        items: [
          "La disponibilité des enseignants",
          "Des problèmes techniques",
          "Les jours fériés",
          "Un nombre d'inscriptions insuffisant",
          "Des impératifs opérationnels",
          "Un cas de force majeure",
          "D'autres circonstances échappant à un contrôle raisonnable",
        ],
      },
      {
        type: "p",
        text: "Lorsqu'un changement est nécessaire, HiTako Academy fera des efforts raisonnables pour prévenir les étudiants concernés et, le cas échéant, proposer un arrangement alternatif.",
      },
      {
        type: "p",
        text: "HiTako Academy ne garantit pas qu'un enseignant, un horaire, une plateforme ou une salle de classe spécifique reste inchangé tout au long d'un programme, sauf garantie expresse écrite.",
      },
    ],
  },
  {
    id: "attendance",
    number: 9,
    title: "Assiduité et cours manqués",
    blocks: [
      {
        type: "p",
        text: "Les étudiants sont responsables d'assister à leurs cours programmés et de réaliser les activités d'apprentissage qui leur sont assignées.",
      },
      { type: "p", text: "Le fait de manquer un cours ne donne pas automatiquement droit à :" },
      {
        type: "ul",
        items: [
          "Un remboursement",
          "Un cours de remplacement",
          "Un cours particulier",
          "Une prolongation de la durée du programme",
        ],
      },
      {
        type: "p",
        text: "Lorsque HiTako Academy fournit des enregistrements, du matériel de cours, des ressources de rattrapage ou d'autres alternatives, celles-ci sont fournies selon les conditions du programme concerné.",
      },
      {
        type: "p",
        text: "Les étudiants sont encouragés à prévenir HiTako Academy dès que raisonnablement possible lorsqu'ils ne peuvent pas assister à une session programmée.",
      },
    ],
  },
  {
    id: "online-requirements",
    number: 10,
    title: "Conditions requises pour l'apprentissage en ligne",
    blocks: [
      {
        type: "p",
        text: "Pour les programmes en ligne, les étudiants sont responsables de disposer de l'équipement et de la connectivité raisonnablement nécessaires pour participer.",
      },
      { type: "p", text: "Cela peut inclure :" },
      {
        type: "ul",
        items: [
          "Un smartphone, une tablette ou un ordinateur",
          "Une connexion Internet",
          "Un microphone fonctionnel",
          "Une caméra lorsque requise",
          "Un environnement d'apprentissage approprié",
          "L'accès aux plateformes de communication ou d'apprentissage utilisées par HiTako Academy",
        ],
      },
      {
        type: "p",
        text: "Les problèmes causés par l'appareil, la connexion Internet, l'alimentation électrique, le logiciel ou l'environnement de l'étudiant ne donnent pas automatiquement droit à un remboursement ou à une session de remplacement.",
      },
      {
        type: "p",
        text: "HiTako Academy fera des efforts raisonnables pour résoudre les problèmes techniques provenant de ses propres systèmes.",
      },
    ],
  },
  {
    id: "accounts",
    number: 11,
    title: "Comptes étudiants",
    blocks: [
      {
        type: "p",
        text: "Lorsqu'un étudiant reçoit un compte pour la plateforme HiTako Academy, ce compte est personnel.",
      },
      { type: "p", text: "Les étudiants doivent :" },
      {
        type: "ul",
        items: [
          "Garder leurs identifiants de connexion confidentiels",
          "Ne pas partager leur compte avec une autre personne",
          "Ne pas vendre, transférer, louer ou prêter leur accès",
          "Informer HiTako Academy s'ils pensent que leur compte a été compromis",
        ],
      },
      {
        type: "p",
        text: "Une inscription est destinée à un seul étudiant, sauf accord spécifique concernant un usage multi-utilisateurs.",
      },
      {
        type: "p",
        text: "HiTako Academy peut suspendre un compte en cas de preuve de partage non autorisé, de fraude, d'abus ou d'autres violations graves des présentes Conditions.",
      },
    ],
  },
  {
    id: "intellectual-property",
    number: 12,
    title: "Matériel pédagogique et propriété intellectuelle",
    blocks: [
      {
        type: "p",
        text: "L'ensemble du matériel pédagogique fourni par HiTako Academy — incluant notamment :",
      },
      {
        type: "ul",
        items: [
          "Les leçons",
          "Les vidéos",
          "Les fichiers audio",
          "Les PDF",
          "Les exercices",
          "Les quiz",
          "Les tests",
          "Les présentations",
          "Les images",
          "Les jeux",
          "La structure des cours",
          "Le contenu rédactionnel",
          "Le contenu du site internet",
          "Le contenu de la plateforme",
          "Les éléments de marque et visuels",
        ],
      },
      {
        type: "p",
        text: "est protégé par les lois applicables en matière de propriété intellectuelle et demeure la propriété de HiTako Academy ou de ses concédants respectifs, sauf indication contraire expresse.",
      },
      {
        type: "p",
        text: "L'inscription confère à l'étudiant un droit limité, personnel, non exclusif et non transférable d'utiliser le matériel à des fins éducatives personnelles.",
      },
      { type: "p", text: "Les étudiants ne peuvent pas, sans autorisation écrite préalable :" },
      {
        type: "ul",
        items: [
          "Copier et redistribuer le matériel de cours",
          "Vendre ou exploiter commercialement le matériel",
          "Publier le matériel sur des sites internet ou groupes publics",
          "Partager des leçons payantes avec des personnes non inscrites",
          "Enregistrer et redistribuer les cours",
          "Reproduire le cours en le présentant comme le leur",
          "Retirer les mentions de droit d'auteur ou de propriété",
          "Utiliser le matériel de HiTako Academy pour créer un cours commercial concurrent",
        ],
      },
      {
        type: "p",
        text: "Toute distribution non autorisée peut entraîner la suspension ou la résiliation immédiate de l'accès et peut donner lieu à d'autres mesures, le cas échéant.",
      },
    ],
  },
  {
    id: "assessments",
    number: 13,
    title: "Tests, évaluations et progression",
    blocks: [
      {
        type: "p",
        text: "HiTako Academy peut utiliser des quiz, des devoirs, des tests mensuels, des évaluations finales, des activités orales, des activités d'écoute ou d'autres formes d'évaluation pour mesurer la progression des étudiants.",
      },
      {
        type: "p",
        text: "Lorsqu'un programme précise une note de passage minimale ou une condition de progression, les étudiants doivent remplir cette condition pour progresser au niveau suivant ou obtenir la reconnaissance de réussite correspondante.",
      },
      {
        type: "p",
        text: "Pour les programmes ayant des objectifs alignés sur le CECR, le niveau CECR indiqué représente l'objectif d'apprentissage et le cadre d'évaluation, et non une garantie automatique que chaque étudiant atteindra ce niveau.",
      },
      {
        type: "p",
        text: "Les résultats des étudiants dépendent de facteurs tels que l'assiduité, la participation, la pratique, l'accomplissement des devoirs et la progression individuelle de l'apprentissage.",
      },
    ],
  },
  {
    id: "certificates",
    number: 14,
    title: "Certificats et reconnaissance de réussite",
    blocks: [
      {
        type: "p",
        text: "Lorsqu'un programme délivre un certificat ou une autre forme de reconnaissance de réussite, l'éligibilité peut dépendre des conditions communiquées pour ce programme.",
      },
      { type: "p", text: "HiTako Academy peut prendre en compte des facteurs tels que :" },
      {
        type: "ul",
        items: [
          "L'assiduité",
          "L'accomplissement des leçons requises",
          "Les résultats aux évaluations",
          "Les résultats à l'examen final",
          "Le respect des conditions du programme",
        ],
      },
      {
        type: "p",
        text: "L'inscription seule ne garantit pas automatiquement l'obtention d'un certificat.",
      },
    ],
  },
  {
    id: "conduct",
    number: 15,
    title: "Conduite des étudiants",
    blocks: [
      {
        type: "p",
        text: "HiTako Academy s'engage à maintenir un environnement d'apprentissage respectueux et productif.",
      },
      { type: "p", text: "Les étudiants doivent se comporter avec respect envers :" },
      {
        type: "ul",
        items: [
          "Les enseignants",
          "Le personnel",
          "Les autres étudiants",
          "Les invités",
          "Les membres de la communauté HiTako Academy",
        ],
      },
      {
        type: "p",
        text: "Les comportements suivants peuvent entraîner des mesures disciplinaires :",
      },
      {
        type: "ul",
        items: [
          "Le harcèlement",
          "Les menaces",
          "La discrimination",
          "L'intimidation",
          "Les insultes",
          "Les discours de haine",
          "Le harcèlement sexuel",
          "Les comportements perturbateurs répétés",
          "La fraude",
          "L'usurpation d'identité",
          "L'enregistrement non autorisé",
          "Le partage d'informations privées concernant un autre étudiant",
          "La perturbation délibérée des cours ou de la plateforme",
        ],
      },
      {
        type: "p",
        text: "Selon la gravité du comportement, HiTako Academy peut émettre un avertissement, restreindre l'accès, suspendre la participation ou résilier l'inscription.",
      },
    ],
  },
  {
    id: "academic-integrity",
    number: 16,
    title: "Intégrité académique",
    blocks: [
      {
        type: "p",
        text: "Les étudiants sont tenus de réaliser leurs évaluations de manière honnête.",
      },
      { type: "p", text: "Les étudiants ne doivent pas :" },
      {
        type: "ul",
        items: [
          "Copier les réponses d'un autre étudiant",
          "Soumettre le travail d'une autre personne comme le leur",
          "Partager des réponses lors d'évaluations restreintes",
          "Manipuler les systèmes d'évaluation",
          "Utiliser une aide non autorisée lorsqu'une évaluation l'interdit",
        ],
      },
      {
        type: "p",
        text: "Lorsqu'une fraude académique est établie, HiTako Academy peut invalider l'évaluation concernée et prendre des mesures disciplinaires supplémentaires.",
      },
    ],
  },
  {
    id: "communication-platforms",
    number: 17,
    title: "Communauté et plateformes de communication",
    blocks: [
      {
        type: "p",
        text: "HiTako Academy peut utiliser des plateformes telles que WhatsApp, Google Meet, l'e-mail, son site internet ou d'autres services numériques à des fins de communication pédagogique.",
      },
      {
        type: "p",
        text: "Les étudiants sont tenus d'utiliser ces espaces de manière responsable.",
      },
      {
        type: "p",
        text: "Le spam inutile, la publicité, le harcèlement, le contenu inapproprié, la promotion non autorisée ou tout comportement perturbateur peut entraîner l'exclusion de la communauté ou du groupe concerné.",
      },
      {
        type: "p",
        text: "HiTako Academy peut établir des règles supplémentaires pour des groupes, cours, événements ou communautés spécifiques.",
      },
    ],
  },
  {
    id: "privacy",
    number: 18,
    title: "Confidentialité et données personnelles",
    blocks: [
      {
        type: "p",
        text: "HiTako Academy peut collecter et traiter des données personnelles raisonnablement nécessaires pour :",
      },
      {
        type: "ul",
        items: [
          "Inscrire les étudiants",
          "Gérer les comptes",
          "Fournir les services éducatifs",
          "Communiquer avec les étudiants",
          "Traiter les paiements",
          "Suivre l'assiduité et la progression",
          "Réaliser des évaluations",
          "Améliorer les services éducatifs",
          "Maintenir la sécurité de la plateforme",
        ],
      },
      {
        type: "p",
        text: "HiTako Academy traitera les données personnelles conformément à ses pratiques de confidentialité applicables et aux lois en vigueur.",
      },
      {
        type: "p",
        text: "Les étudiants ne doivent pas partager d'informations personnelles sensibles les concernant, ou concernant d'autres personnes, dans des groupes d'apprentissage publics, sauf nécessité.",
      },
    ],
  },
  {
    id: "photos-testimonials",
    number: 19,
    title: "Photos, vidéos et témoignages",
    blocks: [
      {
        type: "p",
        text: "HiTako Academy peut documenter certains cours, événements, activités ou réussites d'étudiants à des fins éducatives ou promotionnelles.",
      },
      {
        type: "p",
        text: "Lorsque des images, vidéos, noms, déclarations ou témoignages identifiables d'étudiants sont destinés à un usage promotionnel public, HiTako Academy sollicitera l'autorisation appropriée lorsque celle-ci est requise.",
      },
      {
        type: "p",
        text: "Un étudiant peut contacter HiTako Academy concernant l'utilisation de son contenu promotionnel identifiable.",
      },
    ],
  },
  {
    id: "no-guaranteed-outcome",
    number: 20,
    title: "Absence de garantie de résultat personnel ou professionnel",
    blocks: [
      {
        type: "p",
        text: "HiTako Academy propose de l'éducation, de la formation, des ressources et un accompagnement.",
      },
      {
        type: "p",
        text: "Cependant, HiTako Academy ne garantit pas que l'achèvement d'un cours entraînera automatiquement :",
      },
      {
        type: "ul",
        items: [
          "Un emploi",
          "Une promotion",
          "Une augmentation de salaire",
          "Une admission dans un établissement",
          "L'obtention d'un visa ou d'une autorisation d'immigration",
          "Des opportunités d'affaires",
          "Un score spécifique de compétence en anglais",
          "Tout autre résultat personnel ou professionnel spécifique",
        ],
      },
      {
        type: "p",
        text: "Les étudiants sont responsables de la mise en application des connaissances et compétences acquises grâce au programme.",
      },
    ],
  },
  {
    id: "third-party-services",
    number: 21,
    title: "Services tiers",
    blocks: [
      {
        type: "p",
        text: "HiTako Academy peut faire appel à des services tiers pour fournir certaines parties de ses services, notamment la communication, la visioconférence, l'hébergement, l'authentification, le traitement des paiements, l'analyse de données ou d'autres fonctions techniques.",
      },
      {
        type: "p",
        text: "Cela peut inclure des plateformes externes utilisées pour la communication ou l'apprentissage en ligne.",
      },
      {
        type: "p",
        text: "HiTako Academy n'est pas responsable des interruptions, défaillances, changements de politique ou problèmes techniques causés exclusivement par des services tiers, bien que des efforts raisonnables puissent être faits pour proposer des alternatives lorsque cela est possible.",
      },
    ],
  },
  {
    id: "suspension-termination",
    number: 22,
    title: "Suspension ou résiliation",
    blocks: [
      {
        type: "p",
        text: "HiTako Academy peut suspendre ou résilier l'accès d'un étudiant lorsque celui-ci :",
      },
      {
        type: "ul",
        items: [
          "Viole gravement les présentes Conditions Générales",
          "Se livre à une activité frauduleuse",
          "Partage un accès non autorisé à son compte",
          "Distribue du matériel de cours protégé",
          "Menace ou harcèle autrui",
          "Perturbe de façon répétée l'environnement d'apprentissage",
          "Ne respecte pas ses obligations de paiement",
          "Utilise la plateforme de manière illégale",
        ],
      },
      {
        type: "p",
        text: "La résiliation résultant d'une violation grave de la part de l'étudiant ne donne pas automatiquement droit à un remboursement.",
      },
    ],
  },
  {
    id: "changes-to-terms",
    number: 23,
    title: "Modifications des programmes et des conditions",
    blocks: [
      {
        type: "p",
        text: "HiTako Academy peut, de temps à autre, mettre à jour ses programmes, prix, calendriers, supports pédagogiques, fonctionnalités de la plateforme ou procédures opérationnelles.",
      },
      {
        type: "p",
        text: "HiTako Academy peut également mettre à jour les présentes Conditions Générales lorsque cela est nécessaire.",
      },
      {
        type: "p",
        text: "La version publiée sur le site officiel de HiTako Academy sera considérée comme la version en vigueur.",
      },
      {
        type: "p",
        text: "Les modifications substantielles concernant les étudiants déjà inscrits seront communiquées lorsque cela sera raisonnablement approprié.",
      },
    ],
  },
  {
    id: "force-majeure",
    number: 24,
    title: "Force majeure",
    blocks: [
      {
        type: "p",
        text: "HiTako Academy ne pourra être tenue responsable d'un manquement ou d'un retard dans la fourniture d'un service causé par des circonstances échappant à son contrôle raisonnable.",
      },
      { type: "p", text: "Ces circonstances peuvent notamment inclure :" },
      {
        type: "ul",
        items: [
          "Les catastrophes naturelles",
          "Les défaillances majeures d'Internet ou de télécommunications",
          "Les coupures d'électricité",
          "Les restrictions gouvernementales",
          "Les urgences publiques",
          "Les troubles civils",
          "Les grèves",
          "Une maladie grave ou l'indisponibilité imprévue de personnel essentiel",
          "Les incidents techniques majeurs",
          "Tout autre événement ne pouvant raisonnablement être ni empêché ni anticipé",
        ],
      },
      {
        type: "p",
        text: "Dans la mesure du possible, HiTako Academy recherchera une solution alternative raisonnable.",
      },
    ],
  },
  {
    id: "limitation-of-responsibility",
    number: 25,
    title: "Limitation de responsabilité",
    blocks: [
      {
        type: "p",
        text: "HiTako Academy mettra tout en œuvre, dans la mesure du raisonnable, pour fournir ses services éducatifs tels que décrits.",
      },
      { type: "p", text: "Cependant, HiTako Academy ne peut garantir que :" },
      {
        type: "ul",
        items: [
          "Le site internet ou la plateforme sera toujours disponible",
          "Chaque fonctionnalité technique fonctionnera sans interruption",
          "Chaque étudiant obtiendra le même résultat d'apprentissage",
          "Les services externes resteront toujours disponibles",
          "Les résultats pédagogiques surviendront dans un délai précis",
        ],
      },
      {
        type: "p",
        text: "Dans la mesure permise par la loi applicable, HiTako Academy n'est pas responsable des pertes indirectes résultant de l'utilisation de ses services éducatifs par un étudiant.",
      },
      {
        type: "p",
        text: "Rien dans les présentes Conditions n'exclut ni ne limite une responsabilité qui ne peut légalement être exclue ou limitée.",
      },
    ],
  },
  {
    id: "complaints-disputes",
    number: 26,
    title: "Réclamations et litiges",
    blocks: [
      {
        type: "p",
        text: "Les étudiants sont encouragés à contacter d'abord HiTako Academy en cas de réclamation, de problème de paiement, de problème technique ou de désaccord.",
      },
      {
        type: "p",
        text: "HiTako Academy s'efforcera, dans la mesure du raisonnable, de résoudre les réclamations légitimes de manière équitable et de bonne foi.",
      },
      {
        type: "p",
        text: "Les étudiants doivent fournir suffisamment d'informations pour permettre l'examen de la situation, y compris les dates concernées, les paiements, des captures d'écran ou tout autre justificatif approprié.",
      },
    ],
  },
  {
    id: "governing-law",
    number: 27,
    title: "Droit applicable",
    blocks: [
      {
        type: "p",
        text: "Les présentes Conditions Générales sont interprétées conformément aux lois applicables à Madagascar, sous réserve de toute protection légale impérative applicable à l'étudiant.",
      },
      {
        type: "p",
        text: "Lorsqu'un litige ne peut être résolu à l'amiable, les tribunaux compétents de Madagascar sont seuls compétents, dans la mesure permise par la loi applicable.",
      },
    ],
  },
  {
    id: "severability",
    number: 28,
    title: "Divisibilité",
    blocks: [
      {
        type: "p",
        text: "Si une disposition des présentes Conditions Générales est jugée invalide, illégale ou inapplicable, les autres dispositions continueront de s'appliquer dans la mesure permise par la loi.",
      },
      {
        type: "p",
        text: "La disposition invalide sera interprétée ou remplacée, dans la mesure légalement possible, d'une manière reflétant le plus fidèlement son objectif initial.",
      },
    ],
  },
  {
    id: "entire-agreement",
    number: 29,
    title: "Intégralité de l'accord",
    blocks: [
      {
        type: "p",
        text: "Les présentes Conditions Générales, ainsi que les conditions spécifiques communiquées pour le programme choisi par l'étudiant et toute politique applicable de HiTako Academy, constituent l'accord régissant la participation de l'étudiant.",
      },
      {
        type: "p",
        text: "Lorsqu'un programme spécifique comporte des conditions écrites différant expressément des présentes Conditions Générales, les conditions spécifiques du programme s'appliquent à cet égard.",
      },
    ],
  },
  {
    id: "contact",
    number: 30,
    title: "Contact",
    blocks: [
      {
        type: "p",
        text: "Pour toute question concernant les présentes Conditions Générales, l'inscription, le paiement, les cours, les comptes ou les services aux étudiants, les étudiants peuvent contacter HiTako Academy via les canaux de contact officiels publiés sur le site internet de HiTako Academy.",
      },
    ],
  },
];

export const TERMS_ACCEPTANCE =
  "En s'inscrivant à un programme de HiTako Academy, en effectuant un paiement, en activant un compte étudiant ou en accédant à du contenu pédagogique payant, l'étudiant confirme avoir eu la possibilité de lire les présentes Conditions Générales et accepte de s'y conformer.";
