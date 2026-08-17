/**
 * HiTCards — flashcard deck content (first playable game of /jeux).
 *
 * The deck is built on the free demo lesson (Lesson 18 — "Asking for Help"),
 * so a learner who just finished /lecon-demo-18 immediately recognises every
 * card. The six core words come straight from that lesson's VOCAB array
 * (imported, never duplicated, so the lesson stays the single source of
 * truth); the extra cards below are the natural sentences from the same
 * lesson's dialogue and mission bank.
 *
 * Card orientation (per product spec): FRONT = Malagasy, BACK = the natural
 * English translation. `en` is also what the 🔊 button speaks, so it must
 * always be plain, speakable English.
 */
import type { SpeakerId } from "../lib/pronunciation/types";
import { VOCAB } from "./lecon-demo-18.content";

export interface FlashCard {
  id: string;
  /** Front of the card — Malagasy. */
  mg: string;
  /** Back of the card — natural English translation (also spoken by 🔊). */
  en: string;
  /** Optional extra nuance shown under the English on the back. */
  hint?: string;
  speaker?: SpeakerId;
}

/**
 * The six core words of Lesson 18, flipped to Malagasy-first.
 *
 * No `speaker` here on purpose: the lesson page itself plays these exact
 * words with the default narrator voice (see the VOCAB PronunciationButton
 * in lecon-demo-18.tsx, which passes no `speaker`), and that's what
 * `scripts/generate-audio.ts` pre-generated a clip for. Setting a different
 * speaker changes the pronunciation cache key, so the card would miss the
 * pre-generated audio and fall back to the browser's own TTS instead.
 */
const CORE_CARDS: FlashCard[] = VOCAB.map((v, i) => ({
  id: `vocab-${i}`,
  mg: v.mg,
  en: v.en,
  hint: v.def,
}));

/** Natural sentences reused from the Lesson 18 dialogue + mission bank. */
const PHRASE_CARDS: FlashCard[] = [
  {
    id: "phrase-1",
    mg: "Te hividy tapakila mankany an-tanàna aho.",
    en: "I want to buy a ticket to the city.",
    speaker: "young_woman",
  },
  {
    id: "phrase-2",
    mg: "Tsy haiko ny fampiasana ity milina ity.",
    en: "I don't know how to use this machine.",
    speaker: "young_woman",
  },
  { id: "phrase-3", mg: "Mazava ho azy!", en: "Of course!", speaker: "man" },
  { id: "phrase-4", mg: "Inona no ilainao?", en: "What do you need?", speaker: "man" },
  { id: "phrase-5", mg: "Tsy maninona.", en: "No problem.", speaker: "man" },
  { id: "phrase-6", mg: "Avelao aho hanoro anao.", en: "Let me show you.", speaker: "man" },
  {
    id: "phrase-7",
    mg: "Azafady, aiza ny fiantsonan'ny taxi be?",
    en: "Excuse me, where is the bus stop?",
    speaker: "young_woman",
  },
  {
    id: "phrase-8",
    mg: "Azafady, aiza ny efitrano fidiovana?",
    en: "Excuse me, where are the restrooms?",
    speaker: "young_woman",
  },
  {
    id: "phrase-9",
    mg: "Misaotra betsaka! Tena tsara fanahy ianao.",
    en: "Thank you so much! You are very kind.",
    speaker: "young_woman",
  },
  { id: "phrase-10", mg: "Tsy misy fisaorana.", en: "You're welcome.", speaker: "man" },
];

export const FLASHCARDS: FlashCard[] = [...CORE_CARDS, ...PHRASE_CARDS];

/** Shown above the deck so learners know where the words come from. */
export const DECK_META = {
  title: "HiTCards",
  deckName: "Lesona 18 — Asking for Help",
  intro:
    "Hita eo anoloana ny teny malagasy. Eritrereto ny teny anglisy mifanaraka aminy, avy eo tsindrio ny karatra hamadika azy.",
  xpPerCard: 10,
};
