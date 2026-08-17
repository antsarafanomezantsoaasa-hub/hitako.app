/**
 * Lesson 02 — Do You Understand English?: extracted lesson content.
 *
 * Same split as lecon-01.content.ts (see that file's header): the phrase
 * data lives here so both the route (to render the lesson) and
 * scripts/generate-audio.ts (to know which English phrases need a
 * pre-generated voice clip) can import the exact same arrays.
 *
 * Story cast for this lesson: Toky (the learner) meets Mr. John (the
 * American visitor) for the very first time — this is the scene that
 * introduces him into the ongoing story. Aina (Toky's best friend) is the
 * one who encourages Toky to go speak to him; she appears in the inline
 * STORY/CULTURE_TIP copy in lecon-02.tsx and in LISTENING2 below, but
 * doesn't have dialogue lines of her own in the core DIALOGUE step.
 *
 * Voice-casting note: Toky's gender is confirmed as female in the script
 * ("her family's stall", "She sees..."), so the role has been mapped to
 * "young_woman".
 */
import type { SpeakerId } from "../lib/pronunciation/types";
import type { ListeningQuestion, ListeningTranscriptLine } from "../components/ListeningActivity";

/* ================================================================
   Pronunciation — speaker → voice mapping
   ================================================================ */
export const SPEAKER_VOICE: Record<"Toky" | "John", SpeakerId> = {
  Toky: "young_woman",
  John: "man",
};

export const DIALOGUE: { speaker: "Toky" | "John"; text: string }[] = [
  { speaker: "Toky", text: "Excuse me. Do you understand English?" },
  { speaker: "John", text: "Yes, I do! Do you speak English too?" },
  { speaker: "Toky", text: "A little. I am learning." },
  { speaker: "John", text: "That's great! My name is John. What is your name?" },
  { speaker: "Toky", text: "My name is Toky. Nice to meet you." },
  { speaker: "John", text: "Nice to meet you too, Toky." },
];

export const VOCAB: { en: string; mg: string; def: string }[] = [
  {
    en: "Excuse me",
    mg: "Azafady",
    def: "Fomba fiteny am-panajana ampiasaina alohan'ny hanatonana na hiresahana amin'olona.",
  },
  {
    en: "Do you understand English?",
    mg: "Mahazo teny Anglisy ve ianao?",
    def: "Fanontaniana am-panajana hahafantarana raha mahazo teny Anglisy ilay olona.",
  },
  {
    en: "Yes, I do.",
    mg: "Eny, azoko.",
    def: "Valiny milaza fa mahazo teny Anglisy ianao.",
  },
  {
    en: "No, I don't.",
    mg: "Tsia, tsy azoko.",
    def: "Valiny milaza fa tsy mahazo teny Anglisy ianao.",
  },
  {
    en: "A little",
    mg: "Kely",
    def: "Ampiasaina rehefa mbola mahay kely fotsiny ilay fiteny ianao.",
  },
  {
    en: "I am learning English.",
    mg: "Mianatra teny Anglisy aho.",
    def: "Milaza fa mbola eo am-pianarana teny Anglisy ianao.",
  },
  {
    en: "Could you repeat that, please?",
    mg: "Afaka averinao ve ilay izy teo, azafady?",
    def: "Fomba am-panajana hangatahana olona hamerina izay nolazainy.",
  },
  {
    en: "Nice to meet you",
    mg: "Faly mahafantatra anao aho",
    def: "Lazaina rehefa mifankahita voalohany amin'olona iray.",
  },
];

export const PRONUNCIATION: { en: string; ipa: string }[] = [
  { en: "Excuse me", ipa: "/ɪkˈskjuːz miː/" },
  { en: "Do you understand English?", ipa: "/duː juː ˌʌndərˈstænd ˈɪŋɡlɪʃ/" },
  { en: "A little", ipa: "/ə ˈlɪtəl/" },
  { en: "Could you repeat that, please?", ipa: "/kʊd juː rɪˈpiːt ðæt pliːz/" },
  { en: "Nice to meet you", ipa: "/naɪs tə miːt juː/" },
];

/* ================================================================
   Mission phrase bank
   ================================================================ */
export const MISSION_SCENARIOS: { title: string; context: string; phrase: string }[] = [
  {
    title: "Mihaona amin'ny vahiny",
    context:
      "Misy vahiny tsy fantatrao miditra ao amin'ny toeram-piasanao ary te-hiresaka aminao izy. Alohan'ny hanohizanao amin'ny teny Anglisy, ataovy am-panajana ny fanontaniana.",
    phrase: "Excuse me. Do you understand English?",
  },
  {
    title: "Any an-tsena",
    context:
      "Misy mpividy vahiny miresaka aminao, ary tsy azonao tsara ny teniny. Angataho aminy am-panajana mba hamerina ny teniny.",
    phrase: "Could you repeat that, please?",
  },
  {
    title: "Fifankahalalana voalohany",
    context:
      "Vao avy nahazo valiny mazava tamin'ny fanontanianao ianao, ary tianao hampahafantarina ny anaranao sy hifankahalala amin'ilay olona.",
    phrase: "Nice to meet you",
  },
];

