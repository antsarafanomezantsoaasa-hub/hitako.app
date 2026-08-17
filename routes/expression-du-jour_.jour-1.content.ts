/**
 * Expression du jour — Day 1: "What's Up?" — lesson content.
 *
 * Sourced from the "DAY1_Whats_Up.pptx" deck (HiTako Academy — Expression
 * of the Day, Level: Easy, Category: Casual). Pulled out of
 * expression-du-jour_.jour-1.tsx the same way lecon-demo-18.content.ts pulls
 * its data out of lecon-demo-18.tsx — so the route file only holds layout,
 * and this file only holds copy.
 */
import type { SpeakerId } from "../lib/pronunciation/types";
import type { ListeningQuestion, ListeningTranscriptLine } from "../components/ListeningActivity";

/* ================================================================
   Lesson meta (slide 1)
   ================================================================ */
export const LESSON_META = {
  flag: "🇺🇸",
  day: "Day 1",
  title: "What's Up?",
  level: "Easy",
  category: "Casual",
  intro:
    "Ahoana ny fomba fiarahabana ny namanao amin'ny teny Anglisy? Hianatra ny fomba fiteny « What's up? » sy ny famaliana azy isika androany.",
};

export const SPEAKER_VOICE: Record<"A" | "B", SpeakerId> = {
  A: "young_man",
  B: "young_woman",
};

/* ================================================================
   Listening activity (slide 2)
   ================================================================ */
export const LISTENING_TRANSCRIPT: ListeningTranscriptLine[] = [
  { text: "Hey! What's up?", speaker: SPEAKER_VOICE.A },
  { text: "Not much. How about you?", speaker: SPEAKER_VOICE.B },
  { text: "I'm good. Just getting ready for work.", speaker: SPEAKER_VOICE.A },
];

export const LISTENING_QUESTIONS: ListeningQuestion[] = [
  {
    question: "Inona no nolazain'ilay olona? — What did the person say?",
    options: ["What are you doing?", "What's up?", "Where are you going?"],
    correct: "What's up?",
    explanation: "Nanontany hoe “Hey! What's up?” izy — fanontaniana fiarahabana tsotra.",
  },
];

/* ================================================================
   Pattern breakdown (slide 3)
   ================================================================ */
export const PATTERN = {
  short: "Sup?",
  full: "What's up?",
  meanings: ["Manao ahoana?", "Inona no vaovao?"],
  explanation:
    "« What's up? » dia fomba fiteny tena fahita amin'ny Amerikanina rehefa miarahaba olona, indrindra raha namana, mpiara-miasa akaiky, na olona efa fantatra. Tsy midika ara-bakiteny hoe « Inona no any ambony? » fa manao ahoana, inona no vaovao, na ahoana ny fandehan-javatra.",
  reduction: ["What's up?", "Wassup?", "Sup?"],
  reductionNote:
    "Ny « Sup? » no endrika tena fohy sy tena casual. Matetika ampiasain'ny namana na olona mitovy taona.",
  tags: ["Casual / Informal", "Reduction + Connected Speech"],
};

/* ================================================================
   Pronunciation (slide 4)
   ================================================================ */
export const PRONUNCIATION = {
  ipa: "/wʌts ʌp/",
  easy: "wuts-uhp?  /  wuss-up?",
  reps: ["What's up?", "Wassup?", "Sup?"],
  connected: { wrong: "What — is — up?", right: "What's-up?" },
  tips: [
    "« What's »: ataovy fohy, toy ny wuts na wuss",
    "« up »: feo fohy hoe uhp, fa tsy ooup",
    "Ampifandraiso: What's-up?",
    "Aza atao miadana be ny teny tsirairay.",
  ],
};

/* ================================================================
   How to respond (slides 5–6)
   ================================================================ */
export const RESPONSES: { en: string; promptEn: string; mg: string }[] = [
  { en: "Not much.", promptEn: "A: What's up?\nB: Not much.", mg: "Tsy dia misy vaovao." },
  {
    en: "I'm good.",
    promptEn: "A: What's up?\nB: I'm good. How about you?",
    mg: "Tsara aho.",
  },
  {
    en: "Nothing much.",
    promptEn: "A: Sup?\nB: Nothing much.",
    mg: "Tsy dia misy loatra.",
  },
  {
    en: "I'm doing great.",
    promptEn: "A: Hey, what's up?\nB: I'm doing great!",
    mg: "Tena tsara ny fahasalamako.",
  },
  {
    en: "Just working.",
    promptEn: "A: What's up?\nB: Just working.",
    mg: "Miasa fotsiny e.",
  },
  {
    en: "Just studying.",
    promptEn: "A: Sup?\nB: Just studying. How about you?",
    mg: "Mianatra fotsiny e.",
  },
  {
    en: "A lot, actually!",
    promptEn: "A: What's up?\nB: A lot, actually! I started a new job.",
    mg: "Be dia be, raha ny marina!",
  },
];

