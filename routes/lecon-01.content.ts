/**
 * Lesson 01 — Greetings: extracted lesson content.
 *
 * Pulled out of lecon-01.tsx so the exact same phrase data can be imported
 * both by the route (to render the lesson) and by scripts/generate-audio.ts
 * (to know exactly which English phrases need a pre-generated voice clip —
 * see AUDIO_TODO.md after running `bun run audio:build`).
 *
 * This is a pure data extraction: nothing about how the lesson looks or
 * behaves changes, the arrays just live here now instead of inline in the
 * route file.
 */
import type { SpeakerId } from "../lib/pronunciation/types";
import type { ListeningQuestion, ListeningTranscriptLine } from "../components/ListeningActivity";

/* ================================================================
   Pronunciation — speaker → voice mapping
   Dialogue lines carry a speaker key; this maps that key to a
   PronunciationService voice archetype so John and Mr. Smith are heard in
   distinct voices instead of one generic default.
   ================================================================ */
export const SPEAKER_VOICE: Record<"John" | "Teacher", SpeakerId> = {
  John: "young_man",
  Teacher: "man",
};

export const DIALOGUE: { speaker: "John" | "Teacher"; text: string }[] = [
  { speaker: "John", text: "Good morning, Mr. Smith." },
  { speaker: "Teacher", text: "Good morning, John! How are you today?" },
  { speaker: "John", text: "I am fine, thank you. And you?" },
  { speaker: "Teacher", text: "I am doing great. Welcome to the class!" },
];

export const VOCAB: { en: string; mg: string; def: string }[] = [
  { en: "Good morning", mg: "Manao ahoana ianao!", def: "Fiarahabana ampiasaina amin'ny maraina." },
  {
    en: "Good afternoon",
    mg: "Manao ahoana e!",
    def: "Fiarahabana ampiasaina manomboka amin'ny mitataovovonana ka hatramin'ny hariva.",
  },
  {
    en: "Good evening",
    mg: "Manao ahoana e!",
    def: "Fiarahabana ampiasaina rehefa hariva na alina.",
  },
  {
    en: "How are you?",
    mg: "Manao ahoana ianao?",
    def: "Fanontaniana ampiasaina hanontaniana ny fahasalaman'ny olona iray.",
  },
  { en: "I am fine", mg: "Salama tsara aho.", def: "Valinteny milaza fa salama tsara ianao." },
  { en: "Thank you", mg: "Misaotra", def: "Teny fisaorana." },
  {
    en: "And you?",
    mg: "Ary ianao?",
    def: "Fanontaniana entina mamerina izay vao nanontaniana taminao.",
  },
  {
    en: "Welcome",
    mg: "Tongasoa!",
    def: "Teny hiarahabana sy handraisana olona (vahiny) amim-pifaliana.",
  },
];

export const PRONUNCIATION: { en: string; ipa: string }[] = [
  { en: "Good morning", ipa: "/ɡʊd ˈmɔːnɪŋ/" },
  { en: "Good afternoon", ipa: "/ɡʊd ˌɑːftərˈnuːn/" },
  { en: "How are you?", ipa: "/haʊ ɑːr juː/" },
  { en: "I am fine", ipa: "/aɪ æm faɪn/" },
  { en: "Thank you", ipa: "/θæŋk juː/" },
];

/* ================================================================
   Mission phrase bank
   ================================================================ */
export const MISSION_SCENARIOS: { title: string; context: string; phrase: string }[] = [
  {
    title: "Vao mifoha ianao",
    context: "Miarahaba ny ray aman-dreninao ianao amin'ny maraina ary manontany ny fahasalamany.",
    phrase: "Good morning! How are you?",
  },
  {
    title: "Any am-piasana na sekoly",
    context:
      "Misy manontany ny fahasalamanao, dia mamaly ianao sady mamerina ny fanontaniana aminy.",
    phrase: "I am fine, thank you. And you?",
  },
  {
    title: "Fandraisana vahiny",
    context: "Misy vahiny tonga ao an-tranonao ary tianao horaisina am-pifaliana izy.",
    phrase: "Welcome! Come in.",
  },
];