/* ================================================================
   Listening Activity 1 — quick vocabulary check
   ================================================================ */
export const LISTENING1_TRANSCRIPT: ListeningTranscriptLine[] = [
  { text: "Excuse me. Do you understand English?", speaker: "young_woman" },
  { text: "Yes, I do. Nice to meet you!", speaker: "man" },
];

export const LISTENING1_QUESTIONS: ListeningQuestion[] = [
  {
    question: "What does the speaker say first?",
    options: [
      "Good morning!",
      "Excuse me. Do you understand English?",
      "Where are you from?",
      "Goodbye!",
    ],
    correct: "Excuse me. Do you understand English?",
    explanation:
      "Io no fanontaniana am-panajana ampiasaina alohan'ny hiresahana amin'olona tsy fantatra.",
  },
  {
    question: "How does the other person answer?",
    options: ["No, I don't.", "Yes, I do.", "I don't know.", "Maybe."],
    correct: "Yes, I do.",
    explanation: "“Yes, I do.” dia midika hoe mahazo ny teny Anglisy izy.",
  },
  {
    question: "What does the man say at the end?",
    options: ["Goodbye!", "Nice to meet you!", "See you later!", "I am busy."],
    correct: "Nice to meet you!",
    explanation: "Fehezanteny ilazana fa faly mahafantatra ny olona iray.",
  },
  {
    question: "Is the speaker polite when asking the question?",
    options: [
      "Yes, because she says “Excuse me” first.",
      "No, she is rude.",
      "She doesn't say anything first.",
      "She shouts loudly.",
    ],
    correct: "Yes, because she says “Excuse me” first.",
    explanation: "Ny fanaovana “Excuse me” aloha dia mariky ny fanajana.",
  },
];

/* ================================================================
   Listening Activity 2 — end-of-lesson comprehension
   ================================================================ */
export const LISTENING2_TRANSCRIPT: ListeningTranscriptLine[] = [
  {
    text: "It is Saturday afternoon. Toky is helping at her family's stall near the market.",
    speaker: "man",
  },
  { text: "She sees a foreign man standing nearby, looking at a small notebook.", speaker: "man" },
  { text: "Look, Toky! Maybe he needs help. Go and talk to him!", speaker: "young_woman" },
  { text: "Toky feels nervous, but she walks over and smiles.", speaker: "man" },
  { text: "Excuse me. Do you understand English?", speaker: "young_woman" },
  { text: "Yes, I do! Do you speak English too?", speaker: "man" },
  { text: "A little. I am learning.", speaker: "young_woman" },
  { text: "That's great! My name is John. What is your name?", speaker: "man" },
  { text: "My name is Toky. Nice to meet you.", speaker: "young_woman" },
  { text: "Nice to meet you too, Toky. I am visiting Madagascar for work.", speaker: "man" },
];

export const LISTENING2_QUESTIONS: ListeningQuestion[] = [
  {
    question: "What day and time is it?",
    options: ["Sunday morning", "Saturday afternoon", "Friday evening", "Monday night"],
    correct: "Saturday afternoon",
    explanation: "“It is Saturday afternoon.”",
  },
  {
    question: "Where is Toky when she meets John?",
    options: ["At school", "Near the market, at her family's stall", "At the airport", "At home"],
    correct: "Near the market, at her family's stall",
    explanation: "Manampy ao amin'ny tsenan'ny fianakaviany akaikin'ny tsena izy.",
  },
  {
    question: "Who encourages Toky to talk to the foreigner?",
    options: ["Her teacher", "Aina, her best friend", "Mr. Smith", "Nobody"],
    correct: "Aina, her best friend",
    explanation: "I Aina no nandrisika an'i Toky hiresaka aminy.",
  },
  {
    question: "What does Toky ask John first?",
    options: [
      "What is your name?",
      "Where are you from?",
      "Excuse me. Do you understand English?",
      "How old are you?",
    ],
    correct: "Excuse me. Do you understand English?",
    explanation: "Io no fanontaniana am-panajana nampiasainy voalohany.",
  },
  {
    question: "Why is John in Madagascar?",
    options: [
      "He is on vacation.",
      "He is visiting for work.",
      "He lives there.",
      "He is a student.",
    ],
    correct: "He is visiting for work.",
    explanation: "Nilaza i John fa tonga niasa tany Madagasikara izy.",
  },
];
