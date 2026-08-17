/**
 * Lesson 18 (free demo) — Asking for Help: extracted lesson content.
 *
 * Pulled out of lecon-demo-18.tsx so the exact same phrase data can be
 * imported both by the route (to render the lesson) and by
 * scripts/generate-audio.ts (to know exactly which English phrases need a
 * pre-generated voice clip — see AUDIO_TODO.md after running
 * `bun run audio:build`).
 *
 * This is a pure data extraction: nothing about how the lesson looks or
 * behaves changes, the arrays just live here now instead of inline in the
 * route file.
 */
import type { SpeakerId } from "../lib/pronunciation/types";
import type { ListeningQuestion, ListeningTranscriptLine } from "../components/ListeningActivity";

/* ================================================================
   Pronunciation — speaker → voice mapping (see PronunciationButton /
   lib/pronunciation). Emma and the station worker get distinct voices.
   ================================================================ */
export const SPEAKER_VOICE: Record<"Emma" | "Worker", SpeakerId> = {
  Emma: "young_woman",
  Worker: "man",
};

export const DIALOGUE: { speaker: "Emma" | "Worker"; text: string }[] = [
  { speaker: "Emma", text: "Excuse me, could you please help me?" },
  { speaker: "Worker", text: "Of course! What do you need?" },
  {
    speaker: "Emma",
    text: "I want to buy a ticket to the city, but I don't know how to use this machine.",
  },
  { speaker: "Worker", text: "No problem. Let me show you." },
];

export const VOCAB: { en: string; mg: string; def: string }[] = [
  {
    en: "Excuse me",
    mg: "Azafady",
    def: "Ampiasaina rehefa te hanintona ny sain'olona amim-panajana.",
  },
  {
    en: "Could you please help me?",
    mg: "Mba afaka manampy ahy ve ianao, azafady?",
    def: "Fomba mihaja hangatahana fanampiana.",
  },
  {
    en: "Ticket",
    mg: "Tapakila",
    def: "Taratasy na karatra ahafahana mandeha na miditra amin'ny toerana iray.",
  },
  { en: "Machine", mg: "Milina", def: "Fitaovana elektronika manao asa iray voafaritra." },
  {
    en: "Show",
    mg: "Manoro / Mampiseho",
    def: "Manoro na mampiseho ny fomba fanaovana zavatra iray.",
  },
  { en: "Thank you", mg: "Misaotra", def: "Teny fisaorana." },
];

export const PRONUNCIATION: { en: string; ipa: string }[] = [
  { en: "Excuse me", ipa: "/ɪkˈskjuːz miː/" },
  { en: "Could you please help me?", ipa: "/kʊd juː pliːz help miː/" },
  { en: "I want to buy a ticket", ipa: "/aɪ wɒnt tuː baɪ ə ˈtɪkɪt/" },
  { en: "How do I use this machine?", ipa: "/haʊ duː aɪ juːz ðɪs məˈʃiːn/" },
];

/* ================================================================
   Mission phrase bank
   ================================================================ */
export const MISSION_SCENARIOS: { title: string; context: string; phrase: string }[] = [
  {
    title: "Amin'ny tanàna vaovao",
    context:
      "Vao tonga tamina tanàna vaovao iray ianao ary mitady ny fiantsonan'ny taxi be akaiky indrindra.",
    phrase: "Excuse me, could you please tell me where the bus stop is?",
  },
  {
    title: "Ao anaty toeram-pivarotana lehibe (mall)",
    context:
      "Very ianao ao anaty toeram-pivarotana lehibe ary mitady ny toeram-pivoahana (toilette).",
    phrase: "Excuse me, could you please tell me where the restrooms are?",
  },
  {
    title: "Eny amin'ny fiantsonan'ny taxi be",
    context:
      "Miandry taxi be ianao ary te hahafantatra ny fotoana hahatongavan'ny taxi be manaraka mankany afovoan-tanàna.",
    phrase: "Excuse me, could you please tell me when the next bus to downtown is?",
  },
  {
    title: "Ao amin'ny efitrano fandraisam-bahiny (lobby)",
    context: "Mila fanampiana amin'ny fitondrana ny entanao ianao.",
    phrase: "Excuse me, can you please help me with my bags?",
  },
];

