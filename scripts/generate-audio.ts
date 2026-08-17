/**
 * scripts/generate-audio.ts
 * ==========================
 * One-time (then whenever lesson copy changes) batch job that turns every
 * known lesson phrase into a pre-generated MP3 clip under `public/audio/**`,
 * and rebuilds `src/lib/pronunciation/audio-manifest.json` so
 * `staticAudioProvider.ts` can find them at runtime instead of falling back
 * to the device's own (unreliable, low-quality) Web Speech voice.
 *
 * Two modes, auto-selected by whether `AZURE_SPEECH_KEY` is set:
 *
 *   AZURE MODE   (AZURE_SPEECH_KEY set in .env / the environment)
 *     For every required phrase not already present on disk, calls Azure AI
 *     Speech (standard `*Neural` voices, free F0 tier) and writes the MP3.
 *
 *   AUDIT MODE   (no AZURE_SPEECH_KEY — or pass --audit to force it anyway)
 *     Makes zero network calls, ever. Scans `public/audio/**` for files
 *     that already exist at the exact path a phrase needs (e.g. because you
 *     generated them by hand, or with a different TTS vendor) and folds
 *     whatever it finds into the manifest. Anything still missing is
 *     written to `AUDIO_TODO.md` as a checklist with the exact path each
 *     file needs to land at.
 *
 * In both modes the manifest is rebuilt from scratch based on what's
 * currently required + currently on disk, so stale entries never linger
 * after lesson copy changes (a phrase's cache key is a hash of its own
 * text, so editing a line just makes it look "missing" again under a new
 * filename — nothing to clean up by hand).
 *
 * Usage (bun auto-loads .env, no extra setup needed):
 *   bun run audio:build             # auto: Azure if configured, else audit
 *   bun run audio:audit             # force audit mode, no API calls, ever
 *   bun run scripts/generate-audio.ts --audit
 *
 * Adding a new lesson: import its `*.content.ts` exports below (same shape
 * as lecon-01.content.ts / lecon-demo-18.content.ts) and add a handful of
 * lines to `collectPhrases()`.
 */
import { access, mkdir, writeFile } from "node:fs/promises";
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
  SPEAKER_VOICE as SPEAKER_VOICE_L02,
  DIALOGUE as DIALOGUE_L02,
  VOCAB as VOCAB_L02,
  PRONUNCIATION as PRONUNCIATION_L02,
  MISSION_SCENARIOS as MISSION_SCENARIOS_L02,
  LISTENING1_TRANSCRIPT as LISTENING1_L02,
  LISTENING2_TRANSCRIPT as LISTENING2_L02,
} from "../src/routes/lecon-02.content";

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

import {
  LISTENING_TRANSCRIPT as LISTENING_EJ1,
  PRONUNCIATION as PRONUNCIATION_EJ1,
  RESPONSES as RESPONSES_EJ1,
  FORMAL_ALTERNATIVES as FORMAL_ALTERNATIVES_EJ1,
  SPEAKING_LINES as SPEAKING_LINES_EJ1,
} from "../src/routes/expression-du-jour_.jour-1.content";

// ----------------------------------------------------------------------
// 1. Gather every phrase that needs a voice clip, from every lesson.
// ----------------------------------------------------------------------

interface RequiredPhrase {
  text: string;
  speaker?: SpeakerId;
  /** Where this phrase came from — for the AUDIO_TODO.md report only. */
  source: string;
}

/** Dialogue lines carry a lesson-local speaker key (e.g. "John" | "Teacher") that maps to a SpeakerId via that lesson's SPEAKER_VOICE. */
function dialoguePhrases<S extends string>(
  source: string,
  dialogue: { speaker: S; text: string }[],
  speakerVoice: Record<S, SpeakerId>,
): RequiredPhrase[] {
  return dialogue.map((line) => ({ text: line.text, speaker: speakerVoice[line.speaker], source }));
}

/** Vocab / pronunciation / mission phrases have no speaker — they play with the default narrator voice (see resolveVoice's default). */
function narratorPhrases(source: string, texts: string[]): RequiredPhrase[] {
  return texts.map((text) => ({ text, source }));
}

