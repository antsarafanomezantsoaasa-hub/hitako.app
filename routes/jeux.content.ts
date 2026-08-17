import type { LucideIcon } from "lucide-react";
import { Blocks, Layers, Mic, Puzzle, Target, Zap } from "lucide-react";

/**
 * Content structure for the /jeux gaming hub ("Kianjan'ny Kilalao").
 *
 * This is scaffolding only: each GameMode below describes a game *mode*
 * (its label, icon, color, and XP reward), not the actual playable content.
 * No question banks, word decks, sentence pools, or audio are wired up yet —
 * that's intentional, it lands per-game later. Flip `status` to "available"
 * once a mode's real data + component exist, and it'll light up on the hub
 * automatically (see src/routes/jeux.tsx).
 *
 * Future per-game content (e.g. `flashcards.content.ts` with the actual word
 * decks) should follow the same pattern already used by
 * lecon-demo-18.content.ts: keep the copy/data separate from the component
 * that renders it.
 */

export type GameStatus = "coming-soon" | "available";

export type GameAccent = "sky" | "amber" | "violet" | "emerald" | "rose" | "orange";

export interface GameMode {
  /** Stable slug — will become the /jeux/{id} route once the game is built. */
  id: string;
  icon: LucideIcon;
  accent: GameAccent;
  title: string;
  tagline: string;
  /** XP awarded per completed round, once scoring is implemented. */
  xp: number;
  status: GameStatus;
}

export const GAME_MODES: GameMode[] = [
  {
    id: "flashcards",
    icon: Layers,
    accent: "sky",
    title: "HiTCards",
    tagline: "Mianara voambolana vaovao amin'ny karatra tsotra sy mora tadidiana.",
    xp: 10,
    status: "available",
  },
  {
    id: "quiz",
    icon: Target,
    accent: "amber",
    title: "HiTFlash",
    tagline: "Valio haingana ireo fanontaniana ary jereo ny fahaizanao.",
    xp: 15,
    status: "coming-soon",
  },
  {
    id: "match",
    icon: Puzzle,
    accent: "violet",
    title: "HiTMatch",
    tagline: "Ampifanaraho ny teny sy ny dikany.",
    xp: 10,
    status: "coming-soon",
  },
  {
    id: "builder",
    icon: Blocks,
    accent: "emerald",
    title: "HiTBuild",
    tagline: "Alaharo araka ny tokony ho izy ireo teny mba hamoronana fehezanteny marina.",
    xp: 20,
    status: "coming-soon",
  },
  {
    id: "speak",
    icon: Mic,
    accent: "rose",
    title: "HiTSpeak",
    tagline: "Mampihatra ny fitenenana amin'ny alalan'ny fanononana teny sy fehezanteny.",
    xp: 15,
    status: "coming-soon",
  },
  {
    id: "speedrun",
    icon: Zap,
    accent: "orange",
    title: "HiTRush",
    tagline: "Mifaninàna amin'ny fotoana ary miezaha hahazo ny isa ambony indrindra.",
    xp: 25,
    status: "coming-soon",
  },
];
