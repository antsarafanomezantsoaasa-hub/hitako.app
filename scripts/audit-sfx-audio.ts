/**
 * scripts/audit-sfx-audio.ts
 * ==========================
 * Zero-network status check for `public/audio/sfx/**` — the hand-authored
 * UI/game sound effects (correct/wrong answers, lesson/game complete, page
 * turn, congratulations, new message, update, click). This is deliberately
 * separate from `scripts/generate-audio.ts`, which handles TTS-generated
 * pronunciation clips under `public/audio/<lang>/**` instead.
 *
 * Never calls any API — it just checks which of the expected files exist on
 * disk at the exact path the app looks for, and writes the result to
 * `SFX_AUDIO_TODO.md` at the project root.
 *
 * Usage:
 *   bun run audio:sfx:audit
 */
import { access, writeFile } from "node:fs/promises";
import path from "node:path";

// Keep this list in sync with `SFX_NAMES` in src/lib/sound-fx.ts.
const SFX_NAMES = [
  "correct",
  "wrong",
  "lesson-complete",
  "game-complete",
  "page-turn",
  "congratulations",
  "new-message",
  "update",
  "click",
] as const;

const SFX_DIR = path.join(process.cwd(), "public", "audio", "sfx");
const TODO_PATH = path.join(process.cwd(), "SFX_AUDIO_TODO.md");

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const results = await Promise.all(
    SFX_NAMES.map(async (name) => {
      const filename = `${name}.mp3`;
      const fullPath = path.join(SFX_DIR, filename);
      return { name, filename, present: await fileExists(fullPath) };
    }),
  );

  const missing = results.filter((r) => !r.present);
  const present = results.filter((r) => r.present);

  const lines: string[] = [];
  lines.push("# Sound-effect (SFX) status");
  lines.push("");
  lines.push(`_Last run: ${new Date().toISOString()}_`);
  lines.push("");
  lines.push(`- Required files: **${results.length}**`);
  lines.push(`- Already on disk: **${present.length}**`);
  lines.push(`- Still missing: **${missing.length}**`);
  lines.push("");

  if (missing.length === 0) {
    lines.push(
      "Nothing missing — every sound effect has a matching MP3 under `public/audio/sfx/`. 🎉",
    );
  } else {
    lines.push(
      "Still missing (the app plays a synthesized placeholder for these until a real file lands):",
    );
    lines.push("");
    for (const r of missing) {
      lines.push(`- [ ] \`public/audio/sfx/${r.filename}\``);
    }
    lines.push("");
    lines.push("See `public/audio/sfx/README.md` for what each one is for and format guidance.");
  }

  lines.push("");
  await writeFile(TODO_PATH, lines.join("\n") + "\n", "utf-8");

  console.log(
    `Checked ${results.length} sound effects — ${present.length} present, ${missing.length} missing.`,
  );
  console.log(`Wrote ${path.relative(process.cwd(), TODO_PATH)}`);
}

main().catch((err) => {
  console.error("[audit-sfx-audio] failed:", err);
  process.exitCode = 1;
});