/** Listening transcript lines already carry their own resolved SpeakerId. */
function listeningPhrases(
  source: string,
  lines: { text: string; speaker?: SpeakerId }[],
): RequiredPhrase[] {
  return lines.map((line) => ({ text: line.text, speaker: line.speaker, source }));
}

/**
 * HiTCards flashcards carry their own resolved SpeakerId per card (or none,
 * for the narrator-voiced vocab cards) — same shape as a listening line.
 * This is a *separate* pass from the lesson's own vocab/dialogue phrases
 * above: most flashcard text is short, hand-authored, and doesn't
 * necessarily match any lesson sentence verbatim, so it needs its own
 * pre-generated clips rather than assuming it'll coincide with one.
 */
function flashcardPhrases(
  source: string,
  cards: { en: string; speaker?: SpeakerId }[],
): RequiredPhrase[] {
  return cards.map((card) => ({ text: card.en, speaker: card.speaker, source }));
}

function collectPhrases(): RequiredPhrase[] {
  return [
    ...dialoguePhrases("lecon-01 · dialogue", DIALOGUE_L01, SPEAKER_VOICE_L01),
    ...narratorPhrases(
      "lecon-01 · vocab",
      VOCAB_L01.map((v) => v.en),
    ),
    ...narratorPhrases(
      "lecon-01 · pronunciation",
      PRONUNCIATION_L01.map((p) => p.en),
    ),
    ...narratorPhrases(
      "lecon-01 · mission",
      MISSION_SCENARIOS_L01.map((m) => m.phrase),
    ),
    ...listeningPhrases("lecon-01 · listening 1", LISTENING1_L01),
    ...listeningPhrases("lecon-01 · listening 2", LISTENING2_L01),

    ...dialoguePhrases("lecon-02 · dialogue", DIALOGUE_L02, SPEAKER_VOICE_L02),
    ...narratorPhrases(
      "lecon-02 · vocab",
      VOCAB_L02.map((v) => v.en),
    ),
    ...narratorPhrases(
      "lecon-02 · pronunciation",
      PRONUNCIATION_L02.map((p) => p.en),
    ),
    ...narratorPhrases(
      "lecon-02 · mission",
      MISSION_SCENARIOS_L02.map((m) => m.phrase),
    ),
    ...listeningPhrases("lecon-02 · listening 1", LISTENING1_L02),
    ...listeningPhrases("lecon-02 · listening 2", LISTENING2_L02),

    ...dialoguePhrases("lecon-demo-18 · dialogue", DIALOGUE_L18, SPEAKER_VOICE_L18),
    ...narratorPhrases(
      "lecon-demo-18 · vocab",
      VOCAB_L18.map((v) => v.en),
    ),
    ...narratorPhrases(
      "lecon-demo-18 · pronunciation",
      PRONUNCIATION_L18.map((p) => p.en),
    ),
    ...narratorPhrases(
      "lecon-demo-18 · mission",
      MISSION_SCENARIOS_L18.map((m) => m.phrase),
    ),
    ...listeningPhrases("lecon-demo-18 · listening 1", LISTENING1_L18),
    ...listeningPhrases("lecon-demo-18 · listening 2", LISTENING2_L18),

    ...flashcardPhrases("jeux/flashcards · HiTCards deck", FLASHCARDS),

    // Expression du jour — Day 1: "What's Up?" (source: DAY1_Whats_Up.pptx).
    // Only the lines that actually get a PronunciationButton/ShadowingButton
    // in expression-du-jour_.jour-1.tsx need a clip — the listening dialogue,
    // the 4 pronunciation reps (which already include the PATTERN.full
    // headline phrase, "What's up?"), the 7 response phrases, the 3 formal
    // alternatives, and the 5 speaking-challenge lines. Real-life examples,
    // the review table and the mini-practice prompts are read-only text with
    // no audio button, so they're intentionally left out.
    ...listeningPhrases("expression-du-jour/jour-1 · listening", LISTENING_EJ1),
    ...narratorPhrases("expression-du-jour/jour-1 · pronunciation reps", PRONUNCIATION_EJ1.reps),
    ...narratorPhrases(
      "expression-du-jour/jour-1 · responses",
      RESPONSES_EJ1.map((r) => r.en),
    ),
    ...narratorPhrases("expression-du-jour/jour-1 · formal alternatives", FORMAL_ALTERNATIVES_EJ1),
    ...narratorPhrases("expression-du-jour/jour-1 · speaking challenge", SPEAKING_LINES_EJ1),
  ];
}