/* ================================================================
   Listening Activity 1 — quick vocabulary check
   Short (2–3 sentences) built from the lesson's new vocabulary.
   ================================================================ */
export const LISTENING1_TRANSCRIPT: ListeningTranscriptLine[] = [
  { text: "Excuse me, could you please help me?", speaker: "young_woman" },
  {
    text: "I want to buy a ticket, but I don't know how to use this machine.",
    speaker: "young_woman",
  },
  { text: "Thank you for showing me!", speaker: "young_woman" },
];

export const LISTENING1_QUESTIONS: ListeningQuestion[] = [
  {
    question: "What does the speaker want to buy?",
    options: ["A ticket", "A machine", "A phone", "A map"],
    correct: "A ticket",
    explanation: "Nolazainy hoe: “I want to buy a ticket.”",
  },
  {
    question: "How does she ask for help?",
    options: [
      "Give me help now.",
      "Excuse me, could you please help me?",
      "Hey, help!",
      "Please buy this.",
    ],
    correct: "Excuse me, could you please help me?",
    explanation: "Mihaja izy: nampiasa “Excuse me” sy “could you please…”.",
  },
  {
    question: "What does she not know how to use?",
    options: ["The machine", "The map", "The phone", "The door"],
    correct: "The machine",
    explanation: "“I don't know how to use this machine.”",
  },
  {
    question: "What does she say at the end?",
    options: ["Sorry", "Goodbye", "Thank you", "Please"],
    correct: "Thank you",
    explanation: "Nisaotra izy noho ny fanampiana natao: “Thank you for showing me!”.",
  },
];

/* ================================================================
   Listening Activity 2 — end-of-lesson comprehension
   Longer (~30–60s) natural conversation reusing the whole lesson.
   ================================================================ */
export const LISTENING2_TRANSCRIPT: ListeningTranscriptLine[] = [
  {
    text: "Emma is at the train station. She wants to travel to the city, but the ticket machine looks complicated.",
    speaker: "man",
  },
  { text: "She sees a station worker and walks over to him.", speaker: "man" },
  {
    text: "Excuse me, could you please help me? I want to buy a ticket to the city.",
    speaker: "young_woman",
  },
  { text: "Of course! What kind of ticket do you need — a single or a return?", speaker: "man" },
  {
    text: "A single ticket, please. I don't know how to use this machine.",
    speaker: "young_woman",
  },
  {
    text: "No problem. Let me show you. First, choose your destination on the screen.",
    speaker: "man",
  },
  {
    text: "Then pay with a card or with cash, and the machine will print your ticket.",
    speaker: "man",
  },
  { text: "Thank you so much! You are very kind.", speaker: "young_woman" },
  { text: "You're welcome. Have a nice trip!", speaker: "man" },
];

export const LISTENING2_QUESTIONS: ListeningQuestion[] = [
  {
    question: "Where is Emma?",
    options: ["At the airport", "At the train station", "At school", "At the bus stop"],
    correct: "At the train station",
    explanation: "“Emma is at the train station.”",
  },
  {
    question: "Why does she ask for help?",
    options: [
      "She lost her ticket.",
      "She doesn't know how to use the ticket machine.",
      "She missed her train.",
      "She can't find her friend.",
    ],
    correct: "She doesn't know how to use the ticket machine.",
    explanation: "Ny milina fivarotana tapakila no tsy hainy ampiasaina.",
  },
  {
    question: "What kind of ticket does she buy?",
    options: ["A single ticket", "A return ticket", "A monthly pass", "A group ticket"],
    correct: "A single ticket",
    explanation: "Nangataka “a single ticket” izy.",
  },
  {
    question: "What is the first step the worker explains?",
    options: [
      "Pay with cash immediately.",
      "Print the ticket.",
      "Choose your destination on the screen.",
      "Call customer service.",
    ],
    correct: "Choose your destination on the screen.",
    explanation: "“First, choose your destination on the screen.”",
  },
  {
    question: "How does Emma thank the worker?",
    options: ["Thanks, bye!", "Thank you so much! You are very kind.", "Nothing.", "OK, see you."],
    correct: "Thank you so much! You are very kind.",
    explanation: "Nampiasa fisaorana mihaja sy mafana izy.",
  },
];