export const RESPONSES_NOTE =
  "« What's up? » dia tsy voatery mila valiny lava. Matetika ny valiny fohy dia ampy: Not much. / I'm good. / Nothing much. / Just relaxing. Ary afaka mamaly amin'ny fanontaniana mitovy ianao: « How about you? » (Ary ianao?)";

/* ================================================================
   Real-life examples (slide 7)
   ================================================================ */
export const EXAMPLES: { title: string; lines: string[]; mg: string[] }[] = [
  {
    title: "Namana eny an-dalana",
    lines: [
      "A: Hey, what's up?",
      "B: Not much. I'm heading home. How about you?",
      "A: I'm going to grab some food.",
    ],
    mg: [
      "A: Aiza e! Inona no vaovao?",
      "B: Tsy misy e. Handeha hody aho io. Ary ianao?",
      "A: Handeha hividy sakafo aho.",
    ],
  },
  {
    title: "Ao amin'ny chat",
    lines: ["A: Sup?", "B: Nothing much. Just watching a movie.", "A: Nice! What movie?"],
    mg: ["A: Kaiza e!", "B: Zao fotsiny e. Mijery film ato aho.", "A: Film inona?"],
  },
  {
    title: "Rehefa avy niasa",
    lines: [
      "A: Hey, what's up?",
      "B: I'm exhausted. I just got home.",
      "A: You should get some rest.",
    ],
    mg: [
      "A: Hey, inona no vaovao?",
      "B: Reraka be aho. Vao tonga ato an-trano.",
      "A: Tokony haka aina kely ianao.",
    ],
  },
  {
    title: "Resaka amin'ny mpiara-mianatra",
    lines: ["A: What's up?", "B: I'm studying for tomorrow's test.", "A: Good luck!"],
    mg: ["A: Dia ahoana?", "B: Mianatra ho an'ny fanadinana rahampitso aho.", "A: Mirary soa ary!"],
  },
];

/* ================================================================
   When NOT to use it (slide 8)
   ================================================================ */
export const AVOID_CONTEXTS = [
  "Rehefa miresaka amin'ny tale voalohany",
  "Amin'ny interview",
  "Amin'ny taratasy ofisialy",
  "Amin'ny olona hajaina be nefa mbola tsy fantatrao",
];

export const FORMAL_ALTERNATIVES = [
  "How are you?",
  "How are you doing?",
  "Good morning. How are you today?",
];

/* ================================================================
   Mini practice (slide 9) — reworked as a graded multiple-choice
   exercise (the deck itself just reveals the answer; options below are
   drawn from the other response phrases in this same lesson so the
   quiz stays self-contained).
   ================================================================ */
export const PRACTICE_QUESTIONS: {
  promptBefore: string;
  promptAfter: string;
  options: string[];
  correct: string;
}[] = [
  {
    promptBefore: "A: Hey, what's up?\nB: ",
    promptAfter: ". I'm just relaxing.",
    options: ["Not much", "A lot, actually", "Just working"],
    correct: "Not much",
  },
  {
    promptBefore: "A: Sup?\nB: ",
    promptAfter: ". How about you?",
    options: ["Nothing much", "I'm good", "Just studying"],
    correct: "Nothing much",
  },
  {
    promptBefore: "A: What's up?\nB: ",
    promptAfter: ". I'm studying English.",
    options: ["I'm doing great", "Not much", "Just studying"],
    correct: "Not much",
  },
];

/* ================================================================
   Speaking challenge (slide 10)
   ================================================================ */
export const SPEAKING_LINES = [
  "What's up?",
  "Not much. How about you?",
  "I'm good.",
  "Just studying English.",
  "Sup? Nothing much.",
];

export const SELF_CHECK = [
  "Mifandray tsara ny What's sy up",
  "Tsy manonona miadana loatra",
  "Mazava ny feo up",
  "Misy fiakarana kely ny feo rehefa fanontaniana",
];

export const PRO_TIP =
  "Amerikanina rehefa miteny haingana dia toy ny teny iray monja ny « What's up? ». Ataovy malefaka ny « t » ary fohy ny « up ». Aza atao mitokana loatra ny teny tsirairay.";

/* ================================================================
   Quick review (slide 11)
   ================================================================ */
export const REVIEW_PAIRS: { en: string; mg: string }[] = [
  { en: "What's up?", mg: "Manao ahoana? / Inona no vaovao?" },
  { en: "Sup?", mg: "Kaiza e! — tena casual" },
  { en: "Not much.", mg: "Tsy dia misy vaovao e." },
  { en: "Nothing much.", mg: "Tsy misy ambara loatra." },
  { en: "I'm good.", mg: "Tsara aho." },
  { en: "How about you?", mg: "Ary ianao?" },
  { en: "Just working.", mg: "Miasa fotsiny e." },
  { en: "Just studying.", mg: "Mianatra fotsiny e." },
];