// ----------------------------------------------------------------------
// 2. Shared config
// ----------------------------------------------------------------------

const LANG = "en-US";
/** Matches SpeakOptions' default rate in PronunciationService.ts. */
const DEFAULT_RATE = 0.92;

const OUT_DIR = path.join(process.cwd(), "public", "audio");
const MANIFEST_PATH = path.join(
  process.cwd(),
  "src",
  "lib",
  "pronunciation",
  "audio-manifest.json",
);
const TODO_PATH = path.join(process.cwd(), "AUDIO_TODO.md");

const AZURE_KEY = (process.env.AZURE_SPEECH_KEY ?? "").trim();
const AZURE_REGION = (process.env.AZURE_SPEECH_REGION ?? "").trim() || "eastus";
const FORCE_AUDIT = process.argv.includes("--audit");
const MODE: "azure" | "audit" = AZURE_KEY.length > 0 && !FORCE_AUDIT ? "azure" : "audit";

/**
 * Maps internal SpeakerId voice presets (see voices.ts SPEAKER_PRESETS) to
 * actual Azure voice names. Update this if you add a new SpeakerId preset,
 * or want to try different voices for the existing ones.
 */
const AZURE_VOICE_BY_REMOTE_ID: Record<string, string> = {
  "narrator-neutral": "en-US-AriaNeural",
  "young-male-01": "en-US-AndrewNeural",
  "young-female-01": "en-US-JennyNeural",
  "adult-male-01": "en-US-GuyNeural",
  "adult-female-01": "en-US-AriaNeural",
  "child-01": "en-US-AnaNeural",
};

