/**
 * scripts/generate-audio-offline-fallback.ts
 * ============================================
 * Fills in whatever `bun run audio:audit` reports as "still missing" in
 * AUDIO_TODO.md, using the OS-local `espeak-ng` engine instead of Azure.
 *
 * Why this exists: `scripts/generate-audio.ts` only has two modes — call
 * Azure (needs `AZURE_SPEECH_KEY`, a paid/metered cloud account) or audit
 * or (no network calls, just reports gaps). Neither helps if you want a
 * clip on disk *today* and don't have an Azure key handy yet. This script
 * is a third, offline option: it synthesizes the missing phrases locally
 * with `espeak-ng` (free, no account, no network) and drops each clip at
 * the *exact* path `generate-audio.ts` expects, so a follow-up
 * `bun run audio:audit` (or `audio:build`) picks them up into the manifest
 * with zero other changes.
 *
 * Quality trade-off: espeak-ng is a formant/robotic synthesizer, clearly
 * lower quality than Azure's neural voices. Treat its output as a
 * temporary stand-in, not a final asset — good enough that a card is never
 * silent or stuck on the browser's own inconsistent Web Speech voice, but
 * worth upgrading once a real Azure key is available.
 *
 * IMPORTANT — replacing a placeholder later: `generate-audio.ts` skips any
 * phrase whose expected file already exists on disk (see its `fileExists`
 * check), Azure key or not. So swapping an espeak placeholder for a real
 * Azure clip later means: delete that specific file under
 * `public/audio/**` first, *then* run `bun run audio:build` — otherwise
 * the script will see the file is "already there" and leave it alone.
 *
 * Requires `espeak-ng` and `ffmpeg` on PATH (both free/open-source; on
 * Debian/Ubuntu: `apt-get install espeak-ng ffmpeg`). Makes no network
 * calls of any kind.
 *
 * Usage:
 *   npx tsx scripts/generate-audio-offline-fallback.ts
 *   (then) npx tsx scripts/generate-audio.ts --audit   # fold into manifest
 */
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { resolveVoice } from "../src/lib/pronunciation/voices";
import { buildCacheKey } from "../src/lib/pronunciation/audioCache";
import type { SpeakerId } from "../src/lib/pronunciation/types";

import {
  SPEAKER_VOICE as SPEAKER_VOICE_L01,
  DIALOGUE as DIALOGUE_L01,
  VOCAB as VOCAB_L01,
  PRONUNCIATION as PRONUNCIATION_L01,
  MISSION_SCENARIOS as MISSION_SCENARIOS_L01,
  LISTENING1_TRANSCRIPT as LISTENING1_L01,
  LISTENING2_TRANSCRIPT as LISTENING2_L01,
} from "../src/routes/lecon-01.content";

import {
  SPEAKER_VOICE as SPEAKER_VOICE_L18,
  DIALOGUE as DIALOGUE_L18,
  VOCAB as VOCAB_L18,
  PRONUNCIATION as PRONUNCIATION_L18,
  MISSION_SCENARIOS as MISSION_SCENARIOS_L18,
  LISTENING1_TRANSCRIPT as LISTENING1_L18,
  LISTENING2_TRANSCRIPT as LISTENING2_L18,
} from "../src/routes/lecon-demo-18.content";

import { FLASHCARDS } from "../src/routes/jeux_.flashcards.content";

const LANG = "en-US";
const DEFAULT_RATE = 0.92;
const OUT_DIR = path.join(process.cwd(), "public", "audio");

/** espeak-ng voice + base pitch (0-99, 50 = neutral) per internal remoteVoiceId. */
const ESPEAK_VOICE_BY_REMOTE_ID: Record<string, { voice: string; pitch: number }> = {
  "narrator-neutral": { voice: "en-us", pitch: 50 },
  "young-male-01": { voice: "en-us+m3", pitch: 47 },
  "young-female-01": { voice: "en-us+f3", pitch: 56 },
  "adult-male-01": { voice: "en-us+m3", pitch: 41 },
  "adult-female-01": { voice: "en-us+f4", pitch: 53 },
  "child-01": { voice: "en-us+f5", pitch: 65 },
};