/* ================================================================
   Listening Activity 1 — quick vocabulary check
   Short audio (2–3 sentences) using the lesson's new vocabulary.
   ================================================================ */
export const LISTENING1_TRANSCRIPT: ListeningTranscriptLine[] = [
  { text: "Good morning, everyone!", speaker: "young_man" },
  { text: "How are you today? I am fine, thank you.", speaker: "young_man" },
  { text: "Welcome to the class!", speaker: "young_man" },
];

export const LISTENING1_QUESTIONS: ListeningQuestion[] = [
  {
    question: "What time of day is the speaker greeting people?",
    options: ["Morning", "Afternoon", "Evening", "Night"],
    correct: "Morning",
    explanation: "Nampiasa “Good morning” izy, izay fiarahabana amin'ny maraina.",
  },
  {
    question: "What does the speaker ask?",
    options: ["Where are you?", "How old are you?", "How are you today?", "What is your name?"],
    correct: "How are you today?",
    explanation: "Fanontaniana momba ny fahasalamana no natao.",
  },
  {
    question: "How does the speaker answer his own question?",
    options: ["I am tired.", "I am fine, thank you.", "I am busy.", "I am late."],
    correct: "I am fine, thank you.",
    explanation: "Valinteny mihaja: “I am fine, thank you.”",
  },
  {
    question: "What does he say at the end?",
    options: ["Good night!", "Welcome to the class!", "See you tomorrow!", "Sorry!"],
    correct: "Welcome to the class!",
    explanation: "“Welcome” = tongasoa.",
  },
];

/* ================================================================
   Listening Activity 2 — end-of-lesson comprehension
   Longer natural conversation (~30–60s) that reuses vocabulary + grammar.
   ================================================================ */
export const LISTENING2_TRANSCRIPT: ListeningTranscriptLine[] = [
  { text: "It is Monday morning. John walks into his new classroom.", speaker: "man" },
  { text: "He sees his teacher, Mr. Smith, near the whiteboard.", speaker: "man" },
  { text: "Good morning, Mr. Smith!", speaker: "young_man" },
  { text: "Good morning, John! How are you today?", speaker: "man" },
  { text: "I am fine, thank you. And you?", speaker: "young_man" },
  { text: "I am doing great. Welcome to the class!", speaker: "man" },
  { text: "Thank you, sir. I am very happy to be here.", speaker: "young_man" },
  { text: "Please take a seat next to Anna. She will help you today.", speaker: "man" },
  { text: "Good morning, Anna! Nice to meet you.", speaker: "young_man" },
  { text: "Good morning, John! Welcome — I am glad you are in our class.", speaker: "young_woman" },
];

export const LISTENING2_QUESTIONS: ListeningQuestion[] = [
  {
    question: "What day and time is it?",
    options: ["Sunday evening", "Monday morning", "Friday afternoon", "Tuesday night"],
    correct: "Monday morning",
    explanation: "“It is Monday morning.”",
  },
  {
    question: "Who does John greet first?",
    options: ["His friend Anna", "The principal", "Mr. Smith, his teacher", "A student"],
    correct: "Mr. Smith, his teacher",
    explanation: "Niarahaba an'i Mr. Smith aloha izy.",
  },
  {
    question: "How does John answer “How are you today?”",
    options: ["I am tired, thanks.", "I am fine, thank you. And you?", "Not bad.", "I don't know."],
    correct: "I am fine, thank you. And you?",
    explanation: "Nampiasa ny modely fianarany izy.",
  },
  {
    question: "What does Mr. Smith ask John to do?",
    options: [
      "Stand at the whiteboard.",
      "Take a seat next to Anna.",
      "Leave the class.",
      "Read a book aloud.",
    ],
    correct: "Take a seat next to Anna.",
    explanation: "“Please take a seat next to Anna.”",
  },
  {
    question: "How does Anna welcome John?",
    options: [
      "Hello, who are you?",
      "Good morning, John! Welcome — I am glad you are in our class.",
      "Bye, John!",
      "See you later.",
    ],
    correct: "Good morning, John! Welcome — I am glad you are in our class.",
    explanation: "Fandraisana mafana amin'ny fiarahabana sy fanehoana faliana.",
  },
];