// ----------------------------------------------------------------------
// 3. Azure Neural TTS call
// ----------------------------------------------------------------------

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function synthesizeWithAzure(
  text: string,
  azureVoiceName: string,
  rate: number,
): Promise<Buffer> {
  const ssml = `<speak version="1.0" xml:lang="${LANG}">
    <voice name="${azureVoiceName}">
      <prosody rate="${Math.round((rate - 1) * 100)}%">${escapeXml(text)}</prosody>
    </voice>
  </speak>`;

  const res = await fetch(`https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "hitako-academy-audio-generator",
    },
    body: ssml,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Azure TTS failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

// ----------------------------------------------------------------------
// 4. Helpers
// ----------------------------------------------------------------------

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface PlannedClip {
  key: string;
  text: string;
  source: string;
  remoteVoiceId: string;
  rate: number;
  filePath: string;
  publicUrl: string;
}

// ----------------------------------------------------------------------
// 5. Main
// ----------------------------------------------------------------------

async function main() {
  if (MODE === "azure") {
    console.log(
      `Mode: AZURE (region: ${AZURE_REGION}) — will call the API for anything not already on disk.\n`,
    );
  } else {
    const why = FORCE_AUDIT ? "--audit forced" : "no AZURE_SPEECH_KEY found";
    console.log(
      `Mode: AUDIT (${why}) — no network calls; checking public/audio/** and rebuilding the manifest from what's there.\n`,
    );
  }

  const required = collectPhrases();

  // Dedupe by cache key — the same phrase can legitimately appear more than
  // once across a lesson (e.g. "Thank you" in both VOCAB and DIALOGUE).
  const seen = new Set<string>();
  const planned: PlannedClip[] = [];

  for (const { text, speaker, source } of required) {
    const voice = resolveVoice(speaker, LANG, DEFAULT_RATE);
    const key = buildCacheKey(text, voice.remoteVoiceId, voice.lang, voice.rate);
    if (seen.has(key)) continue;
    seen.add(key);

    const hash = key.split(":").pop()!;
    const dir = path.join(OUT_DIR, voice.lang, voice.remoteVoiceId);
    const filePath = path.join(dir, `${hash}.mp3`);
    const publicUrl = `/audio/${voice.lang}/${voice.remoteVoiceId}/${hash}.mp3`;

    planned.push({
      key,
      text,
      source,
      remoteVoiceId: voice.remoteVoiceId,
      rate: voice.rate,
      filePath,
      publicUrl,
    });
  }

  const manifest: Record<string, string> = {};
  const missing: PlannedClip[] = [];
  let found = 0;
  let generated = 0;

  for (const clip of planned) {
    // { recursive: true } is supposed to make this a silent no-op when the
    // directory already exists (that's the whole point of "recursive").
    // Bun's Windows implementation has a long-standing regression where it
    // throws EEXIST anyway (oven-sh/bun #16466, #16474, #17332) — so we
    // catch and ignore *only* that specific error rather than relying on
    // recursive:true to behave as documented.
    try {
      await mkdir(path.dirname(clip.filePath), { recursive: true });
    } catch (err) {
      const code =
        err && typeof err === "object" && "code" in err
          ? (err as { code?: string }).code
          : undefined;
      if (code !== "EEXIST") throw err;
    }

    if (await fileExists(clip.filePath)) {
      manifest[clip.key] = clip.publicUrl;
      found++;
      continue;
    }

    if (MODE === "azure") {
      const azureVoice = AZURE_VOICE_BY_REMOTE_ID[clip.remoteVoiceId] ?? "en-US-AriaNeural";
      console.log(`Generating [${clip.remoteVoiceId}]: "${clip.text}"`);
      try {
        const audio = await synthesizeWithAzure(clip.text, azureVoice, clip.rate);
        await writeFile(clip.filePath, audio);
        manifest[clip.key] = clip.publicUrl;
        generated++;
        // Be a little gentle on the API instead of firing everything at once.
        await sleep(120);
      } catch (err) {
        console.error(`  ✗ failed: ${err instanceof Error ? err.message : String(err)}`);
        missing.push(clip);
      }
    } else {
      missing.push(clip);
    }
  }

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeAuditReport(planned.length, found, generated, missing);

  const summary =
    `Done. ${planned.length} unique phrase(s) required · ${Object.keys(manifest).length} in manifest` +
    (MODE === "azure"
      ? ` (${found} already on disk, ${generated} generated)`
      : ` (${found} found on disk)`) +
    (missing.length > 0 ? ` · ${missing.length} still missing — see AUDIO_TODO.md` : ".");
  console.log(`\n${summary}`);

  if (MODE === "audit" && missing.length > 0) {
    console.log(
      "Set AZURE_SPEECH_KEY (+ AZURE_SPEECH_REGION) in .env and re-run to generate them, or drop matching files in by hand and re-run to pick them up.",
    );
  }
}

async function writeAuditReport(
  total: number,
  found: number,
  generated: number,
  missing: PlannedClip[],
): Promise<void> {
  const lines: string[] = [];
  lines.push("# Audio generation status");
  lines.push("");
  lines.push(`_Last run: ${new Date().toISOString()} · mode: ${MODE}_`);
  lines.push("");
  lines.push(`- Required phrases: **${total}**`);
  lines.push(`- Already on disk: **${found}**`);
  if (MODE === "azure") lines.push(`- Generated this run: **${generated}**`);
  lines.push(`- Still missing: **${missing.length}**`);
  lines.push("");

  if (missing.length === 0) {
    lines.push(
      "Nothing missing — every required phrase has a matching MP3 under `public/audio/`. 🎉",
    );
  } else {
    lines.push(
      "The phrases below have no MP3 on disk yet, so `staticAudioProvider` will throw for them and " +
        "`PronunciationService` will fall back to the device's own Web Speech voice for just these lines. To fix:",
    );
    lines.push("");
    lines.push(
      "1. Set `AZURE_SPEECH_KEY` / `AZURE_SPEECH_REGION` in `.env` and run `bun run audio:build`, **or**",
    );
    lines.push(
      "2. Generate the clip yourself (any TTS you like) and save it at the exact *expected path* below, then re-run this script (either mode) to fold it into the manifest.",
    );
    lines.push("");
    lines.push("| Source | Text | Voice folder | Expected path |");
    lines.push("|---|---|---|---|");
    for (const clip of missing) {
      const escapedText = clip.text.replace(/\|/g, "\\|");
      lines.push(
        `| ${clip.source} | ${escapedText} | \`${clip.remoteVoiceId}\` | \`public${clip.publicUrl}\` |`,
      );
    }
  }

  lines.push("");
  await writeFile(TODO_PATH, lines.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
