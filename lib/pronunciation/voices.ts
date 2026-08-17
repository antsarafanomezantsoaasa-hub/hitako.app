/**
 * Speaker → voice resolution.
 *
 * Lesson content only ever says *who* is talking ("young_man", "narrator",
 * ...). This file turns that into a concrete `VoiceProfile`: a gender, a
 * pitch/rate tuning, and a `remoteVoiceId` a future cloud provider can use.
 */
import type { SpeakerId, VoiceGender, VoiceProfile } from "./types";

const DEFAULT_LANG = "en-US";
const DEFAULT_RATE = 0.92;

interface SpeakerPreset {
  gender: VoiceGender;
  pitch: number;
  rateMultiplier: number;
  /**
   * Placeholder id for a cloud voice catalog. When a real provider is wired
   * up (see providers/remoteTtsProvider.ts), point these at that vendor's
   * actual voice names.
   */
  remoteVoiceId: string;
}

const SPEAKER_PRESETS: Record<SpeakerId, SpeakerPreset> = {
  narrator: {
    gender: "neutral",
    pitch: 1.0,
    rateMultiplier: 1.0,
    remoteVoiceId: "narrator-neutral",
  },
  young_man: { gender: "male", pitch: 0.94, rateMultiplier: 1.02, remoteVoiceId: "young-male-01" },
  young_woman: {
    gender: "female",
    pitch: 1.12,
    rateMultiplier: 1.0,
    remoteVoiceId: "young-female-01",
  },
  man: { gender: "male", pitch: 0.82, rateMultiplier: 0.97, remoteVoiceId: "adult-male-01" },
  woman: { gender: "female", pitch: 1.05, rateMultiplier: 0.98, remoteVoiceId: "adult-female-01" },
  child: { gender: "neutral", pitch: 1.3, rateMultiplier: 1.08, remoteVoiceId: "child-01" },
};

/** Resolve lesson-facing options into a concrete voice profile. */
export function resolveVoice(
  speaker: SpeakerId = "narrator",
  lang = DEFAULT_LANG,
  rate = DEFAULT_RATE,
): VoiceProfile {
  const preset = SPEAKER_PRESETS[speaker] ?? SPEAKER_PRESETS.narrator;
  return {
    speaker,
    gender: preset.gender,
    lang,
    rate: rate * preset.rateMultiplier,
    pitch: preset.pitch,
    remoteVoiceId: preset.remoteVoiceId,
  };
}

/* ------------------------------------------------------------------ *
 * Web Speech voice picking
 *
 * `speechSynthesis.getVoices()` loads asynchronously and its contents
 * differ per browser/OS, so we can't hardcode a voice name. Instead we
 * score the available voices against the language + gender we want and
 * cache the winner per (lang, gender) pair for the rest of the session.
 * ------------------------------------------------------------------ */

const FEMALE_HINTS = [
  "female",
  "woman",
  "girl",
  "aria",
  "jenny",
  "samantha",
  "zira",
  "susan",
  "victoria",
  "karen",
  "moira",
  "tessa",
  "fiona",
  "natural",
];
const MALE_HINTS = [
  "male",
  "man",
  "guy",
  "daniel",
  "david",
  "mark",
  "alex",
  "fred",
  "arthur",
  "ryan",
  "thomas",
];

let cachedVoiceList: SpeechSynthesisVoice[] | null = null;
const resolvedVoiceCache = new Map<string, SpeechSynthesisVoice | null>();

function getVoiceList(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const list = window.speechSynthesis.getVoices();
  if (list.length > 0) cachedVoiceList = list;
  return cachedVoiceList ?? list;
}

function scoreVoice(voice: SpeechSynthesisVoice, lang: string, gender: VoiceGender): number {
  let score = 0;
  const name = voice.name.toLowerCase();
  const voiceLang = voice.lang.toLowerCase();
  const targetLang = lang.toLowerCase();

  if (voiceLang === targetLang) score += 10;
  else if (voiceLang.split("-")[0] === targetLang.split("-")[0]) score += 5;
  else return -1; // wrong language entirely — never pick it

  if (gender !== "neutral") {
    const hints = gender === "female" ? FEMALE_HINTS : MALE_HINTS;
    const oppositeHints = gender === "female" ? MALE_HINTS : FEMALE_HINTS;
    if (hints.some((h) => name.includes(h))) score += 4;
    if (oppositeHints.some((h) => name.includes(h))) score -= 4;
  }

  // Prefer higher-quality on-device neural/online voices when available.
  if (name.includes("natural") || name.includes("neural") || name.includes("online")) score += 3;
  if (voice.localService) score += 1; // works offline

  return score;
}

/**
 * Best-effort match for a Web Speech voice given a language + gender.
 * Returns `null` if no voice for that language exists at all (the browser
 * will then fall back to its own default voice).
 */
export function pickWebSpeechVoice(lang: string, gender: VoiceGender): SpeechSynthesisVoice | null {
  const cacheKey = `${lang}::${gender}`;
  if (resolvedVoiceCache.has(cacheKey)) return resolvedVoiceCache.get(cacheKey) ?? null;

  const voices = getVoiceList();
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;
  for (const voice of voices) {
    const score = scoreVoice(voice, lang, gender);
    if (score > bestScore) {
      bestScore = score;
      best = voice;
    }
  }

  // Only cache once the voice list has actually loaded — on first page load
  // getVoices() can briefly return an empty array before the `voiceschanged`
  // event fires.
  if (voices.length > 0) resolvedVoiceCache.set(cacheKey, best);
  return best;
}
