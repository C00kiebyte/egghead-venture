import { ArtSet } from "./types";

const EMOJI_SET: ArtSet = {
  id: "emoji",
  label: "Emoji",
  hero: { name: "Egghead", art: { kind: "emoji", glyph: "🐣" } },
  enemies: [
    { name: "Wacky the Ghost", art: { kind: "emoji", glyph: "👻" } },
    { name: "Stressed Zombie", art: { kind: "emoji", glyph: "🧟" } },
    { name: "Ogre Under the Influence", art: { kind: "emoji", glyph: "🧌" } },
    { name: "Vampire with Hepatitis", art: { kind: "emoji", glyph: "🧛" } },
    { name: "Brr Brr Patapim", art: { kind: "emoji", glyph: "🫈" } },
    { name: "Glock 9", art: { kind: "emoji", glyph: "🧜" } },
  ],
};

export const ART_SETS: ArtSet[] = [EMOJI_SET];