interface RequiredPhrase {
  text: string;
  speaker?: SpeakerId;
}

function dialoguePhrases<S extends string>(
  dialogue: { speaker: S; text: string }[],
  speakerVoice: Record<S, SpeakerId>,
): RequiredPhrase[] {
  return dialogue.map((line) => ({ text: line.text, speaker: speakerVoice[line.speaker] }));
}
function narratorPhrases(texts: string[]): RequiredPhrase[] {
  return texts.map((text) => ({ text }));
}
function listeningPhrases(lines: { text: string; speaker?: SpeakerId }[]): RequiredPhrase[] {
  return lines.map((line) => ({ text: line.text, speaker: line.speaker }));
}
function flashcardPhrases(cards: { en: string; speaker?: SpeakerId }[]): RequiredPhrase[] {
  return cards.map((card) => ({ text: card.en, speaker: card.speaker }));
}

function collectPhrases(): RequiredPhrase[] {
  return [
    ...dialoguePhrases(DIALOGUE_L01, SPEAKER_VOICE_L01),
    ...narratorPhrases(VOCAB_L01.map((v) => v.en)),
    ...narratorPhrases(PRONUNCIATION_L01.map((p) => p.en)),
    ...narratorPhrases(MISSION_SCENARIOS_L01.map((m) => m.phrase)),
    ...listeningPhrases(LISTENING1_L01),
    ...listeningPhrases(LISTENING2_L01),

    ...dialoguePhrases(DIALOGUE_L18, SPEAKER_VOICE_L18),
    ...narratorPhrases(VOCAB_L18.map((v) => v.en)),
    ...narratorPhrases(PRONUNCIATION_L18.map((p) => p.en)),
    ...narratorPhrases(MISSION_SCENARIOS_L18.map((m) => m.phrase)),
    ...listeningPhrases(LISTENING1_L18),
    ...listeningPhrases(LISTENING2_L18),

    ...flashcardPhrases(FLASHCARDS),
  ];
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await execFileSync("test", ["-f", p]);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const required = collectPhrases();
  const seen = new Set<string>();
  let generated = 0;
  let skipped = 0;

  const tmp = await mkdtemp(path.join(tmpdir(), "hitako-audio-"));

  try {
    for (const { text, speaker } of required) {
      const voice = resolveVoice(speaker, LANG, DEFAULT_RATE);
      const key = buildCacheKey(text, voice.remoteVoiceId, voice.lang, voice.rate);
      if (seen.has(key)) continue;
      seen.add(key);

      const hash = key.split(":").pop()!;
      const dir = path.join(OUT_DIR, voice.lang, voice.remoteVoiceId);
      const filePath = path.join(dir, `${hash}.mp3`);

      if (await fileExists(filePath)) {
        skipped++;
        continue;
      }

      await mkdir(dir, { recursive: true });

      const espeak =
        ESPEAK_VOICE_BY_REMOTE_ID[voice.remoteVoiceId] ??
        ESPEAK_VOICE_BY_REMOTE_ID["narrator-neutral"];
      const speed = Math.round(175 * voice.rate);
      const wavPath = path.join(tmp, `${hash}.wav`);

      console.log(`[espeak-ng] "${text}" → ${filePath}`);
      execFileSync("espeak-ng", [
        "-v",
        espeak.voice,
        "-s",
        String(speed),
        "-p",
        String(espeak.pitch),
        "-w",
        wavPath,
        text,
      ]);
      execFileSync("ffmpeg", [
        "-y",
        "-loglevel",
        "error",
        "-i",
        wavPath,
        "-ar",
        "24000",
        "-ac",
        "1",
        "-b:a",
        "48k",
        filePath,
      ]);
      generated++;
    }
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }

  console.log(`\nDone. ${generated} clip(s) generated with espeak-ng, ${skipped} already present.`);
  console.log(
    "Run `npx tsx scripts/generate-audio.ts --audit` (or `bun run audio:audit`) next to fold these into audio-manifest.json.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
